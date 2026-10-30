from django.urls import path
from .views import (
    DemoSeedView,
    DemoSampleArchiveDownloadView,
    DemoShowcaseView,
    DemoStatusView,
    LoginView,
    MeView,
    RegisterView,
    WorkspaceDetailView,
    WorkspaceHistoryView,
    WorkspaceListCreateView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("demo/", DemoStatusView.as_view(), name="demo-status"),
    path("demo/seed/", DemoSeedView.as_view(), name="demo-seed"),
    path("demo/showcase/", DemoShowcaseView.as_view(), name="demo-showcase"),
    path("demo/sample-archive/", DemoSampleArchiveDownloadView.as_view(), name="demo-sample-archive"),
    path("workspaces/", WorkspaceListCreateView.as_view(), name="workspace-list-create"),
    path("workspaces/<uuid:id>/", WorkspaceDetailView.as_view(), name="workspace-detail"),
    path("workspaces/<uuid:id>/history/", WorkspaceHistoryView.as_view(), name="workspace-history"),
]
