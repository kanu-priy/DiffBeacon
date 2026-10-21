from django.urls import path
from .views import SnapshotUploadView, SnapshotDetailView

urlpatterns = [
    path("workspaces/<uuid:workspace_id>/snapshots/", SnapshotUploadView.as_view(), name="snapshot-upload"),
    path("snapshots/<uuid:id>/", SnapshotDetailView.as_view(), name="snapshot-detail"),
]
