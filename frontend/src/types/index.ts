export type EpistemicProvenance =
  | 'statically_established'
  | 'framework_rule'
  | 'inferred'
  | 'unresolved'
  | 'runtime_verified';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_demo: boolean;
  retention_days: number;
  created_at: string;
  updated_at: string;
  analysis_count?: number;
  snapshot_count?: number;
}

export interface AnalysisRun {
  id: string;
  workspace: string;
  base_snapshot: string;
  head_snapshot: string;
  base_snapshot_label: string;
  head_snapshot_label: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_stage: string;
  stages_completed: string[];
  engine_version: string;
  ai_provider_name: string;
  error_details: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  counts: {
    deltas: number;
    contracts: number;
    verification_cases: number;
    unknowns: number;
    scenarios: number;
  };
}

export interface BehaviorDelta {
  id: string;
  category:
    | 'api_contract'
    | 'validation'
    | 'signature'
    | 'permission'
    | 'data_model'
    | 'error_handling'
    | 'logic'
    | 'deleted_symbol';
  title: string;
  summary: string;
  before_behavior: string;
  after_behavior: string;
  affected_symbol: string;
  file_path: string;
  base_line_range: [number, number];
  head_line_range: [number, number];
  confidence: EpistemicProvenance;
  evidence_refs: string[];
}

export interface ContractDelta {
  id: string;
  contract_type: 'drf_serializer' | 'api_route' | 'django_model' | 'service_signature';
  identifier: string;
  change_nature: 'added' | 'removed' | 'modified_optional' | 'modified_required' | 'type_change';
  before_spec: Record<string, any>;
  after_spec: Record<string, any>;
  is_breaking: boolean;
  compatibility_assessment: string;
  unresolved_assumptions: string[];
}

export interface TraceStep {
  id?: string;
  snapshot_side: 'base' | 'head';
  step_index: number;
  symbol_qname: string;
  file_path: string;
  line_number?: number;
  explanation: string;
  provenance: EpistemicProvenance;
}

export interface VerificationPlan {
  preconditions: string;
  input_data: string;
  expected_result: string;
  rationale: string;
  existing_test_ref?: string;
  coverage_classification: 'existing_covered' | 'possibly_covered' | 'suggested_uncovered';
  execution_status: 'not_executed' | 'passed' | 'failed';
}

export interface ScenarioQuery {
  id: string;
  analysis: string;
  question: string;
  target_symbol?: string;
  normalized_condition: string;
  target_behavior: string;
  interpretation_assumptions: string[];
  behavioral_delta_summary: string;
  impact_summary: string;
  verification_plan: VerificationPlan;
  uncertainty_report: string[];
  status: 'completed' | 'unresolved' | 'failed';
  created_at: string;
  traces: {
    base: TraceStep[];
    head: TraceStep[];
  };
}

export interface VerificationCase {
  id: string;
  title: string;
  delta?: string;
  preconditions: string;
  input_data: string;
  expected_result: string;
  rationale: string;
  existing_test_ref?: string;
  coverage_classification: 'existing_covered' | 'possibly_covered' | 'suggested_uncovered';
  execution_status: 'not_executed' | 'passed' | 'failed';
}

export interface UnknownEntry {
  id: string;
  title: string;
  reason:
    | 'dynamic_dispatch'
    | 'unresolved_import'
    | 'reflection'
    | 'missing_runtime_config'
    | 'runtime_db_state';
  file_path: string;
  line_number?: number;
  code_snippet: string;
  explanation: string;
  resolution_strategy: string;
}

export interface EvidenceRecord {
  id: string;
  snapshot_side: 'base' | 'head';
  file_path: string;
  start_line: number;
  end_line: number;
  content_excerpt: string;
  content_hash: string;
  originating_stage: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  file_path: string;
  line_number: number;
  is_changed: boolean;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  provenance: string;
  certainty?: string;
  file_path?: string;
  line_number?: number;
}

export interface ImpactGraphData {
  snapshot_side: string;
  snapshot_label: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DemoStats {
  deltas: number;
  contracts: number;
  unknowns: number;
  scenarios: number;
  verification_cases: number;
}

export interface DemoStatus {
  demo_available: boolean;
  is_seeded: boolean;
  workspace_id?: string;
  analysis_id?: string;
  project_name: string;
  base_version: string;
  head_version: string;
  sample_scenarios: Array<{
    id: string;
    question: string;
    target_symbol: string;
  }>;
  stats?: DemoStats;
  engine_version?: string;
  last_completed_at?: string;
}

export interface ShowcaseStory {
  id: string;
  title: string;
  symbol: string;
  file: string;
  category: string;
  status: 'Breaking' | 'Compatible' | string;
  question: string;
  baseBehavior: string;
  headBehavior: string;
  summary: string;
  confidence: string;
  nature: string;
}

export interface DemoShowcase {
  is_seeded: boolean;
  analysis_id?: string | null;
  workspace_id?: string | null;
  project_name: string;
  base_version: string;
  head_version: string;
  stories: ShowcaseStory[];
  sample_scenarios: Array<{
    id: string;
    question: string;
    target_symbol: string;
  }>;
  stats: DemoStats;
}

export interface SnapshotFileEntry {
  path: string;
  language: string;
  classification: string;
  line_count: number;
  change: 'modified' | 'unchanged' | 'added' | 'removed' | string;
  parse_status: string;
}

export interface SnapshotFileList {
  base_label: string;
  head_label: string;
  files: SnapshotFileEntry[];
}
