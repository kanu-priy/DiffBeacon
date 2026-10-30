import os
import json
import logging
from django.conf import settings
from django.db import connection
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.workspaces.models import Workspace
from apps.analysis.serializers import AnalysisRunSerializer
from .github_service import GitHubService, GitHubIntegrationError

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

        # Retrieve or create workspace
        workspace, _ = Workspace.objects.get_or_create(
            slug=f"github-{owner}-{repo}".lower(),
            defaults={
                "name": f"{owner}/{repo}",
                "description": f"Automated CI workspace for {owner}/{repo}.",
            },
        )

        try:
            analysis = GitHubService.ingest_and_analyze_pr(
                workspace=workspace,
                pr_reference=f"{owner}/{repo}#{pr_number}",
            )
            return Response(
                {
                    "status": "analyzed",
                    "analysis_id": str(analysis.id),
                    "deltas_detected": analysis.deltas.count(),
                    "contracts_detected": analysis.contracts.count(),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            logger.error(f"Webhook processing error for PR #{pr_number}: {exc}")
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
