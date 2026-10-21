from django.urls import path
from .views import (
    DemoStatusView,
    DemoSeedView,
    WorkspaceListCreateView,
    WorkspaceDetailView,
    WorkspaceHistoryView,
)

urlpatterns = [
    path("demo/", DemoStatusView.as_view(), name="demo-status"),
    path("demo/seed/", DemoSeedView.as_view(), name="demo-seed"),
    path("workspaces/", WorkspaceListCreateView.as_view(), name="workspace-list-create"),
    path("workspaces/<uuid:id>/", WorkspaceDetailView.as_view(), name="workspace-detail"),
    path("workspaces/<uuid:id>/history/", WorkspaceHistoryView.as_view(), name="workspace-history"),
]
