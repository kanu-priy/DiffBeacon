# Build DiffBeacon From Scratch — Complete Product, Unique AI Experience, Architecture, and Implementation Specification

## 1. Your role

Act as a principal software architect, senior full-stack engineer, AI engineer, static-analysis engineer, security engineer, and product designer.

Your task is to design and implement **DiffBeacon**, a working, extensible code-change intelligence platform.

You must build the project from an empty directory. I will not provide an existing repository for you to modify, a GitHub repository to analyze, or a pre-existing codebase. Create the entire DiffBeacon application, its sample source project, fixtures, tests, and documentation yourself.

Do not stop at a project proposal, UI mockup, README, or architecture diagram. Build a working application with a genuine frontend, backend, analysis engine, AI integration, database, and reproducible local setup.

Make sensible engineering decisions independently. Work in small implementation phases, test each phase, and report limitations honestly.

## 2. Product identity

**Product:** DiffBeacon

**Tagline:** See what a change touches.

**Category:** AI-assisted code-change understanding and behavioral impact analysis.

**Product philosophy:** Understand the consequences of a code change before deciding whether it is safe, correct, or ready to ship.

DiffBeacon must not be another generic AI code reviewer, pull-request summarizer, code chatbot, or decorative dependency graph.

Its primary output is an evidence-backed explanation of how behavior differs between two versions of a program, which connected components may be affected, which scenarios deserve verification, and which conclusions remain uncertain.

The application should be useful to developers reviewing unfamiliar code, understanding large changes, maintaining backend systems, and learning the behavior of existing applications.

## 3. Mandatory competitive research

Before locking down the product positioning, inspect current official documentation and product pages for:

- GitHub Copilot code review and pull-request exploration.
- Greptile.
- CodeRabbit.
- Other relevant code analysis and change-impact products discovered through research.

Determine which capabilities already exist, how they actually work, and where the proposed workflow overlaps.

Do not claim that graphs, dependency analysis, code explanations, test suggestions, AI conversations, scenario analysis, or source-linked findings are uniquely available to DiffBeacon.

Create `docs/competitive-analysis.md` with:

1. Competitor and product links.
2. Verified existing capabilities.
3. The specific user workflow each product supports.
4. Areas of direct overlap.
5. A proposed distinction for DiffBeacon.
6. Evidence gaps and unresolved competitive questions.
7. The assumptions that must be tested with actual developers.

If web access is unavailable, clearly mark the research as incomplete and proceed with an explicitly provisional product direction.

**The goal is a genuinely differentiated experience, not a false claim of originality.**

## 4. The core product concept

Build DiffBeacon around a structured artifact called the **Change Story**.

A Change Story answers six connected questions:

1. What changed between the two versions?
2. What observable behavior may be different?
3. Which parts of the application are connected to that behavior?
4. Under which concrete situations might the change matter?
5. What evidence supports each conclusion?
6. What should the developer verify, and what cannot yet be established?

Every Change Story must distinguish source-backed facts, statically established relationships, inferences, suggestions, and unknowns.

The interface must allow a developer to inspect the evidence behind a statement instead of trusting an opaque AI-generated conclusion.

## 5. The signature AI experience: Change Scenario Studio

This is the principal product differentiator to explore and validate.

Do not make it a general-purpose chatbot placed beside a diff viewer. Design a task-specific reasoning interface that begins with a developer's question about a concrete behavior.

### Example scenario

Suppose a fictional Django application has an API endpoint that returns an employee record.

In the base version, a serializer requires a particular field. In the new version, that field is optional, and a downstream function handles missing values differently.

A developer can ask:

**“What happens if a request omits this field now?”**

DiffBeacon should produce a structured scenario trace:

**A. Scenario interpretation**

Translate the question into a concrete condition, such as a request where the field is absent. Identify any assumptions that must be made.

**B. Before path**

Show the relevant supported path through the base version. Explain which conditions, functions, validations, or contracts are relevant and link each step to the appropriate source lines.

