import hashlib
import hmac
import json
import os
import re
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import jwt
from django.conf import settings

from apps.analysis.engine import AnalysisPipelineEngine
from apps.analysis.models import AnalysisRun
from apps.ingestion.archiver import SafeArchiveExtractor
from apps.snapshots.models import SourceFile, SourceSnapshot
from apps.workspaces.models import Workspace


class GitHubIntegrationError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code


class GitHubService:
    """GitHub integration helpers for PAT-based manual use and GitHub App installs."""

    PR_URL_REGEX = re.compile(
        r'(?:https?://github\.com/)?([A-Za-z0-9_.\-]+)/([A-Za-z0-9_.\-]+)(?:/pull/|#)(\d+)'
    )

    @classmethod
    def get_app_config(cls) -> Dict[str, str]:
        app_slug = os.environ.get("GITHUB_APP_SLUG", "") or getattr(settings, "GITHUB_APP_SLUG", "")
        app_id = os.environ.get("GITHUB_APP_ID", "") or getattr(settings, "GITHUB_APP_ID", "")
        client_id = os.environ.get("GITHUB_APP_CLIENT_ID", "") or getattr(settings, "GITHUB_APP_CLIENT_ID", "")
        client_secret = os.environ.get("GITHUB_APP_CLIENT_SECRET", "") or getattr(settings, "GITHUB_APP_CLIENT_SECRET", "")
        webhook_secret = os.environ.get("GITHUB_WEBHOOK_SECRET", "") or getattr(settings, "GITHUB_WEBHOOK_SECRET", "")
        return {
            "app_slug": app_slug,
            "app_id": app_id,
            "client_id": client_id,
            "client_secret": client_secret,
            "webhook_secret": webhook_secret,
            "private_key": cls._read_private_key(),
        }

    @classmethod
    def build_installation_url(cls) -> str:
        app_slug = cls.get_app_config().get("app_slug")
        if not app_slug:
            return ""
        return f"https://github.com/apps/{app_slug}/installations/new"

    @classmethod
    def _read_private_key(cls) -> str:
        raw_key = os.environ.get("GITHUB_APP_PRIVATE_KEY", "") or getattr(settings, "GITHUB_APP_PRIVATE_KEY", "")
        if not raw_key:
            raw_key = os.environ.get("GITHUB_APP_PRIVATE_KEY_B64", "") or getattr(settings, "GITHUB_APP_PRIVATE_KEY_B64", "")
            if raw_key:
                import base64
                try:
                    return base64.b64decode(raw_key).decode("utf-8")
                except Exception:
                    return raw_key
        return raw_key.replace("\\n", "\n").strip()

    @classmethod
    def parse_pr_reference(cls, pr_ref: str) -> Tuple[str, str, int]:
        match = cls.PR_URL_REGEX.search(pr_ref.strip())
        if not match:
            raise GitHubIntegrationError(
                f"Invalid GitHub Pull Request reference '{pr_ref}'. Expected format: 'owner/repo#123' or 'https://github.com/owner/repo/pull/123'."
            )
        owner, repo, pr_num = match.groups()
        return owner, repo, int(pr_num)

    @classmethod
    def _make_request(cls, url: str, token: Optional[str] = None, method: str = "GET", payload: Optional[Dict[str, Any]] = None) -> Any:
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "DiffBeacon-Intelligence-Engine/1.4",
        }
        api_token = token or os.environ.get("GITHUB_TOKEN", "") or getattr(settings, "GITHUB_TOKEN", "")
        if api_token:
            headers["Authorization"] = f"Bearer {api_token}" if api_token.startswith("ghs_") or api_token.startswith("ghu_") or api_token.startswith("gho_") else f"token {api_token}"

        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                charset = resp.headers.get_content_charset() or "utf-8"
                body = resp.read().decode(charset)
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            details = e.read().decode("utf-8", errors="replace")
            if e.code == 404:
                raise GitHubIntegrationError(
                    "GitHub Pull Request or repository not found. If this repository is private, please provide a valid GitHub token or configure a GitHub App installation.",
                    status_code=404,
                )
            if e.code == 401:
                raise GitHubIntegrationError("GitHub API authorization failed. Check your token or GitHub App installation permissions.", status_code=401)
            if e.code == 403:
                raise GitHubIntegrationError(f"GitHub API access denied or rate limited: {details[:180]}", status_code=403)
            raise GitHubIntegrationError(f"GitHub API error: HTTP {e.code}: {details[:180]}", status_code=e.code)
        except urllib.error.URLError as e:
            raise GitHubIntegrationError(f"Network error connecting to GitHub: {str(e.reason)}", status_code=503)

    @classmethod
    def get_pr_metadata(cls, owner: str, repo: str, pull_number: int, token: Optional[str] = None) -> Dict[str, Any]:
        url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pull_number}"
        data = cls._make_request(url, token)
        return {
            "title": data.get("title", ""),
            "state": data.get("state", "open"),
            "owner": owner,
            "repo": repo,
            "number": pull_number,
            "base_ref": data["base"]["ref"],
            "base_sha": data["base"]["sha"],
            "head_ref": data["head"]["ref"],
            "head_sha": data["head"]["sha"],
            "html_url": data.get("html_url", ""),
            "author": data.get("user", {}).get("login", "unknown"),
            "changed_files_count": data.get("changed_files", 0),
        }

    @classmethod
    def get_pr_files(cls, owner: str, repo: str, pull_number: int, token: Optional[str] = None) -> List[Dict[str, Any]]:
        url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pull_number}/files?per_page=100"
        return cls._make_request(url, token)

    @classmethod
    def _fetch_file_content(cls, owner: str, repo: str, commit_sha: str, path: str, token: Optional[str] = None) -> Optional[str]:
        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{commit_sha}/{path}"
        headers = {"User-Agent": "DiffBeacon-Intelligence-Engine/1.4"}
        api_token = token or os.environ.get("GITHUB_TOKEN", "") or getattr(settings, "GITHUB_TOKEN", "")
        if api_token:
            headers["Authorization"] = f"Bearer {api_token}" if api_token.startswith("ghs_") or api_token.startswith("ghu_") or api_token.startswith("gho_") else f"token {api_token}"

        req = urllib.request.Request(raw_url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError:
            return None
        except Exception:
            return None

    @classmethod
    def verify_webhook_signature(cls, payload_body: bytes, signature_header: Optional[str], secret: str) -> bool:
        if not signature_header or not secret:
            return False
        if not signature_header.startswith("sha256="):
            return False

        expected_sig = "sha256=" + hmac.new(secret.encode("utf-8"), payload_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_sig, signature_header)

    @classmethod
    def _app_jwt(cls) -> str:
        key = cls.get_app_config().get("private_key")
        app_id = cls.get_app_config().get("app_id")
        if not key or not app_id:
            raise GitHubIntegrationError("GitHub App is not configured. Set GITHUB_APP_ID, GITHUB_APP_SLUG and GITHUB_APP_PRIVATE_KEY.", status_code=503)

        now = int(time.time())
        payload = {"iat": now - 60, "exp": now + 600, "iss": app_id}
        return jwt.encode(payload, key, algorithm="RS256")

    @classmethod
    def get_installation_access_token(cls, installation_id: int) -> str:
        app_jwt = cls._app_jwt()
        url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
        response = cls._make_request(url, token=app_jwt, method="POST")
        token = response.get("token")
        if not token:
            raise GitHubIntegrationError("GitHub App installation token was not returned by GitHub.", status_code=502)
        return token

    @classmethod
    def list_installation_repositories(cls, installation_id: int) -> List[Dict[str, Any]]:
        token = cls.get_installation_access_token(installation_id)
        response = cls._make_request("https://api.github.com/installation/repositories", token=token)
        items = response.get("repositories", [])
        return [
            {
                "id": repository.get("id"),
                "owner": repository.get("owner", {}).get("login", ""),
                "name": repository.get("name", ""),
                "full_name": repository.get("full_name", ""),
                "default_branch": repository.get("default_branch", ""),
                "visibility": "private" if repository.get("private") else "public",
                "is_private": bool(repository.get("private")),
                "html_url": repository.get("html_url", ""),
            }
            for repository in items
        ]

    @classmethod
    def ingest_and_analyze_pr(
        cls,
        workspace: Workspace,
        pr_reference: str,
        token: Optional[str] = None,
    ) -> AnalysisRun:
        """Download a PR's base/head trees and run the DiffBeacon analysis engine."""
        owner, repo, pr_num = cls.parse_pr_reference(pr_reference)
        pr_meta = cls.get_pr_metadata(owner, repo, pr_num, token)
        files = cls.get_pr_files(owner, repo, pr_num, token)

        storage_root = Path(getattr(settings, "STORAGE_DIR", "storage/snapshots")) / "github" / f"{owner}_{repo}" / str(pr_num)
        base_dir = storage_root / "base"
        head_dir = storage_root / "head"
        base_dir.mkdir(parents=True, exist_ok=True)
        head_dir.mkdir(parents=True, exist_ok=True)

        for file_info in files:
            file_path = file_info["filename"]
            status = file_info["status"]

            if status != "removed":
                head_content = cls._fetch_file_content(owner, repo, pr_meta["head_sha"], file_path, token)
                if head_content is not None:
                    dest = head_dir / file_path
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    with open(dest, "w", encoding="utf-8") as f:
                        f.write(head_content)

            if status != "added":
                base_content = cls._fetch_file_content(owner, repo, pr_meta["base_sha"], file_path, token)
                if base_content is not None:
                    dest = base_dir / file_path
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    with open(dest, "w", encoding="utf-8") as f:
                        f.write(base_content)

        extractor = SafeArchiveExtractor()

        base_manifest = extractor.scan_directory(str(base_dir))
        base_snap = SourceSnapshot.objects.create(
            workspace=workspace,
            label=f"{pr_meta['base_ref']} ({pr_meta['base_sha'][:7]})",
            storage_path=str(base_dir),
            file_count=len(base_manifest),
            total_bytes=sum(os.path.getsize(m["absolute_path"]) for m in base_manifest if os.path.exists(m["absolute_path"])),
            ingestion_status="ready",
        )
        for manifest_entry in base_manifest:
            SourceFile.objects.create(
                snapshot=base_snap,
                relative_path=manifest_entry["relative_path"],
                content_hash=manifest_entry["content_hash"],
                language=manifest_entry["language"],
                file_classification=manifest_entry["file_classification"],
                line_count=manifest_entry["line_count"],
                parse_status=manifest_entry["parse_status"],
            )

        head_manifest = extractor.scan_directory(str(head_dir))
        head_snap = SourceSnapshot.objects.create(
            workspace=workspace,
            label=f"PR #{pr_num}: {pr_meta['title'][:40]}",
            storage_path=str(head_dir),
            file_count=len(head_manifest),
            total_bytes=sum(os.path.getsize(m["absolute_path"]) for m in head_manifest if os.path.exists(m["absolute_path"])),
            ingestion_status="ready",
        )
        for manifest_entry in head_manifest:
            SourceFile.objects.create(
                snapshot=head_snap,
                relative_path=manifest_entry["relative_path"],
                content_hash=manifest_entry["content_hash"],
                language=manifest_entry["language"],
                file_classification=manifest_entry["file_classification"],
                line_count=manifest_entry["line_count"],
                parse_status=manifest_entry["parse_status"],
            )

        analysis = AnalysisRun.objects.create(
            workspace=workspace,
            base_snapshot=base_snap,
            head_snapshot=head_snap,
            status="running",
            engine_version="1.4.0",
            ai_provider_name=getattr(settings, "LLM_PROVIDER", "mock"),
        )

        engine = AnalysisPipelineEngine()
        engine.run_analysis(str(analysis.id))
        return analysis
