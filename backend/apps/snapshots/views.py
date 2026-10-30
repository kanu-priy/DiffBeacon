import os
import uuid
from pathlib import Path
from django.conf import settings
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveDestroyAPIView

from .models import SourceSnapshot, SourceFile
from .serializers import SourceSnapshotSerializer
from apps.workspaces.models import Workspace
from apps.ingestion.archiver import SafeArchiveExtractor, IngestionSecurityError


class SnapshotUploadView(APIView):
    """
    POST /api/v1/workspaces/{workspace_id}/snapshots/
    Uploads a source ZIP archive and extracts it safely.
    """

    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, workspace_id):
        workspace = Workspace.objects.filter(id=workspace_id, owner=request.user).first()
        if not workspace:
            return Response(
                {"error": "You do not have access to this workspace."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if "archive" not in request.FILES:
            return Response(
                {"error": "No 'archive' file provided in form-data."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        archive_file = request.FILES["archive"]
        label = request.data.get("label", archive_file.name)

        # Target directory in storage
        storage_base = Path(getattr(settings, "STORAGE_DIR", "storage/snapshots"))
        snapshot_id = uuid.uuid4()
        dest_dir = storage_base / str(workspace.id) / str(snapshot_id)
        dest_dir.mkdir(parents=True, exist_ok=True)

        extractor = SafeArchiveExtractor()
        try:
            manifest = extractor.extract_zip(archive_file, str(dest_dir))
        except IngestionSecurityError as sec_err:
            return Response(
                {"error": f"Security validation failed: {str(sec_err)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as err:
            return Response(
                {"error": f"Extraction error: {str(err)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create Snapshot record
        total_bytes = sum(
            os.path.getsize(m["absolute_path"])
            for m in manifest
            if os.path.exists(m["absolute_path"])
        )
        snapshot = SourceSnapshot.objects.create(
            id=snapshot_id,
            workspace=workspace,
            label=label,
            storage_path=str(dest_dir),
            file_count=len(manifest),
            total_bytes=total_bytes,
            ingestion_status="ready",
        )

        for m in manifest:
            SourceFile.objects.create(
                snapshot=snapshot,
                relative_path=m["relative_path"],
                content_hash=m["content_hash"],
                language=m["language"],
                file_classification=m["file_classification"],
                line_count=m["line_count"],
                parse_status=m["parse_status"],
            )

        serializer = SourceSnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SnapshotDetailView(RetrieveDestroyAPIView):
    queryset = SourceSnapshot.objects.all()
    serializer_class = SourceSnapshotSerializer
    lookup_field = "id"
