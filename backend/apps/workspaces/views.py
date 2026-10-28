import os
import shutil
from pathlib import Path
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView

from .models import Workspace
from .serializers import WorkspaceSerializer
from apps.snapshots.models import SourceSnapshot, SourceFile
from apps.analysis.models import AnalysisRun
from apps.ingestion.archiver import SafeArchiveExtractor
from apps.analysis.engine import AnalysisPipelineEngine


class DemoStatusView(APIView):
    """
    GET /api/v1/demo/
    Returns whether demo is seeded and lists sample scenarios.
    """

    def get(self, request):
        fixtures_dir = getattr(settings, "FIXTURES_DIR", None)
        demo_available = fixtures_dir and Path(fixtures_dir).exists()

        demo_ws = Workspace.objects.filter(is_demo=True).first()
        latest_analysis = None
        if demo_ws:
            latest_analysis = AnalysisRun.objects.filter(
                workspace=demo_ws, status="completed"
            ).first()

        sample_scenarios = []
        stats = {
            "deltas": 0,
            "contracts": 0,
            "unknowns": 0,
            "scenarios": 0,
            "verification_cases": 0,
        }
        if latest_analysis:
            stats = {
                "deltas": latest_analysis.deltas.count(),
                "contracts": latest_analysis.contracts.count(),
                "unknowns": latest_analysis.unknowns.count(),
                "scenarios": latest_analysis.scenarios.count(),
                "verification_cases": latest_analysis.verification_cases.count(),
            }
            sample_scenarios = [
                {
                    "id": str(s.id),
                    "question": s.question,
                    "target_symbol": s.target_symbol,
                }
                for s in latest_analysis.scenarios.all()[:8]
            ]

        if not sample_scenarios:
            sample_scenarios = [
                {
                    "id": "scenario-missing-dept",
                    "question": "What happens if a request omits department_id now?",
                    "target_symbol": "api.serializers.EmployeeCreateSerializer",
                },
                {
                    "id": "scenario-salary-bounds",
                    "question": "How does salary validation behave between versions?",
                    "target_symbol": "api.services.payroll.validate_compensation",
                },
            ]

        return Response(
            {
                "demo_available": bool(demo_available),
                "is_seeded": demo_ws is not None and latest_analysis is not None,
                "workspace_id": str(demo_ws.id) if demo_ws else None,
                "analysis_id": str(latest_analysis.id) if latest_analysis else None,
                "project_name": demo_ws.name if demo_ws else "BeaconWorks API",
                "base_version": latest_analysis.base_snapshot.label if latest_analysis else "v1.0-baseline",
                "head_version": latest_analysis.head_snapshot.label if latest_analysis else "v1.1-department-update",
                "sample_scenarios": sample_scenarios,
                "stats": stats,
                "engine_version": latest_analysis.engine_version if latest_analysis else None,
                "last_completed_at": latest_analysis.completed_at.isoformat() if latest_analysis and latest_analysis.completed_at else None,
            }
        )


class DemoShowcaseView(APIView):
    """
    GET /api/v1/demo/showcase/
    Live change stories assembled from the latest completed demo analysis.
    """

    BREAKING_CATEGORIES = {"deleted_symbol", "validation", "permission"}

    def get(self, request):
        demo_ws = Workspace.objects.filter(is_demo=True).first()
        analysis = None
        if demo_ws:
            analysis = AnalysisRun.objects.filter(
                workspace=demo_ws, status="completed"
            ).first()

        if not analysis:
            return Response(
                {
                    "is_seeded": False,
                    "analysis_id": None,
                    "workspace_id": str(demo_ws.id) if demo_ws else None,
                    "project_name": "BeaconWorks API",
                    "base_version": "v1.0-baseline",
                    "head_version": "v1.1-department-update",
                    "stories": [],
                    "sample_scenarios": [],
                    "stats": {
                        "deltas": 0,
                        "contracts": 0,
                        "unknowns": 0,
                        "scenarios": 0,
                        "verification_cases": 0,
                    },
                }
            )

        stories = []
        for delta in analysis.deltas.all()[:8]:
            stories.append(
                {
                    "id": str(delta.id),
                    "title": delta.title,
                    "symbol": delta.affected_symbol,
                    "file": delta.file_path,
                    "category": delta.category,
                    "status": "Breaking" if delta.category in self.BREAKING_CATEGORIES else "Compatible",
                    "question": f"What happens in {delta.affected_symbol.split('.')[-1]} after this change?",
                    "baseBehavior": delta.before_behavior,
                    "headBehavior": delta.after_behavior,
                    "summary": delta.summary,
                    "confidence": delta.confidence,
                    "nature": delta.category.replace("_", " ").title(),
                }
            )

        sample_scenarios = [
            {
                "id": str(s.id),
                "question": s.question,
                "target_symbol": s.target_symbol,
            }
            for s in analysis.scenarios.all()[:8]
        ]

        return Response(
            {
                "is_seeded": True,
                "analysis_id": str(analysis.id),
                "workspace_id": str(demo_ws.id) if demo_ws else None,
                "project_name": demo_ws.name if demo_ws else "BeaconWorks API",
                "base_version": analysis.base_snapshot.label,
                "head_version": analysis.head_snapshot.label,
                "stories": stories,
                "sample_scenarios": sample_scenarios,
                "stats": {
                    "deltas": analysis.deltas.count(),
                    "contracts": analysis.contracts.count(),
                    "unknowns": analysis.unknowns.count(),
                    "scenarios": analysis.scenarios.count(),
                    "verification_cases": analysis.verification_cases.count(),
                },
            }
        )


