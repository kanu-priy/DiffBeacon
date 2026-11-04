import os
import sys
import json
from pathlib import Path

# Add backend to path and setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from apps.workspaces.models import Workspace
from apps.analysis.models import (
    AnalysisRun,
    BehaviorDelta,
    ContractDelta,
    UnknownEntry,
    EvidenceRecord,
    VerificationCase,
)
from apps.scenarios.models import ScenarioQuery, ScenarioTrace
from apps.snapshots.models import RelationshipEdge, SourceFile, SourceSnapshot
from apps.code_index.multi_parser import LANGUAGE_DEFINITIONS

def clean(obj):
    if isinstance(obj, dict):
        return {str(k): clean(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean(v) for v in obj]
    elif hasattr(obj, "isoformat"):
        return obj.isoformat()
    elif hasattr(obj, "hex"):
        return str(obj)
    return obj

def run():
    analysis = AnalysisRun.objects.filter(status="completed").first()
    if not analysis:
        print("No completed analysis found!")
        return

    workspace = analysis.workspace
    head_snap = analysis.head_snapshot
    base_snap = analysis.base_snapshot

    # Build Impact Graph data for frontend
    # Nodes: Symbols + Routes + Clients
    edges = list(RelationshipEdge.objects.filter(snapshot=head_snap).values())
    nodes_map = {}
    
    # Collect all unique symbols referenced in edges
    for e in edges:
        src = e["source_symbol_qname"]
        tgt = e["target_symbol_qname"]
        if src not in nodes_map:
            nodes_map[src] = {
                "id": src,
                "label": src.split(":")[-1] if ":" in src else src.split(".")[-1],
                "type": "client" if ":" in src and "." in src else ("route" if src.startswith("ROUTE:") else "function"),
                "file_path": e.get("source_file", ""),
                "line_number": e.get("line_number", 1),
                "is_changed": False,
            }
        if tgt not in nodes_map:
            nodes_map[tgt] = {
                "id": tgt,
                "label": tgt.replace("ROUTE:", "") if tgt.startswith("ROUTE:") else tgt.split(".")[-1],
                "type": "route" if tgt.startswith("ROUTE:") else "serializer" if "Serializer" in tgt else "view" if "View" in tgt else "function",
                "file_path": "",
                "line_number": 1,
                "is_changed": True,
            }

    impact_graph = {
        "nodes": list(nodes_map.values()),
        "edges": [
            {
                "source": e["source_symbol_qname"],
                "target": e["target_symbol_qname"],
                "type": e["edge_type"],
                "provenance": e.get("provenance", "ast_static"),
                "certainty": e.get("certainty", "definite"),
                "file_path": e.get("source_file", ""),
                "line_number": e.get("line_number", 1),
            }
            for e in edges
        ],
        "blast_radius_score": 14,
        "entrypoints_affected": 2,
        "data_models_affected": 1,
    }

    scenarios_list = []
    for sq in ScenarioQuery.objects.filter(analysis=analysis):
        sq_dict = {
            "id": str(sq.id),
            "analysis": str(sq.analysis_id),
            "question": sq.question,
            "target_symbol": sq.target_symbol,
            "normalized_condition": sq.normalized_condition,
            "target_behavior": sq.target_behavior,
            "interpretation_assumptions": sq.interpretation_assumptions,
            "behavioral_delta_summary": sq.behavioral_delta_summary,
            "impact_summary": sq.impact_summary,
            "verification_plan": sq.verification_plan,
            "uncertainty_report": sq.uncertainty_report,
            "status": sq.status,
            "created_at": sq.created_at.isoformat(),
            "traces": list(sq.traces.values()),
        }
        scenarios_list.append(sq_dict)

    demo_data = {
        "workspace": {
            "id": str(workspace.id),
            "name": workspace.name,
            "slug": workspace.slug,
            "description": workspace.description,
            "is_demo": workspace.is_demo,
            "retention_days": workspace.retention_days,
            "created_at": workspace.created_at.isoformat(),
            "updated_at": workspace.updated_at.isoformat(),
            "analysis_count": 1,
            "snapshot_count": 2,
        },
        "analysis": {
            "id": str(analysis.id),
            "workspace": str(workspace.id),
            "base_snapshot": str(base_snap.id),
            "head_snapshot": str(head_snap.id),
            "base_snapshot_label": base_snap.label,
            "head_snapshot_label": head_snap.label,
            "status": analysis.status,
            "current_stage": analysis.current_stage,
            "stages_completed": analysis.stages_completed,
            "engine_version": analysis.engine_version,
            "ai_provider_name": analysis.ai_provider_name,
            "error_details": analysis.error_details,
            "started_at": analysis.started_at.isoformat() if analysis.started_at else None,
            "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None,
            "created_at": analysis.created_at.isoformat(),
            "counts": {
                "deltas": analysis.deltas.count(),
                "contracts": analysis.contracts.count(),
                "unknowns": analysis.unknowns.count(),
                "scenarios": analysis.scenarios.count(),
            },
        },
        "deltas": list(analysis.deltas.values()),
        "contracts": list(analysis.contracts.values()),
        "unknowns": list(analysis.unknowns.values()),
        "scenarios": scenarios_list,
        "evidence": list(analysis.evidence_records.values()),
        "verification_cases": list(analysis.verification_cases.values()),
        "impact_graph": impact_graph,
        "files": {
            "base": list(SourceFile.objects.filter(snapshot=base_snap).values("relative_path", "language", "file_classification", "line_count")),
            "head": list(SourceFile.objects.filter(snapshot=head_snap).values("relative_path", "language", "file_classification", "line_count")),
        },
        "languages": [l.to_dict() for l in LANGUAGE_DEFINITIONS.values()],
    }

    cleaned = clean(demo_data)

    out_path = Path(__file__).resolve().parent.parent / "frontend" / "src" / "lib" / "demoData.ts"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("/* Auto-generated standalone demo data for zero-failure online & offline preview */\n")
        f.write("export const DEMO_DATA = " + json.dumps(cleaned, indent=2) + " as const;\n")

    print(f"Successfully wrote demoData.ts to {out_path} ({len(cleaned['deltas'])} deltas, {len(cleaned['contracts'])} contracts)")

if __name__ == "__main__":
    run()
