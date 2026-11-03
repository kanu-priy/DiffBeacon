import os
import json
import logging
from pathlib import Path
from django.conf import settings
from django.db import connection
from django.http import HttpResponseRedirect
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.analysis.serializers import AnalysisRunSerializer
from apps.workspaces.models import Workspace
from .github_service import GitHubIntegrationError, GitHubService
from .models import GitHubAnalysisJob, GitHubInstallation, GitHubPullRequest, GitHubRepository

logger = logging.getLogger(__name__)


class GitHubAnalyzePRView(APIView):
    """
    POST /api/v1/integrations/github/analyze-pr/
    Ingests and runs behavioral impact analysis on any public or private GitHub PR.
    """

    def post(self, request):
        workspace_id = request.data.get("workspace_id")
        pr_reference = request.data.get("pr_reference")
        token = request.data.get("token")

        if not pr_reference:
            return Response(
                {"error": "Missing 'pr_reference'. Example: 'https://github.com/owner/repo/pull/123' or 'owner/repo#123'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        workspace = None
        if workspace_id:
            try:
                workspace = Workspace.objects.get(id=workspace_id)
            except Workspace.DoesNotExist:
                return Response({"error": "Workspace not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Fallback or auto-create workspace for this repository
            try:
                owner, repo, _ = GitHubService.parse_pr_reference(pr_reference)
                workspace, _ = Workspace.objects.get_or_create(
                    slug=f"github-{owner}-{repo}".lower(),
                    defaults={
                        "name": f"{owner}/{repo}",
                        "description": f"Automated workspace imported from GitHub repository {owner}/{repo}.",
                    },
                )
            except Exception as e:
                workspace = Workspace.objects.first()

        try:
            analysis = GitHubService.ingest_and_analyze_pr(
                workspace=workspace,
                pr_reference=pr_reference,
                token=token,
            )
            serializer = AnalysisRunSerializer(analysis)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except GitHubIntegrationError as e:
            return Response({"error": str(e)}, status=e.status_code)
        except Exception as exc:
            logger.exception("Unexpected error during GitHub PR analysis")
            return Response(
                {"error": f"Failed to ingest and analyze GitHub PR: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GitHubWebhookView(APIView):
    """
    POST /api/v1/integrations/github/webhook/
    Listens for GitHub 'pull_request' webhook events (opened, synchronize).
    Verifies HMAC SHA-256 signature if GITHUB_WEBHOOK_SECRET is configured.
    """

    def post(self, request):
        event = request.headers.get("X-GitHub-Event")
        signature = request.headers.get("X-Hub-Signature-256")
        webhook_secret = getattr(settings, "GITHUB_WEBHOOK_SECRET", "") or os.environ.get("GITHUB_WEBHOOK_SECRET", "")

        if webhook_secret:
            if not GitHubService.verify_webhook_signature(request.body, signature, webhook_secret):
                return Response({"error": "Invalid webhook signature."}, status=status.HTTP_403_FORBIDDEN)

        if event == "ping":
            return Response({"status": "pong", "message": "DiffBeacon webhook connection active."})

        if event != "pull_request":
            return Response({"status": "ignored", "reason": f"Event '{event}' not handled."}, status=status.HTTP_200_OK)

        payload = json.loads(request.body.decode("utf-8"))
        action = payload.get("action")

        if action not in ("opened", "synchronize", "reopened"):
            return Response({"status": "ignored", "action": action})

        pr_data = payload.get("pull_request", {})
        repo_data = payload.get("repository", {})
        owner = repo_data.get("owner", {}).get("login")
        repo = repo_data.get("name")
        pr_number = pr_data.get("number")

        if not owner or not repo or not pr_number:
            return Response({"error": "Incomplete pull_request payload."}, status=status.HTTP_400_BAD_REQUEST)

        repository = GitHubRepository.objects.filter(full_name=f"{owner}/{repo}", status="active").order_by("-created_at").first()
        if not repository:
            return Response({"status": "ignored", "reason": "Repository is not connected to DiffBeacon."}, status=status.HTTP_202_ACCEPTED)

        pull_request, created = GitHubPullRequest.objects.get_or_create(
            repository=repository,
            github_pr_id=pr_data.get("id"),
            defaults={
                "installation": repository.installation,
                "number": pr_number,
                "title": pr_data.get("title", f"PR #{pr_number}"),
                "state": pr_data.get("state", "open"),
                "base_ref": pr_data.get("base", {}).get("ref", ""),
                "base_sha": pr_data.get("base", {}).get("sha", ""),
                "head_ref": pr_data.get("head", {}).get("ref", ""),
                "head_sha": pr_data.get("head", {}).get("sha", ""),
                "html_url": pr_data.get("html_url", ""),
                "last_event": action,
                "analysis_status": "queued",
            },
        )

        if not created and pull_request.last_event == action and pull_request.analysis_status in {"queued", "analyzing"}:
            return Response({"status": "duplicate", "reason": "Webhook already queued for this pull request."}, status=status.HTTP_202_ACCEPTED)

        pull_request.number = pr_number
        pull_request.title = pr_data.get("title", pull_request.title)
        pull_request.state = pr_data.get("state", pull_request.state)
        pull_request.base_ref = pr_data.get("base", {}).get("ref", pull_request.base_ref)
        pull_request.base_sha = pr_data.get("base", {}).get("sha", pull_request.base_sha)
        pull_request.head_ref = pr_data.get("head", {}).get("ref", pull_request.head_ref)
        pull_request.head_sha = pr_data.get("head", {}).get("sha", pull_request.head_sha)
        pull_request.html_url = pr_data.get("html_url", pull_request.html_url)
        pull_request.last_event = action
        pull_request.analysis_status = "queued"
        pull_request.save(update_fields=["number", "title", "state", "base_ref", "base_sha", "head_ref", "head_sha", "html_url", "last_event", "analysis_status", "updated_at"])

        job = GitHubAnalysisJob.objects.create(
            installation=repository.installation,
            repository=repository,
            pull_request=pull_request,
            analysis_report=None,
            status="queued",
            base_sha=pull_request.base_sha,
            head_sha=pull_request.head_sha,
            payload={"event": action, "repository": repo, "owner": owner, "pr_number": pr_number},
        )

        return Response(
            {
                "status": "queued",
                "job_id": str(job.id),
                "pull_request_id": str(pull_request.id),
                "repository": repository.full_name,
                "pr_number": pr_number,
                "base_sha": pull_request.base_sha,
                "head_sha": pull_request.head_sha,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class GitHubConnectionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        installation = GitHubInstallation.objects.filter(user=request.user, is_active=True).order_by("-created_at").first()
        repository_qs = GitHubRepository.objects.filter(installation=installation).order_by("full_name") if installation else GitHubRepository.objects.none()
        selected_repos = list(repository_qs.filter(selected=True).values("id", "full_name", "owner", "name", "visibility", "default_branch", "selected", "status"))

        return Response(
            {
                "connected": bool(installation),
                "status": installation.status if installation else "not_connected",
                "installation_id": str(installation.id) if installation else None,
                "account_login": installation.account_login if installation else None,
                "requires_setup": not bool(GitHubService.build_installation_url()),
                "connect_url": GitHubService.build_installation_url(),
                "selected_repositories": selected_repos,
                "repository_count": len(selected_repos),
            }
        )


class GitHubConnectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        install_url = GitHubService.build_installation_url()
        if not install_url:
            return Response(
                {
                    "connected": False,
                    "status": "not_configured",
                    "message": "GitHub App is not configured. Set GITHUB_APP_SLUG, GITHUB_APP_ID, and GITHUB_APP_PRIVATE_KEY before connecting.",
                    "install_url": "",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"connected": False, "status": "ready", "install_url": install_url})


class GitHubInstallCallbackView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        installation_id = request.GET.get("installation_id")
        if not installation_id:
            return Response({"error": "Missing GitHub installation_id."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            installation_id_int = int(installation_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid GitHub installation_id."}, status=status.HTTP_400_BAD_REQUEST)

        installation, created = GitHubInstallation.objects.get_or_create(
            user=request.user,
            installation_id=installation_id_int,
            defaults={
                "account_login": request.GET.get("account_login", ""),
                "account_type": request.GET.get("account_type", "User"),
                "installation_url": GitHubService.build_installation_url(),
                "status": "connected",
                "is_active": True,
                "connected_at": timezone.now(),
            },
        )
        installation.status = "connected"
        installation.is_active = True
        installation.connected_at = installation.connected_at or timezone.now()
        installation.installation_url = GitHubService.build_installation_url()
        installation.updated_at = timezone.now()
        installation.save(update_fields=["status", "is_active", "connected_at", "installation_url", "updated_at"])

        try:
            repos = GitHubService.list_installation_repositories(installation_id_int)
            for repo in repos:
                GitHubRepository.objects.update_or_create(
                    installation=installation,
                    github_id=repo["id"],
                    defaults={
                        "owner": repo["owner"],
                        "name": repo["name"],
                        "full_name": repo["full_name"],
                        "default_branch": repo.get("default_branch", ""),
                        "visibility": repo.get("visibility", "public"),
                        "is_private": bool(repo.get("is_private", False)),
                        "html_url": repo.get("html_url", ""),
                        "selected": True,
                        "status": "active",
                        "last_synced_at": timezone.now(),
                    },
                )
        except GitHubIntegrationError:
            installation.status = "error"
            installation.is_active = True
            installation.save(update_fields=["status", "is_active", "updated_at"])

        redirect_url = request.GET.get("redirect_url") or os.environ.get("GITHUB_APP_REDIRECT_URL", "") or getattr(settings, "GITHUB_APP_REDIRECT_URL", "")
        if redirect_url:
            redirect_target = redirect_url
            if "?" in redirect_target:
                redirect_target = f"{redirect_target}&installation_id={installation_id_int}"
            else:
                redirect_target = f"{redirect_target}?installation_id={installation_id_int}"
            return HttpResponseRedirect(redirect_target)

        return Response(
            {
                "connected": True,
                "status": installation.status,
                "installation_id": str(installation.id),
                "github_installation_id": installation_id_int,
                "message": "GitHub App installation linked to DiffBeacon.",
                "created": created,
            }
        )


class GitHubRepositorySelectionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        installation = GitHubInstallation.objects.filter(user=request.user, is_active=True).order_by("-created_at").first()
        if not installation:
            return Response({"connected": False, "repositories": []})

        repositories = list(
            GitHubRepository.objects.filter(installation=installation).order_by("full_name").values(
                "id", "full_name", "owner", "name", "visibility", "default_branch", "selected", "status", "html_url", "is_private"
            )
        )
        return Response({"connected": True, "repositories": repositories})

    def post(self, request):
        installation = GitHubInstallation.objects.filter(user=request.user, is_active=True).order_by("-created_at").first()
        if not installation:
            return Response({"error": "No active GitHub installation found."}, status=status.HTTP_404_NOT_FOUND)

        repo_ids = request.data.get("repository_ids") or request.data.get("repositories") or []
        selected_ids = set()
        if isinstance(repo_ids, list):
            selected_ids = {str(item) if not isinstance(item, (int, str)) else str(item) for item in repo_ids}
        elif isinstance(repo_ids, dict):
            selected_ids = {str(repo_ids.get("id"))}

        GitHubRepository.objects.filter(installation=installation).update(selected=False)
        if selected_ids:
            GitHubRepository.objects.filter(installation=installation, id__in=list(selected_ids)).update(selected=True)

        repositories = list(
            GitHubRepository.objects.filter(installation=installation).order_by("full_name").values(
                "id", "full_name", "owner", "name", "visibility", "default_branch", "selected", "status", "html_url", "is_private"
            )
        )
        return Response({"connected": True, "updated": True, "repositories": repositories})


class GitHubDisconnectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        installation = GitHubInstallation.objects.filter(user=request.user, is_active=True).order_by("-created_at").first()
        if not installation:
            return Response({"status": "not_connected"})

        installation.is_active = False
        installation.status = "disconnected"
        installation.disconnected_at = timezone.now()
        installation.save(update_fields=["is_active", "status", "disconnected_at", "updated_at"])
        GitHubRepository.objects.filter(installation=installation).update(status="revoked", selected=False)
        return Response({"status": "disconnected", "message": "GitHub connection removed from DiffBeacon."})


class SystemHealthView(APIView):
    """
    GET /api/v1/health/
    Production health check probing DB, filesystem storage, and engine status.
    """

    def get(self, request):
        health: dict = {
            "status": "healthy",
            "version": "1.4.0",
            "checks": {},
        }

        # 1. Database Connectivity Check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                health["checks"]["database"] = "ok"
        except Exception as e:
            health["status"] = "degraded"
            health["checks"]["database"] = f"error: {str(e)}"

        # 2. Storage Directory Check
        try:
            storage_path = Path(getattr(settings, "STORAGE_DIR", "storage/snapshots"))
            storage_path.mkdir(parents=True, exist_ok=True)
            test_file = storage_path / ".healthcheck_tmp"
            test_file.write_text("ok")
            test_file.unlink()
            health["checks"]["storage"] = "ok"
        except Exception as e:
            health["status"] = "degraded"
            health["checks"]["storage"] = f"error: {str(e)}"

        # 3. Active AI Provider Status
        provider_name = getattr(settings, "LLM_PROVIDER", "mock")
        health["checks"]["ai_provider"] = {
            "name": provider_name,
            "deterministic_fallback_ready": True,
        }

        status_code = status.HTTP_200_OK if health["status"] == "healthy" else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(health, status=status_code)