class DemoSeedView(APIView):
    """
    POST /api/v1/demo/seed/
    Seeds the demo workspace and runs the actual 12-stage analysis pipeline
    on the BeaconWorks API fixtures.
    """

    def post(self, request):
        fixtures_base = Path(settings.FIXTURES_DIR) / "base"
        fixtures_head = Path(settings.FIXTURES_DIR) / "head"

        if not fixtures_base.exists() or not fixtures_head.exists():
            return Response(
                {"error": "Fixture directories base/head not found on server."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create or retrieve Demo Workspace
        workspace, _ = Workspace.objects.get_or_create(
            slug="beaconworks-api-demo",
            defaults={
                "name": "BeaconWorks API (Demo)",
                "description": "Fictional enterprise employee & payroll service demonstrating change-impact intelligence.",
                "is_demo": True,
            },
        )

        extractor = SafeArchiveExtractor()

        # Ingest Base Snapshot
        base_manifest = extractor.scan_directory(str(fixtures_base))
        base_snap = SourceSnapshot.objects.create(
            workspace=workspace,
            label="v1.0-baseline",
            storage_path=str(fixtures_base),
            file_count=len(base_manifest),
            total_bytes=sum(os.path.getsize(m["absolute_path"]) for m in base_manifest),
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
        head_manifest = extractor.scan_directory(str(fixtures_head))
        head_snap = SourceSnapshot.objects.create(
            workspace=workspace,
            label="v1.1-department-update",
            storage_path=str(fixtures_head),
            file_count=len(head_manifest),
            total_bytes=sum(os.path.getsize(m["absolute_path"]) for m in head_manifest),
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
            status="queued",
            ai_provider_name=getattr(settings, "LLM_PROVIDER", "mock"),
        )

        # Run Analysis Pipeline synchronously for demo seed
        engine = AnalysisPipelineEngine()
        completed_analysis = engine.run_analysis(str(analysis.id))

        return Response(
            {
                "message": "Demo workspace seeded and analyzed successfully.",
                "workspace_id": str(workspace.id),
                "analysis_id": str(completed_analysis.id),
                "status": completed_analysis.status,
                "counts": {
                    "deltas": completed_analysis.deltas.count(),
                    "contracts": completed_analysis.contracts.count(),
                    "unknowns": completed_analysis.unknowns.count(),
                    "scenarios": completed_analysis.scenarios.count(),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class WorkspaceListCreateView(ListCreateAPIView):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer

    def perform_create(self, serializer):
        name = serializer.validated_data["name"]
        import re
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
        serializer.save(slug=slug)


class WorkspaceDetailView(RetrieveAPIView):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    lookup_field = "id"


class WorkspaceHistoryView(APIView):
    """
    GET /api/v1/workspaces/{id}/history/
    Returns immutable historical analysis runs for this workspace.
    """

    def get(self, request, id):
        analyses = AnalysisRun.objects.filter(workspace_id=id).order_by("-created_at")
        history_list = []
        for a in analyses:
            history_list.append(
                {
                    "id": str(a.id),
                    "created_at": a.created_at.isoformat(),
                    "status": a.status,
                    "base_snapshot_label": a.base_snapshot.label,
                    "head_snapshot_label": a.head_snapshot.label,
                    "engine_version": a.engine_version,
                    "counts": {
                        "deltas": a.deltas.count(),
                        "contracts": a.contracts.count(),
                        "scenarios": a.scenarios.count(),
                        "unknowns": a.unknowns.count(),
                    },
                }
            )
        return Response(history_list)