**C. After path**

Show the corresponding path in the changed version, with the same level of source evidence.

**D. Behavioral delta**

Explain exactly what differs between the two paths, which observable behaviors may change, and which aspects cannot be determined from static code analysis alone.

**E. Impact explanation**

Trace the relevant changed behavior through supported relationships to downstream functions, contracts, consumers, and tests.

**F. Verification plan**

Suggest a concrete test case with preconditions, input, expected result, and rationale. Identify whether a relevant test already exists, whether a test is merely suggested, and whether any test has actually been executed.

**G. Uncertainty report**

Identify unresolved dynamic calls, incomplete source context, framework assumptions, or runtime behavior that prevents a confident conclusion.

All steps must be navigable to source evidence where applicable.

### Scenario interactions

Provide predefined scenario starters such as:

- What happens when this input is missing?
- Which API contracts could change?
- What is different in the old and new execution paths?
- Which downstream consumers may be affected?
- What tests would distinguish the previous and proposed behavior?
- What assumptions are needed to reach this conclusion?

Also provide a natural-language question field that accepts follow-up questions within the selected analysis.

The system must resolve the question against the existing analysis snapshot rather than treating the entire codebase as unconstrained conversational context.

### AI reasoning architecture

The AI must never invent a source file, function, line number, dependency edge, contract, or test.

Use deterministic analysis to extract source evidence and candidate paths. Give the AI a bounded, structured evidence package containing the relevant changed symbols, source excerpts, graph paths, and before/after representations.

The AI may interpret a developer's question, select relevant evidence, explain differences, identify possible scenarios, and formulate verification recommendations.

The AI must not manufacture missing structural facts.

When the evidence does not support an answer, return an explicit unresolved result. Do not generate a confident answer merely because the question expects one.

Represent each AI result as structured data validated against a schema. Every factual claim should reference evidence identifiers or declare that it is an inference.

### What must not be claimed

Static analysis is not equivalent to executing a program.

Do not describe a predicted execution path as a confirmed runtime trace. Use labels such as:

- Statically established.
- Framework-rule based.
- Inferred.
- Unresolved.
- Runtime verified, only if an explicitly configured and trusted test execution actually occurred.

This distinction is a core requirement of the product.

## 6. Additional essential product features

### 6.1 Behavior Delta Ledger

Explain meaningful changes in behavior rather than only describing added and removed lines.

For each delta, provide:

- Before-version behavior.
- After-version behavior.
- Changed symbols and relevant source locations.
- Observable implications, where supported.
- Affected contracts or consumers.
- Supporting evidence.
- Confidence classification and unresolved assumptions.

Avoid repeating the same explanation separately for every changed line.

### 6.2 Contract Surface Map

Compare supported contracts across the two versions.

Initially support relevant elements including:

- API routes and HTTP methods.
- Django REST Framework serializers and response fields.
- Django models, field definitions, constraints, and migrations.
- Permissions and authentication-related declarations.
- Function signatures and selected configuration contracts.
- Known service interfaces and event payloads where detectable.

Identify structural differences and explain their potential implications.

Never label every structural change as a breaking change. Distinguish a schema difference from a demonstrated compatibility problem.

### 6.3 Evidence-backed Impact Explorer

Build an interactive graph rooted in changed files or symbols.

Include only relationships supported by the analysis, such as:

- Imports and references.
- Direct function calls.
- Known callers and callees.
- API route to view.
- View to serializer.
- Known model access.
- Relevant tests and their references.
- Framework-derived relationships explicitly marked as such.

Each relationship must have a type, provenance, and source evidence.

Clicking a node or edge must open its details and relevant code. Users should be able to filter paths, expand related nodes, and switch between the base and head versions.

Avoid creating a graph based solely on similar naming conventions. A possible relationship is not a verified dependency.

### 6.4 Verification Matrix

Derive verification recommendations from actual detected changes and relevant test evidence.

For each recommendation, show:

