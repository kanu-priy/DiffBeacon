# DiffBeacon

DiffBeacon helps teams understand what a code change actually does before they ship it.

Instead of summarizing a diff in generic language, DiffBeacon explains the behavioral impact of a change: what changed, which systems are connected to it, what scenarios are at risk, and what still needs verification.

---

## What DiffBeacon does

DiffBeacon is a code-change intelligence platform for engineering teams working with multi-file, multi-service, and AI-assisted code changes.

It combines static analysis, framework-aware reasoning, and evidence tracing to help teams answer questions like:

- What behavior changed between two versions?
- Which downstream systems or APIs are affected?
- What real-world scenarios may break?
- What evidence supports the conclusion?
- What remains uncertain and should be verified?

### Core capabilities

- Change Story analysis for comparing two versions of a codebase
- Behavior delta tracking across contracts, routes, models, and logic
- Impact exploration to show connected application areas
- Scenario-based reasoning for edge cases and risky flows
- Evidence inspector with source-backed explanations
- Verification guidance that highlights unknowns and confidence levels

---

## Why it matters

Modern software changes are rarely isolated. A small code tweak can ripple across validation rules, serializers, routes, business logic, and downstream consumers.

DiffBeacon is designed to make those effects visible early, so teams can reason about safety, risk, and change impact with more confidence.

---

## How the product works

DiffBeacon analyzes a base version and a head version, then builds a structured view of the change.

It helps teams review:

1. What changed in behavior
2. Which application surfaces are connected to that behavior
3. Which scenarios are likely to be affected
4. What evidence supports each conclusion
5. What should be verified before merging or releasing

The app surfaces this through a set of focused interfaces including:

- Workspaces and snapshot history
- Impact graph exploration
- Contracts and behavioral comparisons
- Scenario Studio
- Evidence inspection
- Languages and framework capability registry

---

## Built-in demo

The project includes a realistic demo application named BeaconWorks API so the platform can be explored without needing external credentials or a live production system.

It includes sample changes such as:

- serializer field updates
- validation rule changes
- default value and status updates
- tax and business-rule changes
- deleted symbols and broken references
- dynamic dispatch cases

This makes it easy to test the product locally and understand how DiffBeacon explains change impact.

---

## Local setup

### Prerequisites

- Python 3.11+
- Node.js 18+ (20 or 22 recommended)
- pip and npm

### 1) Clone the project

```bash
git clone https://github.com/your-org/diffbeacon.git
cd diffbeacon
cp .env.example .env
```

### 2) Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

The backend API runs at:

- http://localhost:8000

### 3) Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

- http://localhost:5173

---

## Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

### Production build

```bash
cd frontend
npm run build
```

---

## Documentation

- [Architecture](docs/architecture.md)
- [Analysis pipeline](docs/analysis-pipeline.md)
- [API contract](docs/api-contract.md)
- [Data model](docs/data-model.md)
- [AI design](docs/ai-design.md)
- [Deployment guide](docs/deployment.md)
- [Security and privacy](docs/security-and-privacy.md)
- [Supported language features](docs/supported-language-features.md)
- [Testing strategy](docs/testing.md)
- [Competitive analysis](docs/competitive-analysis.md)

---

## Security and privacy

DiffBeacon is designed to treat uploaded source as sensitive, untrusted input.

- archive extraction is constrained and validated
- code is analyzed without arbitrary execution
- generated conclusions are evidence-based rather than fabricated
- source content is not treated as public training data

---

## Project status

This project is an active product prototype focused on helping teams reason about code changes more clearly, with stronger evidence and less guesswork.
