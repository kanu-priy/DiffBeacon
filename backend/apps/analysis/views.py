from pathlib import Path
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView

from .models import (
    AnalysisRun,
    BehaviorDelta,
    ContractDelta,
    VerificationCase,
    UnknownEntry,
    EvidenceRecord,
    AnalysisFeedback,
)
from .serializers import (
    AnalysisRunSerializer,
    BehaviorDeltaSerializer,
    ContractDeltaSerializer,
    VerificationCaseSerializer,
    UnknownEntrySerializer,
    EvidenceRecordSerializer,
    AnalysisFeedbackSerializer,
)
from apps.analysis.engine import AnalysisPipelineEngine
from apps.snapshots.models import RelationshipEdge, Symbol, SourceFile


class AnalysisCreateListView(ListCreateAPIView):
    queryset = AnalysisRun.objects.all()
    serializer_class = AnalysisRunSerializer

    def perform_create(self, serializer):
        analysis = serializer.save(status="running")
        # Run synchronous analysis
        engine = AnalysisPipelineEngine()
        engine.run_analysis(str(analysis.id))


class AnalysisDetailView(RetrieveAPIView):
    queryset = AnalysisRun.objects.all()
    serializer_class = AnalysisRunSerializer
    lookup_field = "id"


class AnalysisDeltasView(APIView):
    def get(self, request, id):
        deltas = BehaviorDelta.objects.filter(analysis_id=id)
        serializer = BehaviorDeltaSerializer(deltas, many=True)
        return Response(serializer.data)


class AnalysisContractsView(APIView):
    def get(self, request, id):
        contracts = ContractDelta.objects.filter(analysis_id=id)
        serializer = ContractDeltaSerializer(contracts, many=True)
        return Response(serializer.data)


class AnalysisImpactGraphView(APIView):
    """
    GET /api/v1/analyses/{id}/impact-graph/
    Returns graph nodes and edges filtered by blast radius around changed symbols.
    """

    def get(self, request, id):
        try:
            analysis = AnalysisRun.objects.get(id=id)
        except AnalysisRun.DoesNotExist:
            return Response({"error": "Analysis not found."}, status=status.HTTP_404_NOT_FOUND)

        side = request.query_params.get("side", "head").lower()
        snapshot = analysis.head_snapshot if side == "head" else analysis.base_snapshot

        symbols = Symbol.objects.filter(snapshot=snapshot)
        edges = RelationshipEdge.objects.filter(snapshot=snapshot)

        # Build changed symbol set from deltas
        changed_symbols = set(
            analysis.deltas.values_list("affected_symbol", flat=True)
        )

        nodes_data = []
        for s in symbols:
            is_changed = s.qualified_name in changed_symbols or any(
                s.name in cs for cs in changed_symbols
            )
            nodes_data.append(
                {
                    "id": s.qualified_name,
                    "label": s.name,
                    "type": s.symbol_type,
                    "file_path": s.file_path,
                    "line_number": s.start_line,
                    "is_changed": is_changed,
                    "metadata": s.metadata,
                }
            )

        edges_data = []
        for e in edges:
            edges_data.append(
                {
                    "id": str(e.id),
                    "source": e.source_symbol_qname,
                    "target": e.target_symbol_qname,
                    "type": e.edge_type,
                    "provenance": e.provenance,
                    "certainty": e.certainty,
                    "file_path": e.source_file,
                    "line_number": e.line_number,
                }
            )

        return Response(
            {
                "snapshot_side": side,
                "snapshot_label": snapshot.label,
                "nodes": nodes_data,
                "edges": edges_data,
            }
        )


class AnalysisVerificationView(APIView):
    def get(self, request, id):
        cases = VerificationCase.objects.filter(analysis_id=id)
        serializer = VerificationCaseSerializer(cases, many=True)
        return Response(serializer.data)


class AnalysisEvidenceView(APIView):
    def get(self, request, id):
        evidence = EvidenceRecord.objects.filter(analysis_id=id)
        serializer = EvidenceRecordSerializer(evidence, many=True)
        return Response(serializer.data)


class AnalysisUnknownsView(APIView):
    def get(self, request, id):
        unknowns = UnknownEntry.objects.filter(analysis_id=id)
        serializer = UnknownEntrySerializer(unknowns, many=True)
        return Response(serializer.data)


class AnalysisFeedbackCreateView(APIView):
    def post(self, request, id):
        try:
            analysis = AnalysisRun.objects.get(id=id)
        except AnalysisRun.DoesNotExist:
            return Response({"error": "Analysis not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data["analysis"] = str(analysis.id)
        serializer = AnalysisFeedbackSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SourceFileContentView(APIView):
    """
    GET /api/v1/analyses/{id}/file-content/?side=head&path=serializers.py
    Returns raw file content and lines for source viewer navigation.
    """

    def get(self, request, id):
        try:
            analysis = AnalysisRun.objects.get(id=id)
        except AnalysisRun.DoesNotExist:
            return Response({"error": "Analysis not found."}, status=status.HTTP_404_NOT_FOUND)

        side = request.query_params.get("side", "head").lower()
        file_path = request.query_params.get("path", "")
        if not file_path:
            return Response({"error": "Path parameter required."}, status=status.HTTP_400_BAD_REQUEST)

        snapshot = analysis.head_snapshot if side == "head" else analysis.base_snapshot
        
        # Search for file
        sf = SourceFile.objects.filter(snapshot=snapshot, relative_path__endswith=file_path).first()
        full_path = Path(snapshot.storage_path) / (sf.relative_path if sf else file_path)

        if not full_path.exists():
            return Response({"error": f"File '{file_path}' not found in {side} snapshot."}, status=status.HTTP_404_NOT_FOUND)

        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        return Response(
            {
                "file_path": sf.relative_path if sf else file_path,
                "snapshot_side": side,
                "snapshot_label": snapshot.label,
                "line_count": len(content.splitlines()),
                "content": content,
            }
        )
