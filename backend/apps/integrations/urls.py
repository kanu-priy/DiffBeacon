from django.urls import path
from .views import (
    GitHubAnalyzePRView,
    GitHubConnectView,
    GitHubConnectionStatusView,
    GitHubDisconnectView,
    GitHubInstallCallbackView,
    GitHubRepositorySelectionView,
    GitHubWebhookView,
    SystemHealthView,
)

urlpatterns = [
    path("integrations/github/analyze-pr/", GitHubAnalyzePRView.as_view(), name="github-analyze-pr"),
    path("integrations/github/connect/", GitHubConnectView.as_view(), name="github-connect"),
    path("integrations/github/callback/", GitHubInstallCallbackView.as_view(), name="github-install-callback"),
    path("integrations/github/connection/", GitHubConnectionStatusView.as_view(), name="github-connection-status"),
    path("integrations/github/repositories/", GitHubRepositorySelectionView.as_view(), name="github-repositories"),
    path("integrations/github/disconnect/", GitHubDisconnectView.as_view(), name="github-disconnect"),
    path("integrations/github/webhook/", GitHubWebhookView.as_view(), name="github-webhook"),
    path("health/", SystemHealthView.as_view(), name="system-health"),
]
