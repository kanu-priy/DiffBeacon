from django.urls import path
from .views import ScenarioCreateListView, ScenarioDetailView, ScenarioTraceView

urlpatterns = [
    path("analyses/<uuid:analysis_id>/scenarios/", ScenarioCreateListView.as_view(), name="scenario-create-list"),
    path("scenarios/<uuid:id>/", ScenarioDetailView.as_view(), name="scenario-detail"),
    path("scenarios/<uuid:id>/trace/", ScenarioTraceView.as_view(), name="scenario-trace"),
]
