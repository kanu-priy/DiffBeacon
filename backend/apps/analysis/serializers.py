from rest_framework import serializers
from .models import (
    AnalysisRun,
    BehaviorDelta,
    ContractDelta,
    VerificationCase,
    UnknownEntry,
    EvidenceRecord,
    AnalysisFeedback,
)


class BehaviorDeltaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehaviorDelta
        fields = (
            "id",
            "category",
            "title",
            "summary",
            "before_behavior",
            "after_behavior",
            "affected_symbol",
            "file_path",
            "base_line_range",
            "head_line_range",
            "confidence",
            "evidence_refs",
        )


class ContractDeltaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractDelta
        fields = (
            "id",
            "contract_type",
            "identifier",
            "change_nature",
            "before_spec",
            "after_spec",
            "is_breaking",
            "compatibility_assessment",
            "unresolved_assumptions",
        )


class VerificationCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationCase
        fields = (
            "id",
            "title",
            "delta",
            "preconditions",
            "input_data",
            "expected_result",
            "rationale",
            "existing_test_ref",
            "coverage_classification",
            "execution_status",
        )


class UnknownEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = UnknownEntry
        fields = (
            "id",
            "title",
            "reason",
            "file_path",
            "line_number",
            "code_snippet",
            "explanation",
            "resolution_strategy",
        )


class EvidenceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvidenceRecord
        fields = (
            "id",
            "snapshot_side",
            "file_path",
            "start_line",
            "end_line",
            "content_excerpt",
            "content_hash",
            "originating_stage",
        )


class AnalysisFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisFeedback
        fields = (
            "id",
            "analysis",
            "target_type",
            "target_id",
            "rating",
            "comment",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class AnalysisRunSerializer(serializers.ModelSerializer):
    base_snapshot_label = serializers.CharField(source="base_snapshot.label", read_only=True)
    head_snapshot_label = serializers.CharField(source="head_snapshot.label", read_only=True)
    counts = serializers.SerializerMethodField()

    class Meta:
        model = AnalysisRun
        fields = (
            "id",
            "workspace",
            "base_snapshot",
            "head_snapshot",
            "base_snapshot_label",
            "head_snapshot_label",
            "status",
            "current_stage",
            "stages_completed",
            "engine_version",
            "ai_provider_name",
            "error_details",
            "started_at",
            "completed_at",
            "created_at",
            "counts",
        )
        read_only_fields = (
            "id",
            "status",
            "current_stage",
            "stages_completed",
            "engine_version",
            "error_details",
            "started_at",
            "completed_at",
            "created_at",
        )

    def get_counts(self, obj):
        return {
            "deltas": obj.deltas.count(),
            "contracts": obj.contracts.count(),
            "verification_cases": obj.verification_cases.count(),
            "unknowns": obj.unknowns.count(),
            "scenarios": obj.scenarios.count(),
        }
