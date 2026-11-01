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
const AUTH_TOKEN_KEY = 'diffbeacon-auth-token';
const AUTH_USER_KEY = 'diffbeacon-auth-user';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: AuthUser;
}

function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function formatErrorMessage(data: unknown, fallback: string): string {
  if (data == null) return fallback;

  if (typeof data === 'string') return data;

  if (Array.isArray(data)) {
    const flattened = data
      .flatMap((item) => {
        if (typeof item === 'string') return [item];
        if (item && typeof item === 'object') return [formatErrorMessage(item, fallback)];
        return [];
      })
      .filter(Boolean);

    return flattened.length > 0 ? flattened.join(' ') : fallback;
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    const messages = entries.flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((item) => (typeof item === 'string' ? item : formatErrorMessage(item, key)))
          .filter(Boolean);
      }

      if (value && typeof value === 'object') {
        const nested = formatErrorMessage(value, key);
        return nested ? [nested] : [];
      }

      return value != null ? [String(value)] : [];
    });

    return messages.length > 0 ? messages.join(' ') : fallback;
  }

  return String(data);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    const message = formatErrorMessage(data, res.statusText || 'Request failed');
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  registerUser: (payload: { username: string; email: string; password: string; password_confirm: string }) =>
    request<AuthTokens>('/auth/register/', { method: 'POST', body: JSON.stringify(payload) }),
  loginUser: (payload: { username: string; password: string }) =>
    request<AuthTokens>('/auth/login/', { method: 'POST', body: JSON.stringify(payload) }),
  getCurrentUser: () => request<AuthUser>('/auth/me/'),
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

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

  getLanguages: () =>
    request<{
      total_supported: number;
      tier_1_count: number;
      tier_2_count: number;
      languages: Array<{
        key: string;
        name: string;
        tier: number;
        extensions: string[];
        capabilities: string[];
        parser_engine: string;
        description: string;
        supported_frameworks: string[];
        known_limitations: string[];
        is_tier_1: boolean;
      }>;
    }>('/languages/'),

  getProviderSettings: () =>
    request<{
      active_provider: string;
      fallback_mode: string;
      secret_redaction_enabled: boolean;
      telemetry_enabled: boolean;
      max_evidence_window_tokens: number;
      providers: Array<{
        id: string;
        name: string;
        status: string;
        requires_key: boolean;
        is_local: boolean;
        description: string;
      }>;
    }>('/settings/providers/'),

  testProvider: (provider: string) =>
    request<{
      provider: string;
      status: string;
      latency_ms: number;
      message: string;
      secret_redaction_applied: boolean;
    }>('/settings/providers/test/', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }),

  analyzeGitHubPR: (payload: { workspace_id?: string; pr_reference: string; token?: string }) =>
    request<AnalysisRun>('/integrations/github/analyze-pr/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSystemHealth: () =>
    request<{
      status: string;
      version: string;
      checks: {
        database: string;
        storage: string;
        ai_provider: { name: string; deterministic_fallback_ready: boolean };
      };
    }>('/health/'),
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
