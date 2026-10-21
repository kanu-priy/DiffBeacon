from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView

from .models import ScenarioQuery, ScenarioTrace
from .serializers import ScenarioQuerySerializer, ScenarioTraceSerializer
from apps.analysis.models import AnalysisRun
from apps.scenarios.synthesis import ScenarioSynthesizer


class ScenarioCreateListView(APIView):
    """
    GET /api/v1/analyses/{analysis_id}/scenarios/
    POST /api/v1/analyses/{analysis_id}/scenarios/
    Executes a new query in Change Scenario Studio.
    """

    def get(self, request, analysis_id):
        scenarios = ScenarioQuery.objects.filter(analysis_id=analysis_id)
        serializer = ScenarioQuerySerializer(scenarios, many=True)
        return Response(serializer.data)

    def post(self, request, analysis_id):
        try:
            analysis = AnalysisRun.objects.get(id=analysis_id)
        except AnalysisRun.DoesNotExist:
            return Response(
                {"error": "Analysis not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        question = request.data.get("question", "").strip()
        if not question:
            return Response(
                {"error": "Question field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_symbol = request.data.get("target_symbol", "")
        provider_name = request.data.get("provider", None)

        synthesizer = ScenarioSynthesizer()
        scenario_record = synthesizer.execute_scenario(
            analysis=analysis,
            question=question,
            target_symbol=target_symbol,
            provider_name=provider_name,
        )

        serializer = ScenarioQuerySerializer(scenario_record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ScenarioDetailView(RetrieveAPIView):
    queryset = ScenarioQuery.objects.all()
    serializer_class = ScenarioQuerySerializer
    lookup_field = "id"


class ScenarioTraceView(APIView):
    """
    GET /api/v1/scenarios/{id}/trace/
    Returns side-by-side ordered trace steps.
    """

    def get(self, request, id):
        try:
            scenario = ScenarioQuery.objects.get(id=id)
        except ScenarioQuery.DoesNotExist:
            return Response({"error": "Scenario not found."}, status=status.HTTP_404_NOT_FOUND)

        base_traces = ScenarioTrace.objects.filter(scenario=scenario, snapshot_side="base").order_by("step_index")
        head_traces = ScenarioTrace.objects.filter(scenario=scenario, snapshot_side="head").order_by("step_index")

        return Response(
            {
                "scenario_id": str(scenario.id),
                "question": scenario.question,
                "base_trace": ScenarioTraceSerializer(base_traces, many=True).data,
                "head_trace": ScenarioTraceSerializer(head_traces, many=True).data,
            }
        )
