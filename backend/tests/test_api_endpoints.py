import pytest
from django.test import Client
from apps.workspaces.models import Workspace
from apps.analysis.models import AnalysisRun


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