- The behavioral change it addresses.
- Preconditions and input.
- Expected result.
- Reason the test is relevant.
- Existing related test references, if found.
- Whether the scenario is already covered, possibly covered, or has unknown coverage.
- Whether the test has actually run.

Do not claim complete coverage from finding a test that merely mentions the same function.

### 6.5 Unknowns Register

Show the limits of the analysis as first-class product information.

Include unresolved dynamic calls, missing files, ambiguous symbol mappings, unsupported language constructs, incomplete context, framework assumptions, and conclusions requiring runtime verification.

Explain which additional evidence would help resolve an unknown.

### 6.6 Historical Change Stories

Store analysis metadata and results for the same project and snapshot pair.

Enable comparison of findings across later snapshots, showing new, resolved, changed, and unresolved claims.

Keep the original analysis immutable. If an analysis is rerun, record the new configuration and result rather than silently overwriting the older evidence.

### 6.7 Feedback

Allow developers to mark explanations as useful, incorrect, or inconclusive and optionally provide a reason.

Use feedback initially for visible analytics and evaluation. Do not silently retrain the AI or suppress findings without a documented mechanism.

## 7. The application must work without a user-provided repository

Do not wait for a GitHub repository, repository URL, access token, or existing source project.

Create a realistic, fictional Python/Django sample project inside the DiffBeacon codebase specifically for demonstrating and testing the analysis workflow.

Call this fixture project `BeaconWorks API`.

It should contain:

- Django models.
- REST API views.
- Serializers.
- URL routing.
- Business logic or service functions.
- Tests.
- At least two meaningful source snapshots.
- Several deliberately designed changes with known expected behavioral differences.
- A mix of easily verifiable dependencies and at least one intentionally unresolved case.

For example, a fixture change may alter serializer validation, make an API field optional, modify a model default, change a permission condition, or adjust a service's error handling.

Store the base and head versions separately. Provide fixture metadata describing the expected changes and evidence locations. Do not embed the expected final analysis as hardcoded production output.

The local demo must run entirely from seeded data and must not make external API calls or require an AI credential to start.

### Initial input options

Implement the following in priority order:

1. **Built-in demo:** Select a predefined sample change and generate an actual analysis from the bundled fixtures.
2. **Local snapshot upload:** Upload a base source ZIP and a head source ZIP for a project the user is authorized to analyze.
3. **Optional patch workflow:** Support a source ZIP plus a unified diff only when patch validation and application are implemented correctly.
4. **Future integration:** GitHub App support may be added after the local workflow is reliable. It must not be a prerequisite for the MVP.

Implement secure archive handling, including path traversal prevention, archive size limits, file-count limits, binary-file handling, and cleanup.

Clearly label bundled examples as demo data. Do not show fake AI findings in a real uploaded-source analysis.

## 8. Technical stack

Use a modular monolith to start. Do not introduce unnecessary microservices.

### Frontend

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- Accessible UI components, such as shadcn/ui.
- React Router.
- TanStack Query.
- React Flow or a comparable maintained library for interactive graph visualization.
- Monaco Editor or another appropriate source viewer with line highlighting.
- Vitest and React Testing Library.

### Backend

- Python 3.11 or a compatible supported version.
- Django and Django REST Framework.
- PostgreSQL.
- Celery and Redis if required for asynchronous analysis.
- Pytest and pytest-django.
- A pluggable LLM provider interface.
- Pydantic or an equivalent validation layer for internal structured analysis output.

Select compatible, maintained dependency versions. Pin them and document the choices.

Use deterministic static analysis as the primary source of structural facts. The AI layer must depend on the analysis interfaces, not independently parse the entire repository as its source of truth.

### Local development

Provide Docker Compose configuration for the application dependencies and clear commands for:

- Installing dependencies.
- Setting up environment variables.
- Starting the database and backend.
- Starting the frontend.
- Applying migrations.
- Loading the fictional sample project.
- Running tests.
- Building the frontend for production.

