import io
import os
import re
import zipfile
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from rest_framework import serializers, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.analysis.engine import AnalysisPipelineEngine
from apps.analysis.models import AnalysisRun
from apps.ingestion.archiver import SafeArchiveExtractor
from apps.snapshots.models import SourceFile, SourceSnapshot
from .models import Workspace
from .serializers import WorkspaceSerializer

User = get_user_model()


def serialize_user(user):
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


class DiffBeaconTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        if username_or_email and "@" in username_or_email:
            matched_user = User.objects.filter(email__iexact=username_or_email).first()
            if matched_user:
                attrs["username"] = matched_user.username

        data = super().validate(attrs)
        data["user"] = serialize_user(self.user)
        return data


class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        if User.objects.filter(username__iexact=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "This username is already in use."})

        if User.objects.filter(email__iexact=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})

        return attrs


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        user = User.objects.create_user(
            username=payload["username"],
            email=payload["email"],
            password=payload["password"],
        )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": serialize_user(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DiffBeaconTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(serialize_user(request.user))


class DemoStatusView(APIView):
    """
    GET /api/v1/demo/
    Returns whether demo is seeded and lists sample scenarios.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        fixtures_dir = getattr(settings, "FIXTURES_DIR", None)
        demo_available = fixtures_dir and Path(fixtures_dir).exists()

        demo_ws = Workspace.objects.filter(is_demo=True).first()
        latest_analysis = None
        if demo_ws:
            latest_analysis = AnalysisRun.objects.filter(workspace=demo_ws, status="completed").first()

        sample_scenarios = []
        stats = {"deltas": 0, "contracts": 0, "unknowns": 0, "scenarios": 0, "verification_cases": 0}
        if latest_analysis:
            stats = {
                "deltas": latest_analysis.deltas.count(),
                "contracts": latest_analysis.contracts.count(),
                "unknowns": latest_analysis.unknowns.count(),
                "scenarios": latest_analysis.scenarios.count(),
                "verification_cases": latest_analysis.verification_cases.count(),
            }
            sample_scenarios = [{"id": str(s.id), "question": s.question, "target_symbol": s.target_symbol} for s in latest_analysis.scenarios.all()[:8]]

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

    permission_classes = [AllowAny]
    BREAKING_CATEGORIES = {"deleted_symbol", "validation", "permission"}

    def get(self, request):
        demo_ws = Workspace.objects.filter(is_demo=True).first()
        analysis = None
        if demo_ws:
            analysis = AnalysisRun.objects.filter(workspace=demo_ws, status="completed").first()

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
                    "stats": {"deltas": 0, "contracts": 0, "unknowns": 0, "scenarios": 0, "verification_cases": 0},
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

        sample_scenarios = [{"id": str(s.id), "question": s.question, "target_symbol": s.target_symbol} for s in analysis.scenarios.all()[:8]]

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

    permission_classes = [AllowAny]

    def post(self, request):
        fixtures_base = Path(settings.FIXTURES_DIR) / "base"
        fixtures_head = Path(settings.FIXTURES_DIR) / "head"

        if not fixtures_base.exists() or not fixtures_head.exists():
            return Response({"error": "Fixture directories base/head not found on server."}, status=status.HTTP_404_NOT_FOUND)

        workspace, _ = Workspace.objects.get_or_create(
            slug="beaconworks-api-demo",
            defaults={
                "name": "BeaconWorks API (Demo)",
                "description": "Fictional enterprise employee & payroll service demonstrating change-impact intelligence.",
                "is_demo": True,
            },
        )

        extractor = SafeArchiveExtractor()

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

        analysis = AnalysisRun.objects.create(
            workspace=workspace,
            base_snapshot=base_snap,
            head_snapshot=head_snap,
            status="queued",
            ai_provider_name=getattr(settings, "LLM_PROVIDER", "mock"),
        )

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
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        name = serializer.validated_data["name"]
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
        serializer.save(owner=self.request.user, slug=slug)


class WorkspaceDetailView(RetrieveAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return Workspace.objects.all()

    def get_object(self):
        obj = Workspace.objects.filter(id=self.kwargs["id"]).first()
        if obj is None or obj.owner != self.request.user:
            raise PermissionDenied("You do not have access to this workspace.")
        return obj


class WorkspaceHistoryView(APIView):
    """
    GET /api/v1/workspaces/{id}/history/
    Returns immutable historical analysis runs for this workspace.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        workspace = Workspace.objects.filter(id=id, owner=request.user).first()
        if not workspace:
            raise PermissionDenied("You do not have access to this workspace.")

        analyses = AnalysisRun.objects.filter(workspace=workspace).order_by("-created_at")
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


class DemoSampleArchiveDownloadView(APIView):
    """
    GET /api/v1/demo/sample-archive/?version=base|head
    Streams a dynamically created ZIP archive of the BeaconWorks API fixtures.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        version = request.query_params.get("version", "base").lower()
        if version not in ("base", "head"):
            version = "base"

        target_dir = Path(settings.FIXTURES_DIR) / version
        if not target_dir.exists():
            return Response({"error": f"Fixtures directory for {version} not found."}, status=status.HTTP_404_NOT_FOUND)

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for root, _, files in os.walk(target_dir):
                for f in files:
                    full_p = Path(root) / f
                    rel_p = full_p.relative_to(target_dir)
                    zip_file.write(full_p, arcname=str(rel_p))

        buffer.seek(0)
        filename = f"beaconworks-{version}-v1.{ '0' if version == 'base' else '1' }.zip"
        response = HttpResponse(buffer.getvalue(), content_type="application/zip")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
