from rest_framework import serializers
from .models import Workspace


class WorkspaceSerializer(serializers.ModelSerializer):
    analysis_count = serializers.IntegerField(source="analyses.count", read_only=True)
    snapshot_count = serializers.IntegerField(source="snapshots.count", read_only=True)

    class Meta:
        model = Workspace
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "is_demo",
            "retention_days",
            "created_at",
            "updated_at",
            "analysis_count",
            "snapshot_count",
        )
        read_only_fields = ("id", "created_at", "updated_at", "analysis_count", "snapshot_count")
