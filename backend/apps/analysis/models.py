import uuid
from django.db import models
from apps.workspaces.models import Workspace
from apps.snapshots.models import SourceSnapshot


class AnalysisRun(models.Model):
    STATUS_CHOICES = (
        ("queued", "Queued"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, related_name="analyses"
    )
    base_snapshot = models.ForeignKey(
        SourceSnapshot, on_delete=models.CASCADE, related_name="base_analyses"
    )
    head_snapshot = models.ForeignKey(
        SourceSnapshot, on_delete=models.CASCADE, related_name="head_analyses"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="queued"
    )
    current_stage = models.CharField(max_length=60, default="stage_1_ingest")
    stages_completed = models.JSONField(default=list, blank=True)
    engine_version = models.CharField(max_length=50, default="1.0.0")
    ai_provider_name = models.CharField(max_length=50, default="mock")
    error_details = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "diffbeacon_analysis_runs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Analysis {self.id} [{self.status}] ({self.base_snapshot.label} -> {self.head_snapshot.label})"


class BehaviorDelta(models.Model):
    CATEGORY_CHOICES = (
        ("api_contract", "API Contract Shift"),
        ("validation", "Validation Rule Shift"),
        ("signature", "Function Signature Change"),
        ("permission", "Permission / Auth Condition Shift"),
        ("data_model", "Data Model / Schema Shift"),
        ("error_handling", "Error Handling Shift"),
        ("logic", "Business Logic Shift"),
        ("added_symbol", "Added Symbol"),
        ("deleted_symbol", "Deleted Symbol with Remaining Reference"),
    )

    CONFIDENCE_CHOICES = (
        ("statically_established", "Statically Established"),
        ("framework_rule", "Framework Rule Derived"),
        ("inferred", "Inferred"),
        ("unresolved", "Unresolved"),
        ("runtime_verified", "Runtime Verified"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        AnalysisRun, on_delete=models.CASCADE, related_name="deltas"
    )
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=255)
    summary = models.TextField()
    before_behavior = models.TextField()
    after_behavior = models.TextField()
    affected_symbol = models.CharField(max_length=512)
    file_path = models.CharField(max_length=512)
    base_line_range = models.JSONField(default=list)  # [start, end]
    head_line_range = models.JSONField(default=list)  # [start, end]
    confidence = models.CharField(
        max_length=30, choices=CONFIDENCE_CHOICES, default="statically_established"
    )
    evidence_refs = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "diffbeacon_behavior_deltas"
        ordering = ["category", "title"]

    def __str__(self):
        return f"{self.title} [{self.category}]"


class ContractDelta(models.Model):
    CONTRACT_TYPES = (
        ("drf_serializer", "DRF Serializer Contract"),
        ("api_route", "API Route Contract"),
        ("django_model", "Django Model Field/Constraint"),
        ("service_signature", "Service Function Signature"),
    )

    CHANGE_NATURE = (
        ("added", "Added"),
        ("removed", "Removed"),
        ("modified_optional", "Made Optional"),
        ("modified_required", "Made Required"),
        ("type_change", "Type / Constraint Change"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        AnalysisRun, on_delete=models.CASCADE, related_name="contracts"
    )
    contract_type = models.CharField(max_length=40, choices=CONTRACT_TYPES)
    identifier = models.CharField(max_length=512)
    change_nature = models.CharField(max_length=40, choices=CHANGE_NATURE)
    before_spec = models.JSONField(default=dict, blank=True)
    after_spec = models.JSONField(default=dict, blank=True)
    is_breaking = models.BooleanField(default=False)
    compatibility_assessment = models.TextField(blank=True, default="")
    unresolved_assumptions = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "diffbeacon_contract_deltas"
        ordering = ["contract_type", "identifier"]

    def __str__(self):
        return f"{self.identifier} ({self.change_nature}) - Breaking: {self.is_breaking}"


class VerificationCase(models.Model):
    COVERAGE_CHOICES = (
        ("existing_covered", "Existing Test Found & Matched"),
        ("possibly_covered", "Indirect / Possible Test Found"),
        ("suggested_uncovered", "Suggested Test (No Existing Coverage)"),
    )

    EXECUTION_CHOICES = (
        ("not_executed", "Not Executed"),
        ("passed", "Passed"),
        ("failed", "Failed"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        AnalysisRun, on_delete=models.CASCADE, related_name="verification_cases"
    )
    delta = models.ForeignKey(
        BehaviorDelta,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verification_cases",
    )
    title = models.CharField(max_length=255)
    preconditions = models.TextField()
    input_data = models.TextField()
    expected_result = models.TextField()
    rationale = models.TextField()
    existing_test_ref = models.CharField(max_length=512, blank=True, default="")
    coverage_classification = models.CharField(
        max_length=30, choices=COVERAGE_CHOICES, default="suggested_uncovered"
    )
    execution_status = models.CharField(
        max_length=20, choices=EXECUTION_CHOICES, default="not_executed"
    )

    class Meta:
        db_table = "diffbeacon_verification_cases"

    def __str__(self):
        return f"{self.title} [{self.coverage_classification}]"


class UnknownEntry(models.Model):
    REASON_CHOICES = (
        ("dynamic_dispatch", "Dynamic Attribute/Method Dispatch"),
        ("unresolved_import", "Unresolved Third-Party Import"),
        ("reflection", "Runtime Reflection / Metaprogramming"),
        ("missing_runtime_config", "Missing Runtime Configuration / File"),
        ("runtime_db_state", "Requires Runtime DB State Verification"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        AnalysisRun, on_delete=models.CASCADE, related_name="unknowns"
    )
    title = models.CharField(max_length=255)
    reason = models.CharField(max_length=40, choices=REASON_CHOICES)
    file_path = models.CharField(max_length=512)
    line_number = models.IntegerField(null=True, blank=True)
    code_snippet = models.TextField(blank=True, default="")
    explanation = models.TextField()
    resolution_strategy = models.TextField()

    class Meta:
        db_table = "diffbeacon_unknown_entries"

    def __str__(self):
        return f"{self.title} ({self.reason})"


class EvidenceRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        AnalysisRun, on_delete=models.CASCADE, related_name="evidence_records"
    )
    snapshot_side = models.CharField(max_length=10, choices=(("base", "Base"), ("head", "Head")))
    file_path = models.CharField(max_length=512)
    start_line = models.IntegerField()
    end_line = models.IntegerField()
    content_excerpt = models.TextField()
    content_hash = models.CharField(max_length=64)
    originating_stage = models.CharField(max_length=50, default="stage_7_deltas")

    class Meta:
        db_table = "diffbeacon_evidence_records"

    def __str__(self):
        return f"{self.snapshot_side.upper()} {self.file_path} L{self.start_line}-{self.end_line}"


class AnalysisFeedback(models.Model):
    RATING_CHOICES = (
        ("useful", "Useful & Accurate"),
        ("incorrect", "Incorrect Claim"),
        ("inconclusive", "Inconclusive / Incomplete"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        AnalysisRun, on_delete=models.CASCADE, related_name="feedback_entries"
    )
    target_type = models.CharField(max_length=40)  # delta, scenario, contract, verification
    target_id = models.CharField(max_length=100)
    rating = models.CharField(max_length=20, choices=RATING_CHOICES)
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "diffbeacon_analysis_feedback"