The app must remain demonstrable without paid API keys.

## 9. Architecture and module boundaries

Use an organized monorepo, such as:

diffbeacon/
  frontend/
    src/
      app/
      components/
      features/
        dashboard/
        changes/
        scenarios/
        contracts/
        impact-graph/
        verification/
        evidence/
        history/
      lib/
      types/
    tests/
  backend/
    config/
    apps/
      workspaces/
      snapshots/
      ingestion/
      code_index/
      analysis/
      contracts/
      impacts/
      scenarios/
      verification/
      evidence/
      history/
      integrations/
    tests/
    manage.py
  fixtures/
    beaconworks_api/
      base/
      head/
      expected/
  docs/
  scripts/
  docker-compose.yml
  .env.example
  README.md

Refine this structure if needed, but preserve the separation of responsibilities.

### Module responsibilities

**Workspaces:** Project metadata, user access, analysis settings, and project lifecycle.

**Snapshots:** Base/head snapshot metadata and immutable identifiers.

**Ingestion:** Safe source upload, ZIP validation, file normalization, file filtering, and temporary source storage.

**Code index:** Parsing and symbol extraction.

**Analysis:** Pipeline orchestration and Change Story assembly.

**Contracts:** Extraction and comparison of supported interface definitions.

**Impacts:** Typed relationship graph, path traversal, and graph provenance.

**Scenarios:** Question interpretation, candidate-path selection, before/after scenario comparison, and structured AI explanations.

**Verification:** Test discovery, evidence-based coverage classification, and test recommendations.

**Evidence:** Source references, line ranges, snapshot validation, and claim validation.

**History:** Versioned analysis records and comparison.

**Integrations:** Optional future GitHub integration behind a clean adapter interface.

Avoid circular imports, giant all-purpose classes, business logic inside API views, and duplicate analysis logic between the frontend and backend.

## 10. Code-analysis engine

Implement an independently testable, multi-stage pipeline.

### Stage 1: Ingest and validate

Accept two source snapshots. Validate archive contents and normalize paths.

Preserve a stable reference to the exact base and head contents. Record ignored, binary, missing, oversized, and unsupported files.

### Stage 2: Diff generation

Compare the two versions by path and content.

Identify added, deleted, modified, and renamed files where possible. Generate normalized diffs while preserving source locations.

Treat renamed-file detection as a best-effort operation and mark ambiguous cases explicitly.

### Stage 3: Python parsing

Use Python's AST to parse supported source files.

Extract modules, imports, classes, functions, methods, function signatures, selected conditionals, call expressions, and useful source ranges.

Retain parser status and source location for every extracted element.

Do not use regex alone to represent Python program structure.

### Stage 4: Framework adapters

Implement a focused Django/DRF analysis adapter capable of identifying supported URL routes, view handlers, serializer declarations, model fields, and related framework constructs.

Implement supported constructs incrementally and test each one against fixtures.

Never imply full framework understanding. When a construct cannot be resolved statically, create an explicit unknown.

### Stage 5: Symbol mapping

Map modified lines to changed symbols. Compare base and head symbol representations.

Handle missing files, deleted symbols, moved functions, renamed declarations, and ambiguous mappings.

Avoid relying on source line numbers alone to establish symbol identity.

### Stage 6: Typed dependency graph

Build a graph from validated static facts.

Represent nodes and edges explicitly with identifiers, types, source locations, relationship provenance, and certainty classifications.

Keep base and head graph information separate so that a path comparison does not accidentally mix versions.

### Stage 7: Behavior-delta extraction

Use deterministic rules to detect structural and behavioral indicators such as changed signatures, conditions, defaults, field declarations, validation behavior, and supported route definitions.

Prepare normalized before/after representations from actual source evidence.

Generate a preliminary claim record for each detected change. Unsupported semantic claims must remain unresolved.

### Stage 8: Impact-path analysis

Trace supported relationships from changed symbols.

