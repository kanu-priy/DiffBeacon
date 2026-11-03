import uuid
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class GitHubInstallation(models.Model):
    STATUS_CHOICES = (
        ("connected", "Connected"),
        ("revoked", "Revoked"),
        ("disconnected", "Disconnected"),
        ("error", "Error"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="github_installations")
    installation_id = models.BigIntegerField(null=True, blank=True, unique=True)
    app_id = models.CharField(max_length=80, blank=True, default="")
    account_login = models.CharField(max_length=255, blank=True, default="")
    account_type = models.CharField(max_length=50, blank=True, default="User")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="connected")
    permissions = models.JSONField(default=dict, blank=True)
    webhook_secret = models.CharField(max_length=255, blank=True, default="")
    installation_url = models.URLField(max_length=500, blank=True, default="")
    is_active = models.BooleanField(default=True)
    connected_at = models.DateTimeField(null=True, blank=True)
    disconnected_at = models.DateTimeField(null=True, blank=True)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "diffbeacon_github_installations"
        ordering = ["-connected_at", "-created_at"]

    def __str__(self):
        return f"GitHub App installation {self.installation_id or self.id} for {self.account_login or self.user.username}"


class GitHubRepository(models.Model):
    VISIBILITY_CHOICES = (
        ("public", "Public"),
        ("private", "Private"),
        ("internal", "Internal"),
    )
    STATUS_CHOICES = (
        ("active", "Active"),
        ("revoked", "Revoked"),
        ("removed", "Removed"),
        ("error", "Error"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    installation = models.ForeignKey(GitHubInstallation, on_delete=models.CASCADE, related_name="repositories")
    github_id = models.BigIntegerField()
    owner = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=400)
    default_branch = models.CharField(max_length=255, blank=True, default="")
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="public")
    is_private = models.BooleanField(default=False)
    html_url = models.URLField(max_length=500, blank=True, default="")
    selected = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "diffbeacon_github_repositories"
        unique_together = (("installation", "github_id"),)
        ordering = ["owner", "name"]

    def __str__(self):
        return self.full_name


class GitHubPullRequest(models.Model):
    STATE_CHOICES = (
        ("open", "Open"),
        ("closed", "Closed"),
        ("merged", "Merged"),
    )
    ANALYSIS_STATUS_CHOICES = (
        ("queued", "Queued"),
        ("analyzing", "Analyzing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("superseded", "Superseded"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    installation = models.ForeignKey(GitHubInstallation, on_delete=models.CASCADE, related_name="pull_requests")
    repository = models.ForeignKey(GitHubRepository, on_delete=models.CASCADE, related_name="pull_requests")
    github_pr_id = models.BigIntegerField()
    number = models.IntegerField()
    title = models.CharField(max_length=400)
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default="open")
    base_ref = models.CharField(max_length=255, blank=True, default="")
    base_sha = models.CharField(max_length=80, blank=True, default="")
    head_ref = models.CharField(max_length=255, blank=True, default="")
    head_sha = models.CharField(max_length=80, blank=True, default="")
    html_url = models.URLField(max_length=500, blank=True, default="")
    analysis_status = models.CharField(max_length=20, choices=ANALYSIS_STATUS_CHOICES, default="queued")
    last_event = models.CharField(max_length=40, blank=True, default="opened")
    analysis_report = models.ForeignKey(
        "analysis.AnalysisRun",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="github_pull_request",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "diffbeacon_github_pull_requests"
        unique_together = (("repository", "github_pr_id"),)
        ordering = ["-created_at"]

    def __str__(self):
        return f"#{self.number} in {self.repository.full_name}"


class GitHubCommitSnapshot(models.Model):
    KIND_CHOICES = (("base", "Base"), ("head", "Head"))

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pull_request = models.ForeignKey(GitHubPullRequest, on_delete=models.CASCADE, related_name="commit_snapshots")
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    sha = models.CharField(max_length=80)
    ref = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "diffbeacon_github_commit_snapshots"
        unique_together = (("pull_request", "kind"),)

    def __str__(self):
        return f"{self.pull_request.number} {self.kind} {self.sha[:7]}"


class GitHubAnalysisJob(models.Model):
    STATUS_CHOICES = (
        ("queued", "Queued"),
        ("analyzing", "Analyzing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("superseded", "Superseded"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    installation = models.ForeignKey(GitHubInstallation, on_delete=models.CASCADE, related_name="analysis_jobs")
    repository = models.ForeignKey(GitHubRepository, on_delete=models.CASCADE, related_name="analysis_jobs")
    pull_request = models.ForeignKey(GitHubPullRequest, on_delete=models.CASCADE, related_name="analysis_jobs")
    analysis_report = models.ForeignKey(
        "analysis.AnalysisRun",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="github_analysis_jobs",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="queued")
    base_sha = models.CharField(max_length=80, blank=True, default="")
    head_sha = models.CharField(max_length=80, blank=True, default="")
    queued_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, default="")
    supersedes = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="superseded_by")

    class Meta:
        db_table = "diffbeacon_github_analysis_jobs"
        ordering = ["-queued_at"]

    def __str__(self):
        return f"{self.pull_request.number} {self.status}"
