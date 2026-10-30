from django.urls import path
from .views import GitHubAnalyzePRView, GitHubWebhookView, SystemHealthView

urlpatterns = [
    path("integrations/github/analyze-pr/", GitHubAnalyzePRView.as_view(), name="github-analyze-pr"),
    path("integrations/github/webhook/", GitHubWebhookView.as_view(), name="github-webhook"),
    path("health/", SystemHealthView.as_view(), name="system-health"),
]
