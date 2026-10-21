# DiffBeacon

> **Tagline:** See what a change touches.  
> **Category:** AI-Assisted Code-Change Understanding & Behavioral Impact Analysis  
> **Core Philosophy:** Understand the consequences of a code change before deciding whether it is safe, correct, or ready to ship.

---

## 1. What is DiffBeacon?

DiffBeacon is **not** another generic AI code reviewer, PR summarizer, decorative dependency graph, or chat assistant. 

Modern development teams are overwhelmed with multi-file code modifications created by autonomous agents and rapid engineering cycles. Traditional code review tools push noisy inline style critiques or generic bullet-point summaries.

**DiffBeacon takes a fundamentally different, investigative approach**: It builds an evidence-backed **Change Story** that explains how program behavior differs between two versions, which connected components are affected, which concrete situations deserve verification, and which conclusions remain uncertain.

---

## 2. Core Product Architecture

DiffBeacon is built around two primary innovations:

### 2.1 The Change Story
Answers six concrete questions with strict epistemic provenance separation:
1. **What changed between the two versions?** (Behavior Delta Ledger)
2. **What observable behavior may be different?** (Contract Surface Map)
3. **Which parts of the application are connected to that behavior?** (Evidence-backed Impact Explorer)
4. **Under which concrete situations might the change matter?** (Change Scenario Studio)
5. **What evidence supports each conclusion?** (Source Evidence Inspector)
6. **What should the developer verify, and what cannot yet be established?** (Verification Matrix & Unknowns Register)

### 2.2 The Signature Experience: Change Scenario Studio
Unlike conversational chatbots that hallucinate plausible answers, Scenario Studio is a **task-specific reasoning interface**:
- The developer asks a concrete question (*"What happens if a request omits department_id now?"*).
- Deterministic static analysis extracts the candidate execution paths in **both** the Base version and the Head version.
- The AI synthesizes a side-by-side behavioral trace comparing:
  - **A. Scenario Interpretation** (Normalized condition & assumptions)
  - **B. Before Path** (Step-by-step with verified source line citations)
  - **C. After Path** (Step-by-step with verified source line citations)
  - **D. Behavioral Delta** (Observable differences)
  - **E. Downstream Impact** (Ripple effects to models, audit logs, and consumers)
  - **F. Verification Plan** (Preconditions, input, expected result, matched tests)
  - **G. Uncertainty Report** (Unresolved dynamic dispatches, runtime DB state unknowns)
- All synthesized statements are audited by the **Stage 11 Claim Verifier**; fabricated line numbers or files are strictly rejected or downgraded to `unresolved`.

---

## 3. Strict Epistemic Provenance

Every statement and node in DiffBeacon carries an explicit classification:
- `Statically Established`: Proven by AST parsing, import resolution, or call graph analysis.
- `Framework Rule`: Derived from documented framework contracts (Django URLs, DRF serializers).
- `Inferred`: Inductive prediction synthesized by bounded LLM reasoning over verified static facts.
- `Unresolved / Unknown`: Explicit boundary where static analysis acknowledges it cannot know (e.g. `getattr()`, `eval()`, unseeded DB rows).
- `Runtime Verified`: Telemetry confirmed by actual executed test suites.

---

## 4. Built-In Zero-Credential Demo: BeaconWorks API

DiffBeacon comes pre-configured with a fictional, realistic Django REST Framework application called **`BeaconWorks API`**.

The demo runs **completely offline without requiring GitHub credentials, an AWS account, or a paid LLM API key**.

### Bundled Fixture Scenarios:
1. **Optional DRF Serializer Field:** `department_id` in `EmployeeCreateSerializer` made optional (`required=False`), with fallback default department assignment.
2. **Altered Validation Condition:** Minimum annual salary floor raised from $30,000 to $45,000.
3. **Django Model Default Shift:** `Employee.employment_status` default changed from `'probation'` to `'active'` with database migration.
4. **Modified Tax Rate:** Payroll tax deduction rate increased from 15% to 20% with caller traces and test references.
5. **Deleted Symbol with Broken Reference:** Deprecated `legacy_format_ssn` deleted from `utils.py`, leaving broken reference in `reporting.py`.
6. **Dynamic Method Dispatch:** `notifications.py` uses `getattr(notifier, f'send_{channel}')`, correctly isolated in the Unknowns Register.

---

## 5. Quickstart & Local Setup

### Prerequisites
- Python 3.11+
- Node.js v18+ (Node v20 or v22 recommended)
- `pip` and `npm`

### 5.1 Clone & Setup Environment
```bash
git clone https://github.com/your-org/diffbeacon.git
cd diffbeacon
cp .env.example .env
```

### 5.2 Backend Setup
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run database migrations (SQLite by default)
python backend/manage.py migrate

# Seed the built-in demo fixtures and execute the 12-stage analysis pipeline
python backend/manage.py seed_demo

# Start the Django REST Framework development server
python backend/manage.py runserver 8000
```
Backend API will be live at `http://localhost:8000/api/v1/`.

### 5.3 Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 6. Running Tests

### 6.1 Backend Automated Tests (Pytest)
```bash
cd backend
pytest
```
Covers:
- `test_ingestion.py`: ZipSlip traversal rejection, zip bombs, safe archive extraction.
- `test_parser.py`: Python AST symbol extraction, function calls, dynamic call detection.
- `test_framework_adapters.py`: DRF serializer field inspection, Django models, contract comparison.
- `test_graph.py`: Dependency graph builder, typed edge provenance, bounded BFS blast radius.
- `test_api_endpoints.py`: All REST API endpoints (`/demo/`, `/workspaces/`, `/analyses/`, `/scenarios/`).

### 6.2 Frontend Automated Tests (Vitest)
```bash
cd frontend
npm test
```
Tests epistemic badges, UI component rendering, and scenario trace presentations.

### 6.3 Production Frontend Build
```bash
cd frontend
npm run build
```
Type checks via `tsc` and compiles optimized production assets via Vite.

---

## 7. Containerized Deployment (Docker Compose)

To spin up DiffBeacon with containerized PostgreSQL and Redis:
```bash
docker-compose up --build -d
```
Services:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

---

## 8. Documentation Index

- [Architecture & Monorepo Boundaries](docs/architecture.md)
- [Competitive Analysis & Product Positioning](docs/competitive-analysis.md)
- [Data Model & Entity-Relationship Specification](docs/data-model.md)
- [12-Stage Analysis Pipeline Specification](docs/analysis-pipeline.md)
- [REST API Specification (`/api/v1/`)](docs/api-contract.md)
- [AI Architecture & Zero-Fabrication Guardrails](docs/ai-design.md)
- [Security & Privacy Boundaries](docs/security-and-privacy.md)
- [Supported Language & Framework Features](docs/supported-language-features.md)
- [Testing Strategy & Coverage Matrix](docs/testing.md)
- [Deployment & Operations Guide](docs/deployment.md)

---

## 9. Security & Privacy Notice

DiffBeacon treats uploaded source code as confidential, untrusted input:
- **ZipSlip Protection:** Normalized path enforcement prevents directory traversal during archive extraction.
- **Archive Safety Bounds:** 25 MB max compressed archive size, 1,000 max file entries.
- **Zero Arbitrary Execution:** Analyzes code purely via Python's native read-only AST parser. Does not execute user code, migrations, or setup scripts.
- **Zero Public Training:** Source excerpts are never used to train or fine-tune public AI foundation models.
