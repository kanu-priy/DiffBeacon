# DiffBeacon REST API Specification (`/api/v1/`)

**Version:** 1.0.0  
**Status:** Approved  
**Base URL:** `http://localhost:8000/api/v1`

---

## 1. Authentication & Tenancy

DiffBeacon operates in two modes:
1. **Local / Demo Mode:** No authentication token required; operations default to the default local workspace or demo workspace.
2. **Authenticated Mode (Optional):** Token-based authentication via `Authorization: Bearer <token>` or `Authorization: Token <token>`.

---

## 2. API Endpoints

### 2.1 Demo & Workspace Management

#### `GET /api/v1/demo/`
Returns the status of the built-in demo workspace and whether it is seeded.
- **Response `200 OK`**:
```json
{
  "demo_available": true,
  "workspace_id": "00000000-0000-0000-0000-000000000001",
  "project_name": "BeaconWorks API",
  "base_version": "v1.0-baseline",
  "head_version": "v1.1-department-update",
  "sample_scenarios": [
    {
      "id": "scenario-missing-dept",
      "question": "What happens if a request omits department_id now?",
      "target_symbol": "api.serializers.EmployeeCreateSerializer"
    },
    {
      "id": "scenario-salary-bounds",
      "question": "How does salary validation behave between versions?",
      "target_symbol": "api.services.payroll.validate_compensation"
    }
  ]
}
```

#### `POST /api/v1/demo/seed/`
Seeds the database with the built-in `BeaconWorks API` fixture snapshots and triggers initial analysis.
- **Response `201 Created`**:
```json
{
  "message": "Demo workspace seeded successfully",
  "workspace_id": "00000000-0000-0000-0000-000000000001",
  "analysis_id": "00000000-0000-0000-0000-000000000010",
  "status": "completed"
}
```

#### `GET /api/v1/workspaces/`
Lists all workspaces.
- **Response `200 OK`**: Array of Workspace objects.

#### `POST /api/v1/workspaces/`
Creates a new workspace.
- **Request Body**:
```json
{
  "name": "Acme Core Backend",
  "description": "Payment microservices repo"
}
```
- **Response `201 Created`**: Workspace object.

---

### 2.2 Snapshot Ingestion

#### `POST /api/v1/workspaces/{workspace_id}/snapshots/`
Uploads a base or head source ZIP snapshot.
- **Request:** `multipart/form-data`
  - `label`: string (e.g. `base-v1.0` or `head-pr-42`)
  - `archive`: ZIP file binary
- **Response `201 Created`**:
```json
{
  "id": "b3e94589-3e9a-41ab-850c-e2f41bce8092",
  "workspace_id": "00000000-0000-0000-0000-000000000001",
  "label": "base-v1.0",
  "source_hash": "a1b2c3...",
  "file_count": 28,
  "total_bytes": 142080,
  "ingestion_status": "ready"
}
```
- **Errors:**
  - `400 Bad Request`: Invalid ZIP, path traversal attempt (`..`), exceeds 25 MB limit or 1000 files.

---

### 2.3 Analysis Lifecycle

#### `POST /api/v1/analyses/`
Triggers an analysis run between a base snapshot and a head snapshot.
- **Request Body**:
```json
{
  "workspace_id": "00000000-0000-0000-0000-000000000001",
  "base_snapshot_id": "b3e94589-3e9a-41ab-850c-e2f41bce8092",
  "head_snapshot_id": "c7f12345-4a1b-42ab-950c-e2f41bce8093",
  "ai_provider": "mock"
}
```
- **Response `202 Accepted`**:
```json
{
  "id": "e9104820-2f11-4712-a1b2-9900aabbccdd",
  "status": "running",
  "current_stage": "stage_1_ingest",
  "stages_completed": []
}
```

#### `GET /api/v1/analyses/{analysis_id}/`
Returns the status and summary of an analysis run.
- **Response `200 OK`**:
```json
{
  "id": "e9104820-2f11-4712-a1b2-9900aabbccdd",
  "workspace_id": "00000000-0000-0000-0000-000000000001",
  "status": "completed",
  "base_snapshot_label": "v1.0-baseline",
  "head_snapshot_label": "v1.1-department-update",
  "stages_completed": [
    "stage_1_ingest", "stage_2_diff", "stage_3_ast", "stage_4_framework",
    "stage_5_symbols", "stage_6_graph", "stage_7_deltas", "stage_8_impact",
    "stage_9_scenarios", "stage_10_ai_synthesis", "stage_11_verification", "stage_12_persist"
  ],
  "counts": {
    "deltas": 5,
    "contracts": 4,
    "graph_nodes": 42,
    "graph_edges": 68,
    "scenarios": 2,
    "verification_cases": 4,
    "unknowns": 2
  }
}
```

---

### 2.4 Change Story Sections

#### `GET /api/v1/analyses/{analysis_id}/deltas/`
Lists all detected behavior deltas.
- **Response `200 OK`**:
```json
[
  {
    "id": "delta-01",
    "category": "api_contract",
    "title": "Optional Department Field in Employee Creation",
    "summary": "EmployeeCreateSerializer now allows department_id to be omitted.",
    "before_behavior": "department_id is required; missing field raises HTTP 400 ValidationError.",
    "after_behavior": "department_id defaults to None; downstream handler assigns default 'Unassigned' department.",
    "affected_symbol": "api.serializers.EmployeeCreateSerializer",
    "file_path": "beaconworks/api/serializers.py",
    "base_line_range": [24, 30],
    "head_line_range": [25, 33],
    "confidence": "statically_established"
  }
]
```