Use bounded breadth-first or depth-limited traversal. Deduplicate results, detect cycles, and retain meaningful alternative paths.

For each path, record the edges and evidence that justify the connection.

### Stage 9: Scenario planning

Translate a user question into a typed scenario request containing:

- The relevant input condition or state.
- The target behavior or observable output.
- Relevant changed symbols.
- Candidate base-version paths.
- Candidate head-version paths.
- Required evidence.
- Unresolved assumptions.

Resolve the request against the indexed snapshots and graph before invoking the language model.

If the system cannot map a scenario to a supported path, it must say so rather than construct an invented trace.

### Stage 10: Evidence-limited AI synthesis

Send the LLM only the minimum necessary context: the scenario request, relevant before/after excerpts, graph paths, contract differences, and evidence identifiers.

Use a structured response schema, with separate sections for facts, inference, uncertainty, and suggested tests.

Validate every returned source reference against the stored snapshot and known evidence. Reject fabricated paths and unsupported references.

### Stage 11: Claim verification

Apply deterministic claim rules:

- A claim describing a structural difference must point to the relevant before/after evidence.
- A claim describing a dependency must reference a stored graph edge.
- A test recommendation must identify the change and scenario motivating it.
- A runtime assertion must have actual runtime evidence.
- A conclusion lacking sufficient evidence must be downgraded or marked unresolved.

### Stage 12: Persist and render

Persist the analysis and its supporting evidence. Return a complete or partial result with stage-level status.

The frontend must render the actual backend response, not a separately hardcoded demonstration of the analysis.

## 11. Data model

Use PostgreSQL with explicit foreign keys, sensible indexes, UUID identifiers where appropriate, and database constraints.

Create the following conceptual entities:

### Workspace
Owner, name, description, creation time, access settings, and retention configuration.

### SourceSnapshot
Workspace, snapshot label, source hash, creation time, ingestion status, and metadata describing included files.

### SourceFile
Snapshot, relative path, content hash, language, file classification, parse status, and source-storage reference.

Avoid storing unnecessary duplicate source content in multiple records.

### AnalysisRun
Workspace, base snapshot, head snapshot, status, configuration version, analysis-engine version, AI-provider metadata, stage status, error information, and timestamps.

### Symbol
Snapshot, source file, symbol type, qualified name where available, source range, stable fingerprint, and parser metadata.

### RelationshipEdge
Snapshot, source node, target node, edge type, provenance, certainty category, and supporting evidence identifiers.

### BehaviorDelta
Analysis, change category, old representation, new representation, summary, status, impacted symbols, and evidence references.

### ContractDelta
Analysis, contract category, before representation, after representation, compatibility assessment, evidence, and unresolved assumptions.

### ScenarioQuery
Analysis, question, normalized scenario, selected symbols, interpretation assumptions, and status.

### ScenarioTrace
Scenario, snapshot side, ordered trace steps, relationship references, evidence references, and resolution status.

### VerificationCase
Analysis, related behavior delta, scenario, preconditions, input, expected result, rationale, existing-test references, and execution status.

### EvidenceRecord
Snapshot, file path, line range, content hash, evidence type, originating analysis stage, and metadata.

### AnalysisFeedback
Analysis, affected finding or claim, feedback category, optional explanation, and timestamp.

Every stored analysis should identify exactly which snapshots and engine configuration produced it.

Implement retention and deletion behavior that covers source files, cached analysis material, and associated evidence.

## 12. REST API

Create a documented, versioned API under `/api/v1/`.

Implement request validation, response serializers, stable identifiers, consistent errors, access checks, pagination, and appropriate HTTP status codes.

### Demo and workspace

- `GET /api/v1/demo/`
- `GET /api/v1/demo/changes/`
- `POST /api/v1/workspaces/`
- `GET /api/v1/workspaces/`
- `GET /api/v1/workspaces/{workspace_id}/`

### Snapshot ingestion

