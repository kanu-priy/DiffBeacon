import uuid
from django.db import models
from apps.analysis.models import AnalysisRun


class ScenarioQuery(models.Model):
    STATUS_CHOICES = (
        ("completed", "Completed"),
        ("unresolved", "Unresolved / Insufficient Evidence"),
        ("failed", "Failed"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        AnalysisRun, on_delete=models.CASCADE, related_name="scenarios"
    )
    question = models.TextField()
    target_symbol = models.CharField(max_length=512, blank=True, default="")
    normalized_condition = models.TextField()
    target_behavior = models.TextField(blank=True, default="")
    interpretation_assumptions = models.JSONField(default=list, blank=True)
    behavioral_delta_summary = models.TextField()
    impact_summary = models.TextField()
    verification_plan = models.JSONField(default=dict, blank=True)
    uncertainty_report = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="completed"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "diffbeacon_scenario_queries"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Scenario [{self.status}]: {self.question[:60]}"


class ScenarioTrace(models.Model):
    SIDE_CHOICES = (
        ("base", "Base Version"),
        ("head", "Head Version"),
    )

    PROVENANCE_CHOICES = (
        ("statically_established", "Statically Established"),
        ("framework_rule", "Framework Rule Derived"),
        ("inferred", "Inferred"),
        ("unresolved", "Unresolved"),
        ("runtime_verified", "Runtime Verified"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scenario = models.ForeignKey(
        ScenarioQuery, on_delete=models.CASCADE, related_name="traces"
    )
    snapshot_side = models.CharField(max_length=10, choices=SIDE_CHOICES)
    step_index = models.IntegerField()
    symbol_qname = models.CharField(max_length=512)
    file_path = models.CharField(max_length=512)
    line_number = models.IntegerField(null=True, blank=True)
    explanation = models.TextField()
    provenance = models.CharField(
        max_length=30, choices=PROVENANCE_CHOICES, default="statically_established"
    )

    class Meta:
        db_table = "diffbeacon_scenario_traces"
        ordering = ["scenario", "snapshot_side", "step_index"]

    def __str__(self):
        return f"{self.snapshot_side.upper()} Step {self.step_index}: {self.symbol_qname}"
