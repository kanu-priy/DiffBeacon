from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.workspaces.urls")),
    path("api/v1/", include("apps.snapshots.urls")),
    path("api/v1/", include("apps.analysis.urls")),
    path("api/v1/", include("apps.scenarios.urls")),
]
