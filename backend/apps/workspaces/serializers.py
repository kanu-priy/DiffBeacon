from rest_framework import serializers
from .models import Workspace


class WorkspaceSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    analysis_count = serializers.IntegerField(source="analyses.count", read_only=True)
    snapshot_count = serializers.IntegerField(source="snapshots.count", read_only=True)
    owner_id = serializers.ReadOnlyField(source="owner.id")

    class Meta:
        model = Workspace
        fields = (
            "id",
            "owner_id",
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
        read_only_fields = (
            "id",
            "owner_id",
            "created_at",
            "updated_at",
            "analysis_count",
            "snapshot_count",
        )