- `POST /api/v1/workspaces/{workspace_id}/snapshots/`
- `GET /api/v1/snapshots/{snapshot_id}/`
- `DELETE /api/v1/snapshots/{snapshot_id}/`

### Analysis lifecycle

- `POST /api/v1/analyses/`
- `GET /api/v1/analyses/{analysis_id}/`
- `POST /api/v1/analyses/{analysis_id}/cancel/`
- `DELETE /api/v1/analyses/{analysis_id}/`

### Change Story

- `GET /api/v1/analyses/{analysis_id}/deltas/`
- `GET /api/v1/analyses/{analysis_id}/contracts/`
- `GET /api/v1/analyses/{analysis_id}/impact-graph/`
- `GET /api/v1/analyses/{analysis_id}/verification/`
- `GET /api/v1/analyses/{analysis_id}/evidence/`
- `GET /api/v1/analyses/{analysis_id}/unknowns/`

### Scenario Studio

- `POST /api/v1/analyses/{analysis_id}/scenarios/`
- `GET /api/v1/scenarios/{scenario_id}/`
- `GET /api/v1/scenarios/{scenario_id}/trace/`
- `GET /api/v1/scenarios/{scenario_id}/evidence/`

### History and feedback

- `GET /api/v1/workspaces/{workspace_id}/history/`
- `POST /api/v1/analyses/{analysis_id}/feedback/`

The endpoint names may be adjusted during implementation, but all implemented endpoints must be documented and tested.

Generate an OpenAPI schema and ensure the frontend's types match the backend contract.

Do not invent API responses solely to make a frontend component work.

## 13. Frontend and design system

Create a professional developer tool with a distinctive visual identity.

### Visual direction

- Deep navy or charcoal foundation.
- Restrained cyan/teal and violet accents.
- Strong typography and clear hierarchy.
- Compact, readable technical information.
- Accessible color contrast and keyboard navigation.
- A beacon-inspired icon connecting one changed node to downstream nodes.
- Subtle animation only when it helps explain a transition or graph relationship.

Avoid generic AI landing-page templates, oversized decorative gradients, excessive glow, cluttered cards, and decorative graphs with no actual analytical data.

### Required routes

**Landing page**

Explain the product using a real fixture-driven Change Story. Show how the evidence explorer works. Include a clear action to start the demo.

**Dashboard**

Display recent analyses, example changes, workspace status, and the option to upload source snapshots.

**Demo workspace**

Provide a preconfigured sample project and several deliberately changed scenarios. It must be usable without authentication, GitHub credentials, or a model API key.

**Snapshot upload**

Explain the base/head requirement, allowed formats, size restrictions, privacy implications, and supported language limitations.

**Analysis workspace**

Include the Change Story sections:

- Behavior Delta Ledger.
- Contract Surface Map.
- Impact Explorer.
- Change Scenario Studio.
- Verification Matrix.
- Unknowns Register.

**Scenario Studio**

Provide the question input, scenario interpretation, before/after paths, difference explanation, source evidence, verification suggestions, and unresolved assumptions.

**Evidence inspector**

Display the relevant source excerpt and exact line range, together with the claim or edge that references it. Use a proper source viewer with base/head selection.

**History view**

Compare prior immutable analyses and highlight changes in claims and impact paths.

### Frontend state rules

Provide real loading, empty, partial, failed, unsupported, and complete states.

Show the actual analysis status and actionable errors. Support cancellation and safe retry where implemented.

Never display an invented positive finding if the analysis fails.

Keep the graph synchronized with the actual analysis response. Clicking a relationship must reveal its real evidence.

All visible buttons and forms must perform their promised actions.

## 14. AI provider and evaluation layer

Create a provider-neutral interface with typed inputs and outputs.

Use environment-based configuration, for example:

- `LLM_PROVIDER`
- `LLM_MODEL`
- `LLM_API_KEY`
- `LLM_BASE_URL`, when applicable.
- `LLM_TIMEOUT_SECONDS`

