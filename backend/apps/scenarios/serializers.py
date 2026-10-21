from rest_framework import serializers
from .models import ScenarioQuery, ScenarioTrace


class ScenarioTraceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScenarioTrace
        fields = (
            "id",
            "snapshot_side",
            "step_index",
            "symbol_qname",
            "file_path",
            "line_number",
            "explanation",
            "provenance",
        )


class ScenarioQuerySerializer(serializers.ModelSerializer):
    traces = serializers.SerializerMethodField()

    class Meta:
        model = ScenarioQuery
        fields = (
            "id",
            "analysis",
            "question",
            "target_symbol",
            "normalized_condition",
            "target_behavior",
            "interpretation_assumptions",
            "behavioral_delta_summary",
            "impact_summary",
            "verification_plan",
            "uncertainty_report",
            "status",
            "created_at",
            "traces",
        )
        read_only_fields = (
            "id",
            "normalized_condition",
            "target_behavior",
            "interpretation_assumptions",
            "behavioral_delta_summary",
            "impact_summary",
            "verification_plan",
            "uncertainty_report",
            "status",
            "created_at",
            "traces",
        )

    def get_traces(self, obj):
        base_traces = ScenarioTraceSerializer(
            obj.traces.filter(snapshot_side="base").order_by("step_index"), many=True
        ).data
        head_traces = ScenarioTraceSerializer(
            obj.traces.filter(snapshot_side="head").order_by("step_index"), many=True
        ).data
        return {
            "base": base_traces,
            "head": head_traces,
        }
