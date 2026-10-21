from rest_framework import serializers
from .models import SourceSnapshot, SourceFile, Symbol, RelationshipEdge


class SourceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceFile
        fields = (
            "id",
            "relative_path",
            "content_hash",
            "language",
            "file_classification",
            "line_count",
            "parse_status",
        )


class SourceSnapshotSerializer(serializers.ModelSerializer):
    files = SourceFileSerializer(many=True, read_only=True)

    class Meta:
        model = SourceSnapshot
        fields = (
            "id",
            "workspace",
            "label",
            "source_hash",
            "file_count",
            "total_bytes",
            "ingestion_status",
            "created_at",
            "files",
        )
        read_only_fields = ("id", "source_hash", "file_count", "total_bytes", "ingestion_status", "created_at")