Do not require a real API key for installation or demo mode.

Provide a deterministic demonstration path that shows predefined, fixture-derived scenario traces and clearly labels them as sample analysis results.

For actual uploaded projects, if no AI provider is configured, return the deterministic analysis results and explain that AI scenario synthesis is unavailable. Do not silently substitute fictional AI answers.

Do not include credentials in the frontend, source control, container images, or logs.

Create an evaluation dataset from the fictional sample project. Include known changed behaviors, expected source references, valid dependency paths, deliberately unresolved relationships, and scenario questions.

Measure:

- Correctness of before/after claims.
- Evidence-reference validity.
- Source-line accuracy.
- Dependency-edge precision on the fixture.
- Scenario interpretation quality.
- Appropriate abstention when evidence is insufficient.
- Relevance of verification suggestions.
- Stability across repeated analyses.

A beautiful narrative is not successful if its evidence is wrong.

## 15. Security and privacy

Treat uploaded source code as confidential, untrusted input.

Implement:

- ZIP path traversal protection.
- Archive size and entry-count limits.
- File size limits and safe handling of binary content.
- Request validation and timeouts.
- Explicit workspace access control.
- Safe temporary storage and retention.
- Deletion of project and analysis data.
- Secret and credential redaction in logs.
- Backend-only model API calls.
- Minimal source excerpts in external AI requests.
- Clear documentation of whether source snippets leave the server.
- No training on uploaded code as part of the product.
- No automatic execution of analyzed source code.
- No automatic commits, file modifications, PR approvals, or external side effects.

Treat source comments, README files, tests, and uploaded documentation as potentially malicious content. They must not be allowed to override system instructions or cause unauthorized tool use.

Do not execute repository scripts, package installation hooks, migrations, tests, or setup commands as part of ordinary analysis.

A future sandboxed test-execution feature would require its own threat model, isolated execution environment, resource limits, and explicit authorization. It is out of scope for the first MVP.

If authentication is introduced, protect every workspace, snapshot, analysis, and evidence endpoint server-side. Demo access must not expose uploaded private projects.

## 16. Testing requirements

Write tests while implementing the system, not as a final afterthought.

### Parser and graph tests

Verify symbol extraction, changed-line mapping, import relationships, direct calls, supported framework detection, graph traversal, cycle handling, provenance, and version separation.

### Scenario tests

Verify that scenario questions are normalized correctly, only relevant evidence is passed to the AI, source references are validated, unsupported questions can remain unresolved, and fabricated references are rejected.

### Backend integration tests

Test ingestion, analysis lifecycle, database constraints, snapshot association, error handling, cleanup, and API response schemas.

### Frontend tests

Test upload validation, graph interaction, evidence navigation, scenario submission, partial results, empty states, and failed AI-provider behavior.

### Security tests

Test malicious archive paths, oversized archives, unauthorized workspace access, secret redaction, malicious repository instructions, and unauthorized deletion attempts.

### Fixture cases

Create tests for at least:

1. A changed serializer field.
2. An altered validation condition.
3. A modified Django model field and associated migration.
4. A changed function with known callers and tests.
5. A deleted symbol with a remaining reference.
6. A dynamic relationship that static analysis cannot resolve.
7. A missing source file.
8. An ambiguous base/head mapping.
9. A scenario whose answer is fully supported by source evidence.
10. A scenario that requires runtime evidence and must therefore remain unresolved.

Tests must validate real implementation behavior, not merely assert that fixture data appears on a screen.

## 17. Implementation sequence

### Phase 0: Research and product design

Investigate current competitors. Create the competitive analysis, product boundary, architecture diagram, entity-relationship diagram, analysis sequence diagram, API contract, and acceptance checklist.

Propose the specific DiffBeacon workflow and document where it overlaps with existing products.

### Phase 1: Generate the application from scratch

Create the monorepo, frontend, backend, database setup, environment configuration, Docker Compose, migrations, tests, and documentation.

