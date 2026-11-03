import hashlib
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest
from django.test import Client
from apps.analysis.engine import AnalysisPipelineEngine
from apps.analysis.models import AnalysisRun, EvidenceRecord
from apps.snapshots.models import SourceFile, SourceSnapshot
from apps.workspaces.models import Workspace


@pytest.mark.django_db
def test_demo_status_and_seed_endpoint():
    client = Client()

    # Test Demo Status
    res = client.get("/api/v1/demo/")
    assert res.status_code == 200
    data = res.json()
    assert data["demo_available"] is True
    assert "sample_scenarios" in data

    # Test Demo Seed (executes full analysis)
    seed_res = client.post("/api/v1/demo/seed/")
    assert seed_res.status_code == 201
    seed_data = seed_res.json()
    assert "analysis_id" in seed_data
    aid = seed_data["analysis_id"]

    # Test Analysis Run Details
    analysis_res = client.get(f"/api/v1/analyses/{aid}/")
    assert analysis_res.status_code == 200
    assert analysis_res.json()["status"] == "completed"

    # Test Behavior Deltas
    deltas_res = client.get(f"/api/v1/analyses/{aid}/deltas/")
    assert deltas_res.status_code == 200
    assert len(deltas_res.json()) >= 1

    # Test Contract Surface Map
    contracts_res = client.get(f"/api/v1/analyses/{aid}/contracts/")
    assert contracts_res.status_code == 200
    assert len(contracts_res.json()) >= 1

    # Test Impact Graph
    graph_res = client.get(f"/api/v1/analyses/{aid}/impact-graph/")
    assert graph_res.status_code == 200
    assert "nodes" in graph_res.json()
    assert "edges" in graph_res.json()

    # Test Unknowns Register
    unknowns_res = client.get(f"/api/v1/analyses/{aid}/unknowns/")
    assert unknowns_res.status_code == 200
    assert len(unknowns_res.json()) >= 1

    # Test Scenario Studio Creation & Traces
    scen_res = client.post(
        f"/api/v1/analyses/{aid}/scenarios/",
        {"question": "What happens if a request omits department_id now?"},
        content_type="application/json",
    )
    assert scen_res.status_code == 201
    scen_data = scen_res.json()
    assert "traces" in scen_data
    assert len(scen_data["traces"]["base"]) >= 1
    assert len(scen_data["traces"]["head"]) >= 1
    assert "verification_plan" in scen_data
    assert "uncertainty_report" in scen_data

    # Test Feedback Submission
    fb_res = client.post(
        f"/api/v1/analyses/{aid}/feedback/",
        {
            "target_type": "scenario",
            "target_id": scen_data["id"],
            "rating": "useful",
            "comment": "Accurately spotted the fallback department behavior.",
        },
        content_type="application/json",
    )
    assert fb_res.status_code == 201


@pytest.mark.django_db
def test_provider_settings_are_consistent():
    client = Client()
    res = client.get("/api/v1/settings/providers/")
    assert res.status_code == 200

    data = res.json()
    provider_ids = {provider["id"] for provider in data["providers"]}
    assert data["active_provider"] in provider_ids
    assert data["active_provider"] == "mock"
    assert "mock" in provider_ids


@pytest.mark.django_db
def test_evidence_citation_verifier_accepts_valid_excerpts():
    with TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        base_dir = root / "base"
        head_dir = root / "head"
        base_dir.mkdir()
        head_dir.mkdir()

        rel_path = "services/logic.py"
        base_content = "def old_logic():\n    return 1\n"
        head_content = "def new_logic():\n    return 2\n"
        (base_dir / "services").mkdir()
        (head_dir / "services").mkdir()
        (base_dir / rel_path).write_text(base_content, encoding="utf-8")
        (head_dir / rel_path).write_text(head_content, encoding="utf-8")

        workspace = Workspace.objects.create(name="Citation Check", slug="citation-check")
        base_snapshot = SourceSnapshot.objects.create(
            workspace=workspace,
            label="base",
            storage_path=str(base_dir),
            file_count=1,
            total_bytes=len(base_content.encode("utf-8")),
            ingestion_status="ready",
        )
        head_snapshot = SourceSnapshot.objects.create(
            workspace=workspace,
            label="head",
            storage_path=str(head_dir),
            file_count=1,
            total_bytes=len(head_content.encode("utf-8")),
            ingestion_status="ready",
        )
        SourceFile.objects.create(
            snapshot=base_snapshot,
            relative_path=rel_path,
            content_hash=hashlib.sha256(base_content.encode("utf-8")).hexdigest(),
            language="python",
            file_classification="source",
            line_count=2,
            parse_status="parsed",
        )
        SourceFile.objects.create(
            snapshot=head_snapshot,
            relative_path=rel_path,
            content_hash=hashlib.sha256(head_content.encode("utf-8")).hexdigest(),
            language="python",
            file_classification="source",
            line_count=2,
            parse_status="parsed",
        )

        analysis = AnalysisRun.objects.create(
            workspace=workspace,
            base_snapshot=base_snapshot,
            head_snapshot=head_snapshot,
            status="queued",
        )

        excerpt = "\n".join(head_content.splitlines())
        EvidenceRecord.objects.create(
            analysis=analysis,
            snapshot_side="head",
            file_path=rel_path,
            start_line=1,
            end_line=2,
            content_excerpt=excerpt,
            content_hash=hashlib.sha256(excerpt.encode("utf-8")).hexdigest(),
            originating_stage="stage_7_deltas",
        )

        AnalysisPipelineEngine()._verify_evidence_records(analysis)