#### `GET /api/v1/analyses/{analysis_id}/contracts/`
Lists API route, serializer, model, and permission contract differences.
- **Response `200 OK`**:
```json
[
  {
    "id": "contract-01",
    "contract_type": "drf_serializer",
    "identifier": "EmployeeCreateSerializer.department_id",
    "change_nature": "modified_optional",
    "before_spec": { "type": "PrimaryKeyRelatedField", "required": true },
    "after_spec": { "type": "PrimaryKeyRelatedField", "required": false, "allow_null": true },
    "is_breaking": false,
    "compatibility_assessment": "Backward-compatible schema expansion; existing clients providing the field continue to work."
  }
]
```

#### `GET /api/v1/analyses/{analysis_id}/impact-graph/`
Returns the dependency graph filtered to changed symbols and their blast radius.
- **Query Params:**
  - `side`: `head` (default) or `base`
  - `radius`: integer (default `2`)
- **Response `200 OK`**:
```json
{
  "nodes": [
    {
      "id": "node-1",
      "label": "EmployeeViewSet.create",
      "type": "method",
      "file_path": "beaconworks/api/views.py",
      "line_number": 45,
      "is_changed": false
    },
    {
      "id": "node-2",
      "label": "EmployeeCreateSerializer",
      "type": "class",
      "file_path": "beaconworks/api/serializers.py",
      "line_number": 24,
      "is_changed": true
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "serializes",
      "provenance": "framework_rule"
    }
  ]
}
```

#### `GET /api/v1/analyses/{analysis_id}/unknowns/`
Returns the Unknowns Register.
- **Response `200 OK`**:
```json
[
  {
    "id": "unk-01",
    "title": "Dynamic Method Dispatch in Webhook Dispatcher",
    "reason": "dynamic_dispatch",
    "file_path": "beaconworks/services/notifications.py",
    "line_number": 68,
    "code_snippet": "getattr(notifier, f'send_{channel}')(*args, **kwargs)",
    "explanation": "Channel routing uses dynamic string formatting with getattr; static analysis cannot confirm which handlers are called at runtime.",
    "resolution_strategy": "Instrument dynamic call with OpenTelemetry or add explicit unit test asserting supported channel strings."
  }
]
```

---

### 2.5 Change Scenario Studio

#### `POST /api/v1/analyses/{analysis_id}/scenarios/`
Submits a concrete question to the Scenario Studio.
- **Request Body**:
```json
{
  "question": "What happens if a request omits department_id now?",
  "target_symbol": "api.serializers.EmployeeCreateSerializer"
}
```
- **Response `201 Created`**:
```json
{
  "id": "scenario-01",
  "question": "What happens if a request omits department_id now?",
  "normalized_condition": "HTTP POST /api/v1/employees/ with payload payload={'first_name': 'Jane', 'last_name': 'Doe'} (department_id omitted)",
  "behavioral_delta_summary": "In base version, request fails immediately at serializer validation with 400 Bad Request. In head version, validation passes and service assigns default department ID 1.",
  "impact_summary": "Downstream payroll service and audit logger receive an employee record with default department.",
  "traces": {
    "base": [
      {
        "step_index": 1,
        "symbol": "api.views.EmployeeViewSet.create",
        "file_path": "beaconworks/api/views.py",
        "line_number": 48,
        "explanation": "Receives POST request payload without department_id.",
        "provenance": "statically_established"
      },
      {
        "step_index": 2,
        "symbol": "api.serializers.EmployeeCreateSerializer.is_valid",
        "file_path": "beaconworks/api/serializers.py",
        "line_number": 32,
        "explanation": "Validation fails: field 'department_id' is marked required=True.",
        "provenance": "framework_rule"
      }
    ],
    "head": [
      {
        "step_index": 1,
        "symbol": "api.views.EmployeeViewSet.create",
        "file_path": "beaconworks/api/views.py",
        "line_number": 48,
        "explanation": "Receives POST request payload without department_id.",
        "provenance": "statically_established"
      },
      {
        "step_index": 2,
        "symbol": "api.serializers.EmployeeCreateSerializer.is_valid",
        "file_path": "beaconworks/api/serializers.py",
        "line_number": 35,
        "explanation": "Validation succeeds: required=False allows missing key.",
        "provenance": "framework_rule"
      },
      {
        "step_index": 3,
        "symbol": "api.services.employee.assign_default_department",
        "file_path": "beaconworks/services/employee.py",
        "line_number": 19,
        "explanation": "Assigns default department 'Unassigned' before saving.",
        "provenance": "statically_established"
      }
    ]
  },
  "verification_plan": {
    "preconditions": "Database contains default 'Unassigned' department (pk=1).",
    "input_data": "{'first_name': 'Alice', 'last_name': 'Smith'}",
    "expected_result": "HTTP 201 Created; response JSON contains department_id=1.",
    "existing_test_ref": "tests.test_api.test_create_employee_with_department",
    "coverage_classification": "suggested_uncovered",
    "execution_status": "not_executed"
  },
  "uncertainty_report": [
    "Default department ID 1 is assumed to exist in the database; missing database row at runtime will trigger IntegrityError."
  ]
}
```

---

### 2.6 Feedback & Historical Comparison

#### `POST /api/v1/analyses/{analysis_id}/feedback/`
Submits developer feedback on a finding or scenario.
- **Request Body**:
```json
{
  "target_type": "scenario",
  "target_id": "scenario-01",
  "rating": "useful",
  "comment": "Accurately spotted the missing default department edge case."
}
```
- **Response `201 Created`**: Feedback confirmation.

#### `GET /api/v1/workspaces/{workspace_id}/history/`
Returns historical immutable analysis runs with high-level comparison metrics.
- **Response `200 OK`**: Array of historical analysis summaries.