Generate the fictional BeaconWorks API fixture with base/head snapshots and automated tests.

Implement the first dashboard and demo flow.

At the end of this phase, the application must start and display a real fixture-backed sample experience.

### Phase 2: Static analysis foundation

Implement snapshot comparison, Python AST parsing, symbol mapping, and typed relationships.

Generate the preliminary graph from the sample source. Test source locations and graph edges.

### Phase 3: Change Story

Implement Behavior Delta Ledger, Contract Surface Map, Impact Explorer, evidence storage, and Unknowns Register.

Validate every displayed claim against the actual analysis result.

### Phase 4: Change Scenario Studio

Implement scenario interpretation, evidence selection, separate base/head trace records, structured LLM synthesis, reference validation, and verification suggestions.

Keep a deterministic fixture-backed demonstration when no model provider is configured.

### Phase 5: Source upload

Implement secure base/head ZIP upload, validation, source storage, cleanup, analysis creation, and actual UI integration.

Ensure the app analyzes uploaded files rather than accidentally returning fixture-based results.

### Phase 6: Verification and history

Implement test discovery, the verification matrix, versioned analysis history, comparison, and feedback.

### Phase 7: Hardening and deployment

Finish security tests, error handling, provider timeouts, health checks, CI, frontend production build, and reproducible deployment instructions.

Run all tests and document all unsupported constructs and incomplete integrations.

Do not skip phases just to create the appearance of a more complete product.

## 18. Required project documentation

Create:

- `README.md`
- `docs/architecture.md`
- `docs/competitive-analysis.md`
- `docs/data-model.md`
- `docs/api-contract.md`
- `docs/analysis-pipeline.md`
- `docs/ai-design.md`
- `docs/security-and-privacy.md`
- `docs/supported-language-features.md`
- `docs/testing.md`
- `docs/deployment.md`

Include architecture and sequence diagrams, data relationships, API examples, environment variables, setup commands, known limitations, and a clear description of deterministic analysis versus AI-generated explanation.

Document what the system supports today, what is experimental, and what remains planned.

## 19. Definition of done

The MVP is complete only when:

1. It builds and runs from a clean environment using the documented instructions.
2. It requires no user-provided repository, GitHub account, or paid AI key for the demo.
3. The fictional sample code and base/head snapshots are created and versioned in the project.
4. The demo generates an actual analysis from those fixtures.
5. Real uploaded snapshots pass through the actual ingestion and analysis pipeline.
6. Supported changes map to source symbols and meaningful before/after comparisons.
7. The impact graph is based on stored, typed analysis relationships.
8. Scenario explanations reference real evidence and expose uncertainty.
9. Unsupported cases remain unresolved rather than being answered by invention.
10. Suggested tests are distinguished from existing tests and executed tests.
11. The frontend consumes the real backend API.
12. The application's security boundaries and data-retention behavior are documented and tested.
13. Backend tests and frontend tests pass, and the production frontend build succeeds.
14. The README provides complete local setup, demo, testing, and deployment steps.

Do not claim any check passed unless it was actually run and its result observed.

## 20. Final instructions

Start in the current working directory. If it is empty, create the project. If files already exist, inspect them before changing anything.

Do not ask me to provide a repository. Generate the sample project and test data yourself.

Do not begin by generating only the entire frontend. Build the real analysis foundations and connect the UI to them.

Do not use mock data on production paths. Use mock data only for explicitly labeled demo fixtures and automated tests.

Do not claim that DiffBeacon is completely unique. Research the market, document overlaps, and focus on the Change Scenario Studio as a hypothesis that must be validated.

After each phase, run relevant tests and maintain an implementation checklist with these states: complete and tested, implemented but not fully tested, partially implemented, and not implemented.

**Begin with Phase 0, then immediately build Phase 1. Continue implementing the application in the available environment rather than stopping after planning.**
<ADDITIONAL_METADATA>
The current local time is: 2026-10-22T01:16:28+05:30.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.8 Flash (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>