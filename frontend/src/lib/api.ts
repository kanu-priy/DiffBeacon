import {
  AnalysisRun,
  BehaviorDelta,
  ContractDelta,
  DemoShowcase,
  DemoStatus,
  EvidenceRecord,
  ImpactGraphData,
  ScenarioQuery,
  SnapshotFileList,
  UnknownEntry,
  VerificationCase,
  Workspace,
} from '../types';

const API_BASE = '/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const message = data?.error || data?.detail || res.statusText || 'Request failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return data as T;
}

export const api = {
  getDemoStatus: () => request<DemoStatus>('/demo/'),
  getDemoShowcase: () => request<DemoShowcase>('/demo/showcase/'),
  seedDemoWorkspace: () =>
    request<{ analysis_id: string; workspace_id: string; status: string; counts: Record<string, number> }>(
      '/demo/seed/',
      { method: 'POST' }
    ),

  getWorkspaces: () => request<Workspace[]>('/workspaces/'),
  createWorkspace: (payload: { name: string; description?: string }) =>
    request<Workspace>('/workspaces/', { method: 'POST', body: JSON.stringify(payload) }),
  getWorkspace: (id: string) => request<Workspace>(`/workspaces/${id}/`),
  getWorkspaceHistory: (id: string) => request<AnalysisRun[]>(`/workspaces/${id}/history/`),

  uploadSnapshot: (workspaceId: string, formData: FormData) =>
    request<{ id: string; label: string; file_count: number }>(`/workspaces/${workspaceId}/snapshots/`, {
      method: 'POST',
      body: formData,
    }),

  triggerAnalysis: (payload: { workspace: string; base_snapshot: string; head_snapshot: string }) =>
    request<AnalysisRun>('/analyses/', { method: 'POST', body: JSON.stringify(payload) }),

  getAnalysis: (id: string) => request<AnalysisRun>(`/analyses/${id}/`),
  getBehaviorDeltas: (id: string) => request<BehaviorDelta[]>(`/analyses/${id}/deltas/`),
  getContractDeltas: (id: string) => request<ContractDelta[]>(`/analyses/${id}/contracts/`),
  getImpactGraph: (id: string, side: 'base' | 'head' = 'head') =>
    request<ImpactGraphData>(`/analyses/${id}/impact-graph/?side=${side}`),
  getVerificationCases: (id: string) => request<VerificationCase[]>(`/analyses/${id}/verification/`),
  runVerificationCase: (analysisId: string, caseId: string) =>
    request<VerificationCase & { logs: string[] }>(`/analyses/${analysisId}/verification/${caseId}/run/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  getUnknowns: (id: string) => request<UnknownEntry[]>(`/analyses/${id}/unknowns/`),
  getEvidence: (id: string) => request<EvidenceRecord[]>(`/analyses/${id}/evidence/`),
  getFileContent: (id: string, side: 'base' | 'head', path: string) =>
    request<{ file_path: string; snapshot_side: string; snapshot_label: string; line_count: number; content: string }>(
      `/analyses/${id}/file-content/?side=${side}&path=${encodeURIComponent(path)}`
    ),
  getAnalysisFiles: (id: string) => request<SnapshotFileList>(`/analyses/${id}/files/`),
  getNavigator: (id: string) => request<NavigatorPayload>(`/analyses/${id}/navigator/`),

  getScenarios: (analysisId: string) => request<ScenarioQuery[]>(`/analyses/${analysisId}/scenarios/`),
  createScenario: (analysisId: string, question: string, targetSymbol?: string) =>
    request<ScenarioQuery>(`/analyses/${analysisId}/scenarios/`, {
      method: 'POST',
      body: JSON.stringify({ question, target_symbol: targetSymbol || '' }),
    }),

  submitFeedback: (
    analysisId: string,
    payload: { target_type: string; target_id: string; rating: string; comment?: string }
  ) => request(`/analyses/${analysisId}/feedback/`, { method: 'POST', body: JSON.stringify(payload) }),
};

export interface NavigatorPayload {
  analysis_id: string;
  status: string;
  base_snapshot_label: string;
  head_snapshot_label: string;
  counts: Record<string, number>;
  deltas: Array<{
    id: string;
    title: string;
    symbol: string;
    file_path: string;
    line: number;
    category: string;
    confidence: string;
  }>;
  scenarios: Array<{
    id: string;
    question: string;
    target_symbol: string;
    status: string;
  }>;
  symbols: Array<{
    id: string;
    label: string;
    type: string;
    file_path: string;
    line_number: number;
  }>;
}
