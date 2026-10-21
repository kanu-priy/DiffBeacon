from django.urls import path
from .views import (
    AnalysisCreateListView,
    AnalysisDetailView,
    AnalysisDeltasView,
    AnalysisContractsView,
    AnalysisImpactGraphView,
    AnalysisVerificationView,
    AnalysisEvidenceView,
    AnalysisUnknownsView,
    AnalysisFeedbackCreateView,
    SourceFileContentView,
)

urlpatterns = [
    path("analyses/", AnalysisCreateListView.as_view(), name="analysis-create-list"),
    path("analyses/<uuid:id>/", AnalysisDetailView.as_view(), name="analysis-detail"),
    path("analyses/<uuid:id>/deltas/", AnalysisDeltasView.as_view(), name="analysis-deltas"),
    path("analyses/<uuid:id>/contracts/", AnalysisContractsView.as_view(), name="analysis-contracts"),
    path("analyses/<uuid:id>/impact-graph/", AnalysisImpactGraphView.as_view(), name="analysis-impact-graph"),
    path("analyses/<uuid:id>/verification/", AnalysisVerificationView.as_view(), name="analysis-verification"),
    path("analyses/<uuid:id>/evidence/", AnalysisEvidenceView.as_view(), name="analysis-evidence"),
    path("analyses/<uuid:id>/unknowns/", AnalysisUnknownsView.as_view(), name="analysis-unknowns"),
    path("analyses/<uuid:id>/feedback/", AnalysisFeedbackCreateView.as_view(), name="analysis-feedback"),
    path("analyses/<uuid:id>/file-content/", SourceFileContentView.as_view(), name="analysis-file-content"),
]