@pytest.mark.django_db
def test_evidence_citation_verifier_rejects_broken_hash():
    with TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        base_dir = root / "base"
        head_dir = root / "head"
        base_dir.mkdir()
        head_dir.mkdir()

        rel_path = "services/logic.py"
        content = "def safe_logic():\n    return 42\n"
        (base_dir / "services").mkdir()
        (head_dir / "services").mkdir()
        (base_dir / rel_path).write_text(content, encoding="utf-8")
        (head_dir / rel_path).write_text(content, encoding="utf-8")

        workspace = Workspace.objects.create(name="Broken Citation", slug="broken-citation")
        base_snapshot = SourceSnapshot.objects.create(
            workspace=workspace,
            label="base",
            storage_path=str(base_dir),
            file_count=1,
            total_bytes=len(content.encode("utf-8")),
            ingestion_status="ready",
        )
        head_snapshot = SourceSnapshot.objects.create(
            workspace=workspace,
            label="head",
            storage_path=str(head_dir),
            file_count=1,
            total_bytes=len(content.encode("utf-8")),
            ingestion_status="ready",
        )
        SourceFile.objects.create(
            snapshot=base_snapshot,
            relative_path=rel_path,
            content_hash=hashlib.sha256(content.encode("utf-8")).hexdigest(),
            language="python",
            file_classification="source",
            line_count=2,
            parse_status="parsed",
        )
        SourceFile.objects.create(
            snapshot=head_snapshot,
            relative_path=rel_path,
            content_hash=hashlib.sha256(content.encode("utf-8")).hexdigest(),
            language="python",
            file_classification="source",
            line_count=2,
            parse_status="parsed",
        )

        analysis = AnalysisRun.objects.create(
            workspace=workspace,
            base_snapshot=base_snapshot,
            head_snapshot=head_snapshot,
            status="queued",
        )
        EvidenceRecord.objects.create(
            analysis=analysis,
            snapshot_side="head",
            file_path=rel_path,
            start_line=1,
            end_line=2,
            content_excerpt=content,
            content_hash="broken-hash",
            originating_stage="stage_7_deltas",
        )

        with pytest.raises(ValueError, match="Evidence citation mismatch"):
            AnalysisPipelineEngine()._verify_evidence_records(analysis)


@pytest.mark.django_db
def test_evidence_citation_verifier_rejects_out_of_bounds_lines():
    with TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        base_dir = root / "base"
        head_dir = root / "head"
        base_dir.mkdir()
        head_dir.mkdir()

        rel_path = "services/logic.py"
        content = "line 1\nline 2\n"
        (base_dir / "services").mkdir()
        (head_dir / "services").mkdir()
        (base_dir / rel_path).write_text(content, encoding="utf-8")
        (head_dir / rel_path).write_text(content, encoding="utf-8")

        workspace = Workspace.objects.create(name="OOB Lines", slug="oob-lines")
        base_snapshot = SourceSnapshot.objects.create(
            workspace=workspace, label="base", storage_path=str(base_dir), file_count=1, ingestion_status="ready"
        )
        head_snapshot = SourceSnapshot.objects.create(
            workspace=workspace, label="head", storage_path=str(head_dir), file_count=1, ingestion_status="ready"
        )

        analysis = AnalysisRun.objects.create(
            workspace=workspace, base_snapshot=base_snapshot, head_snapshot=head_snapshot, status="queued"
        )
        EvidenceRecord.objects.create(
            analysis=analysis,
            snapshot_side="head",
            file_path=rel_path,
            start_line=1,
            end_line=999,  # exceeds file length (2 lines)
            content_excerpt=content,
            content_hash=hashlib.sha256(content.encode("utf-8")).hexdigest(),
            originating_stage="stage_7_deltas",
        )

        with pytest.raises(ValueError, match="Evidence range exceeds file length"):
            AnalysisPipelineEngine()._verify_evidence_records(analysis)


@pytest.mark.django_db
def test_evidence_citation_verifier_rejects_missing_file():
    with TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        base_dir = root / "base"
        head_dir = root / "head"
        base_dir.mkdir()
        head_dir.mkdir()

        workspace = Workspace.objects.create(name="Missing File", slug="missing-file")
        base_snapshot = SourceSnapshot.objects.create(
            workspace=workspace, label="base", storage_path=str(base_dir), file_count=0, ingestion_status="ready"
        )
        head_snapshot = SourceSnapshot.objects.create(
            workspace=workspace, label="head", storage_path=str(head_dir), file_count=0, ingestion_status="ready"
        )

        analysis = AnalysisRun.objects.create(
            workspace=workspace, base_snapshot=base_snapshot, head_snapshot=head_snapshot, status="queued"
        )
        EvidenceRecord.objects.create(
            analysis=analysis,
            snapshot_side="head",
            file_path="nonexistent.py",
            start_line=1,
            end_line=5,
            content_excerpt="code",
            content_hash="hash",
            originating_stage="stage_7_deltas",
        )

        with pytest.raises(ValueError, match="Evidence file not found in snapshot"):
            AnalysisPipelineEngine()._verify_evidence_records(analysis)
