from typing import Any, Dict, List, Optional
from apps.analysis.models import AnalysisRun
from apps.snapshots.models import SourceSnapshot, Symbol, RelationshipEdge
from apps.integrations.llm_base import BoundedContextPackage


class ScenarioPlanner:
    """
    Translates developer behavior questions into candidate execution paths
    and bounded context packages using verified static analysis artifacts.
    """

    def plan_scenario(
        self,
        analysis: AnalysisRun,
        question: str,
        target_symbol: Optional[str] = None,
    ) -> BoundedContextPackage:
        base_snap = analysis.base_snapshot
        head_snap = analysis.head_snapshot

        # Extract related contract deltas
        contract_deltas_data = [
            {
                "contract_type": c.contract_type,
                "identifier": c.identifier,
                "change_nature": c.change_nature,
                "before_spec": c.before_spec,
                "after_spec": c.after_spec,
                "is_breaking": c.is_breaking,
            }
            for c in analysis.contracts.all()
        ]

        # Extract behavior deltas
        behavior_deltas_data = [
            {
                "category": d.category,
                "title": d.title,
                "summary": d.summary,
                "affected_symbol": d.affected_symbol,
                "before_behavior": d.before_behavior,
                "after_behavior": d.after_behavior,
                "confidence": d.confidence,
            }
            for d in analysis.deltas.all()
        ]

        # Extract unknowns
        unknowns_data = [
            {
                "title": u.title,
                "reason": u.reason,
                "file_path": u.file_path,
                "line_number": u.line_number,
                "code_snippet": u.code_snippet,
            }
            for u in analysis.unknowns.all()
        ]

        # Candidate paths in Base and Head
        candidate_paths = {
            "base": self._get_candidate_trace(base_snap, target_symbol),
            "head": self._get_candidate_trace(head_snap, target_symbol),
        }

        # Source excerpts
        source_excerpts = {}
        for ev in analysis.evidence_records.all()[:10]:
            key = f"{ev.snapshot_side}_{ev.file_path}"
            source_excerpts[key] = ev.content_excerpt

        return BoundedContextPackage(
            scenario_question=question,
            target_symbol=target_symbol,
            source_excerpts=source_excerpts,
            candidate_paths=candidate_paths,
            contract_deltas=contract_deltas_data,
            behavior_deltas=behavior_deltas_data,
            known_unknowns=unknowns_data,
        )

    def _get_candidate_trace(
        self, snapshot: SourceSnapshot, target_symbol: Optional[str]
    ) -> List[Dict[str, Any]]:
        edges = RelationshipEdge.objects.filter(snapshot=snapshot)
        trace = []
        for e in edges[:5]:
            trace.append(
                {
                    "source": e.source_symbol_qname,
                    "target": e.target_symbol_qname,
                    "type": e.edge_type,
                    "provenance": e.provenance,
                    "file": e.source_file,
                    "line": e.line_number,
                }
            )
        return trace
