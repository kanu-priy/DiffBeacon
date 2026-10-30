import os
import re
import json
import hmac
import hashlib
import tempfile
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

from django.conf import settings
from apps.workspaces.models import Workspace
from apps.snapshots.models import SourceSnapshot, SourceFile
from apps.analysis.models import AnalysisRun
from apps.analysis.engine import AnalysisPipelineEngine
from apps.ingestion.archiver import SafeArchiveExtractor


class GitHubIntegrationError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code


class GitHubService:
    """
    Third-party integration service with GitHub REST API and Webhooks.
    Supports parsing PR URLs, fetching PR diffs/files, ingesting them into snapshots,
    and triggering automated change-impact analysis.
    """

    PR_URL_REGEX = re.compile(
        r'(?:https?://github\.com/)?([A-Za-z0-9_.\-]+)/([A-Za-z0-9_.\-]+)(?:/pull/|#)(\d+)'
    )

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
    def _make_request(cls, url: str, token: Optional[str] = None) -> Any:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DiffBeacon-Intelligence-Engine/1.4",
        }
        api_token = token or os.environ.get("GITHUB_TOKEN", "") or getattr(settings, "GITHUB_TOKEN", "")
        if api_token:
            headers["Authorization"] = f"token {api_token}"

        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                charset = resp.headers.get_content_charset() or "utf-8"
                return json.loads(resp.read().decode(charset))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise GitHubIntegrationError(
                    "GitHub Pull Request or repository not found. If this repository is private, please provide a valid GitHub Personal Access Token.",
                    status_code=404,
                )
            elif e.code == 401:
                raise GitHubIntegrationError("GitHub API authorization failed. Check your Personal Access Token.", status_code=401)
            elif e.code == 403:
                raise GitHubIntegrationError("GitHub API rate limit exceeded or access forbidden.", status_code=403)
            else:
                raise GitHubIntegrationError(f"GitHub API error: HTTP {e.code} ({e.reason})", status_code=e.code)
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
            headers["Authorization"] = f"token {api_token}"

        req = urllib.request.Request(raw_url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError:
            # File might be deleted or not present at this commit
            return None
        except Exception:
            return None

    @classmethod
    def ingest_and_analyze_pr(
        cls,
        workspace: Workspace,
        pr_reference: str,
        token: Optional[str] = None,
    ) -> AnalysisRun:
        """
        End-to-end pull request ingestion from GitHub:
        1. Resolves PR metadata and diff files.
        2. Reconstructs base and head file snapshots.
        3. Creates persistent SourceSnapshots.
        4. Runs full 12-stage Change Story analysis pipeline.
        """
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
            status = file_info["status"]  # modified, added, removed, renamed

            # Head file
            if status != "removed":
                head_content = cls._fetch_file_content(owner, repo, pr_meta["head_sha"], file_path, token)
                if head_content is not None:
                    dest = head_dir / file_path
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    with open(dest, "w", encoding="utf-8") as f:
                        f.write(head_content)

            # Base file
            if status != "added":
                base_content = cls._fetch_file_content(owner, repo, pr_meta["base_sha"], file_path, token)
                if base_content is not None:
                    dest = base_dir / file_path
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    with open(dest, "w", encoding="utf-8") as f:
                        f.write(base_content)

        extractor = SafeArchiveExtractor()

        # Ingest Base Snapshot
        base_manifest = extractor.scan_directory(str(base_dir))
        base_snap = SourceSnapshot.objects.create(
            workspace=workspace,
            label=f"{pr_meta['base_ref']} ({pr_meta['base_sha'][:7]})",
            storage_path=str(base_dir),
            file_count=len(base_manifest),
            total_bytes=sum(os.path.getsize(m["absolute_path"]) for m in base_manifest if os.path.exists(m["absolute_path"])),
            ingestion_status="ready",
        )
        for m in base_manifest:
            SourceFile.objects.create(
                snapshot=base_snap,
                relative_path=m["relative_path"],
                content_hash=m["content_hash"],
                language=m["language"],
                file_classification=m["file_classification"],
                line_count=m["line_count"],
                parse_status=m["parse_status"],
            )

        # Ingest Head Snapshot
        head_manifest = extractor.scan_directory(str(head_dir))
        head_snap = SourceSnapshot.objects.create(
            workspace=workspace,
            label=f"PR #{pr_num}: {pr_meta['title'][:40]}",
            storage_path=str(head_dir),
            file_count=len(head_manifest),
            total_bytes=sum(os.path.getsize(m["absolute_path"]) for m in head_manifest if os.path.exists(m["absolute_path"])),
            ingestion_status="ready",
        )
        for m in head_manifest:
            SourceFile.objects.create(
                snapshot=head_snap,
                relative_path=m["relative_path"],
                content_hash=m["content_hash"],
                language=m["language"],
                file_classification=m["file_classification"],
                line_count=m["line_count"],
                parse_status=m["parse_status"],
            )

        # Create Analysis Run
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

    @classmethod
    def verify_webhook_signature(cls, payload_body: bytes, signature_header: Optional[str], secret: str) -> bool:
        if not signature_header or not secret:
            return False
        if not signature_header.startswith("sha256="):
            return False

        expected_sig = "sha256=" + hmac.new(secret.encode("utf-8"), payload_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_sig, signature_header)
