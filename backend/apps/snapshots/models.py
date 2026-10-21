import uuid
from django.db import models
from apps.workspaces.models import Workspace


class SourceSnapshot(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("ingesting", "Ingesting"),
        ("ready", "Ready"),
        ("failed", "Failed"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, related_name="snapshots"
    )
    label = models.CharField(max_length=120)
    source_hash = models.CharField(max_length=64, blank=True, default="")
    storage_path = models.CharField(max_length=512, blank=True, default="")
    file_count = models.IntegerField(default=0)
    total_bytes = models.BigIntegerField(default=0)
    ingestion_status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "diffbeacon_snapshots"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.workspace.name} - {self.label} ({self.ingestion_status})"


class SourceFile(models.Model):
    CLASSIFICATION_CHOICES = (
        ("source", "Source Code"),
        ("test", "Test"),
        ("migration", "Database Migration"),
        ("config", "Configuration"),
        ("doc", "Documentation"),
        ("skipped", "Skipped/Unsupported"),
    )

    PARSE_CHOICES = (
        ("parsed", "Successfully Parsed"),
        ("syntax_error", "Syntax Error"),
        ("skipped", "Skipped"),
        ("binary", "Binary File"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    snapshot = models.ForeignKey(
        SourceSnapshot, on_delete=models.CASCADE, related_name="files"
    )
    relative_path = models.CharField(max_length=512)
    content_hash = models.CharField(max_length=64)
    language = models.CharField(max_length=50, default="python")
    file_classification = models.CharField(
        max_length=20, choices=CLASSIFICATION_CHOICES, default="source"
    )
    line_count = models.IntegerField(default=0)
    parse_status = models.CharField(
        max_length=20, choices=PARSE_CHOICES, default="parsed"
    )
    error_message = models.TextField(blank=True, default="")

    class Meta:
        db_table = "diffbeacon_source_files"
        unique_together = ("snapshot", "relative_path")
        indexes = [
            models.Index(fields=["snapshot", "file_classification"]),
        ]

    def __str__(self):
        return f"{self.snapshot.label}: {self.relative_path}"


class Symbol(models.Model):
    SYMBOL_TYPES = (
        ("module", "Module"),
        ("class", "Class"),
        ("function", "Function"),
        ("method", "Method"),
        ("variable", "Variable"),
        ("contract", "Contract"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    snapshot = models.ForeignKey(
        SourceSnapshot, on_delete=models.CASCADE, related_name="symbols"
    )
    file_path = models.CharField(max_length=512)
    name = models.CharField(max_length=255)
    qualified_name = models.CharField(max_length=512)
    symbol_type = models.CharField(max_length=20, choices=SYMBOL_TYPES)
    start_line = models.IntegerField()
    end_line = models.IntegerField()
    signature = models.TextField(blank=True, default="")
    docstring = models.TextField(blank=True, default="")
    fingerprint = models.CharField(max_length=64, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "diffbeacon_symbols"
        indexes = [
            models.Index(fields=["snapshot", "qualified_name"]),
            models.Index(fields=["snapshot", "file_path"]),
        ]

    def __str__(self):
        return f"{self.qualified_name} ({self.symbol_type}) L{self.start_line}-{self.end_line}"


class RelationshipEdge(models.Model):
    EDGE_TYPES = (
        ("imports", "Imports Module"),
        ("calls", "Calls Function/Method"),
        ("references", "References Symbol"),
        ("routes_to", "URL Routes to View"),
        ("serializes", "View Serializes via Serializer"),
        ("reads_model", "Reads Database Model"),
        ("writes_model", "Writes Database Model"),
        ("tests", "Tests Symbol"),
    )

    PROVENANCE_CHOICES = (
        ("ast_static", "Statically Established via AST"),
        ("framework_rule", "Framework Rule Derived"),
        ("inferred", "Inferred by Model"),
    )

    CERTAINTY_CHOICES = (
        ("definite", "Definite"),
        ("probable", "Probable"),
        ("ambiguous", "Ambiguous"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    snapshot = models.ForeignKey(
        SourceSnapshot, on_delete=models.CASCADE, related_name="edges"
    )
    source_symbol_qname = models.CharField(max_length=512)
    target_symbol_qname = models.CharField(max_length=512)
    edge_type = models.CharField(max_length=30, choices=EDGE_TYPES)
    provenance = models.CharField(
        max_length=30, choices=PROVENANCE_CHOICES, default="ast_static"
    )
    certainty = models.CharField(
        max_length=20, choices=CERTAINTY_CHOICES, default="definite"
    )
    source_file = models.CharField(max_length=512, blank=True, default="")
    line_number = models.IntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "diffbeacon_relationship_edges"
        indexes = [
            models.Index(fields=["snapshot", "source_symbol_qname"]),
            models.Index(fields=["snapshot", "target_symbol_qname"]),
            models.Index(fields=["snapshot", "edge_type"]),
        ]

    def __str__(self):
        return f"{self.source_symbol_qname} --[{self.edge_type}]--> {self.target_symbol_qname}"
