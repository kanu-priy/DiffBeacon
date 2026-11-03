import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  FileCode2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Loader2,
  FileCheck,
  Search,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { SnapshotUploadModal } from './SnapshotUploadModal';
import { useToast } from '../../components/Toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadModalMode, setUploadModalMode] = useState<'zip' | 'github'>('zip');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const {
    data: workspaces,
    isLoading: isWorkspacesLoading,
    refetch: refetchWorkspaces,
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: api.getWorkspaces,
  });

  useEffect(() => {
    if (!workspaces || workspaces.length === 0) {
      setSelectedWorkspaceId('');
      return;
    }

    if (!selectedWorkspaceId || !workspaces.some((workspace) => workspace.id === selectedWorkspaceId)) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const activeWorkspace =
    workspaces?.find((w) => w.id === selectedWorkspaceId) || workspaces?.[0];

  const {
    data: history,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['workspace-history', activeWorkspace?.id],
    queryFn: () => (activeWorkspace ? api.getWorkspaceHistory(activeWorkspace.id) : []),
    enabled: !!activeWorkspace,
    refetchInterval: (query) =>
      query.state.data?.some((run: any) => run.status === 'running' || run.status === 'queued') ? 2000 : false,
  });

  const {
    data: githubStatus,
    isLoading: isGithubStatusLoading,
    refetch: refetchGitHubStatus,
  } = useQuery({
    queryKey: ['github-connection'],
    queryFn: api.getGitHubConnectionStatus,
  });

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    setIsCreatingWorkspace(true);
    try {
      const ws = await api.createWorkspace({ name: newWorkspaceName.trim(), description: 'Production workspace' });
      setNewWorkspaceName('');
      await refetchWorkspaces();
      setSelectedWorkspaceId(ws.id);
      toast.success('Workspace created', ws.name);
    } catch (err: any) {
      toast.error('Could not create workspace', err.message);
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleGitHubConnect = async () => {
    try {
      const result = await api.connectGitHub();
      if (!result.install_url) {
        toast.error('GitHub App not configured', 'Set GITHUB_APP_SLUG and the private key before connecting.');
        return;
      }

      window.open(result.install_url, '_blank', 'noopener,noreferrer');
      toast.success('GitHub setup opened', 'Complete the app install in the GitHub tab, then return to DiffBeacon.');
    } catch (err: any) {
      toast.error('GitHub connection failed', err.message);
    }
  };

  const handleGitHubDisconnect = async () => {
    try {
      const result = await api.disconnectGitHub();
      await refetchGitHubStatus();
      toast.success('GitHub disconnected', result.message);
    } catch (err: any) {
      toast.error('Disconnect failed', err.message);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    if (!searchQuery) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (run: any) =>
        run.base_snapshot_label?.toLowerCase().includes(q) ||
        run.head_snapshot_label?.toLowerCase().includes(q) ||
        run.status?.toLowerCase().includes(q) ||
        run.id?.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  // Aggregate stats
  const totalDeltas = history?.reduce((acc: number, h: any) => acc + (h.counts?.deltas || 0), 0) || 0;
  const totalContracts = history?.reduce((acc: number, h: any) => acc + (h.counts?.contracts || 0), 0) || 0;

  return (
    <div className="db-page">
      {/* Top Header */}
      <div className="db-heading">
        <div>
          <div className="flex items-center gap-2">
            <span className="db-eyebrow">
              DIFFBEACON / WORKSPACE
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400 font-mono">AST Snapshots</span>
          </div>
          <h1 className="db-title">
            <span>Understand what<br className="hidden sm:block"/> your changes touch.</span>
          </h1>
          <p className="db-subtitle">
            Trace every code change from source to impact. Evidence first, assumptions clearly marked.
          </p>
        </div>

        <div className="db-actions">
          <button
            onClick={() => {
              if (!activeWorkspace) {
                toast.error('Create a workspace first', 'You need a workspace before running a snapshot analysis.');
                return;
              }

              setSelectedWorkspaceId(activeWorkspace.id);
              setUploadModalMode('zip');
              setIsUploadModalOpen(true);
            }}
            disabled={!activeWorkspace}
            className="db-button db-button-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Snapshot Analysis</span>
          </button>

          <button
            onClick={() => {
              if (!activeWorkspace) {
                toast.error('Create a workspace first', 'You need a workspace before connecting GitHub.');
                return;
              }

              setSelectedWorkspaceId(activeWorkspace.id);
              setUploadModalMode('github');
              setIsUploadModalOpen(true);
            }}
            disabled={!activeWorkspace}
            className="db-button db-button-secondary"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Connect GitHub</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="db-stats">
        <div><span>Workspaces</span><strong>{workspaces?.length ?? 0}</strong></div>
        <div><span>Analyses</span><strong>{history?.length || 0}</strong></div>
        <div><span>Behavior changes</span><strong>{totalDeltas}</strong></div>
        <div><span>Contract surfaces</span><strong>{totalContracts}</strong></div>
      </div>

      <div className="rounded-2xl border border-[#1d2b22] bg-[#0b120e]/90 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/40 p-2 text-emerald-300">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">GitHub Integration</div>
              <h3 className="mt-1 text-base font-semibold text-white">
                {githubStatus?.connected ? `${githubStatus.account_login || 'GitHub'} connected` : githubStatus?.requires_setup ? 'GitHub App setup required' : 'Connect a GitHub app'}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isGithubStatusLoading && githubStatus?.connected ? (
              <>
                <button onClick={handleGitHubDisconnect} className="db-button db-button-secondary">
                  Disconnect
                </button>
                <button onClick={handleGitHubConnect} className="db-button db-button-primary">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>Manage repos</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleGitHubConnect}
                className="db-button db-button-primary"
                disabled={isGithubStatusLoading}
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>{isGithubStatusLoading ? 'Loading…' : githubStatus?.requires_setup ? 'Set up GitHub' : 'Connect GitHub'}</span>
              </button>
            )}
          </div>
        </div>

        {githubStatus?.connected ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Repository access is active and the app can discover relevant pull requests.</span>
            </div>
            {githubStatus.selected_repositories?.length ? (
              <div className="flex flex-wrap gap-2">
                {githubStatus.selected_repositories.map((repo: any) => (
                  <span
                    key={repo.id || repo.full_name}
                    className="rounded-full border border-[#1d2b22] bg-[#0d1714] px-2.5 py-1 text-[11px] text-slate-200"
                  >
                    {repo.full_name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#21372e] bg-[#0d1412] px-3 py-2 text-xs text-slate-400">
                No repositories selected yet. Connect the app and choose repositories to analyze.
              </div>
            )}
          </div>
        ) : githubStatus?.requires_setup ? (
          <div className="mt-4 rounded-xl border border-[#2a302a] bg-[#0d1412] p-3 text-xs text-slate-300 space-y-2">
            <p className="text-slate-200">
              DiffBeacon is ready for a GitHub App, but the server still needs the app credentials configured.
            </p>
            <ol className="list-decimal pl-5 text-slate-400 space-y-1">
              <li>Create a GitHub App in your GitHub account.</li>
              <li>Set <span className="font-mono text-emerald-300">GITHUB_APP_ID</span>, <span className="font-mono text-emerald-300">GITHUB_APP_SLUG</span>, and <span className="font-mono text-emerald-300">GITHUB_APP_PRIVATE_KEY</span>.</li>
              <li>Install it on the target org or user, then return here to connect.</li>
            </ol>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-[#21372e] bg-[#0d1412] px-3 py-3 text-xs text-slate-400">
            DiffBeacon needs GitHub access to discover installed repos and analyze relevant pull requests automatically.
            Connect the app once, then select repositories for PR monitoring.
          </div>
        )}
      </div>

      {/* Workspace Switcher & Creator */}
      <div className="db-workspace-bar">
        <div className="db-workspaces">
          <span className="db-section-label">Repository</span>
          {workspaces?.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWorkspaceId(w.id)}
              className={`db-workspace ${
                activeWorkspace?.id === w.id
                  ? 'is-active'
                  : ''
              }`}
            >
              <span>{w.name}</span>
              {typeof w.analysis_count === 'number' && (
                <span className="text-[10px] text-slate-500 font-mono">({w.analysis_count})</span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleCreateWorkspace} className="db-create-form">
          <input
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="New workspace name..."
            className="db-input"
          />
          <button
            type="submit"
            disabled={isCreatingWorkspace || !newWorkspaceName.trim()}
            className="db-button db-button-secondary"
          >
            {isCreatingWorkspace ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>

      {/* Analyses Table with Search */}
      <div className="db-list">
        <div className="db-list-header">
          <div className="flex items-center gap-2">
            <h2>Recent analyses</h2>
            <span className="db-count">
              {filteredHistory.length}
            </span>
          </div>

          {/* Search in History */}
          <div className="db-search">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by branch, status, or ID..."
              className="db-input"
            />
          </div>
        </div>

        {isHistoryLoading ? (
          <div className="db-empty">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading analysis snapshots…</span>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="db-rows">
            {filteredHistory.map((run: any) => (
              <div
                key={run.id}
                onClick={() => navigate(`/analysis/${run.id}`)}
                className="db-row"
              >
                <div className="space-y-1.5">
                  <div className="db-run-title">
                    <span>
                      {run.base_snapshot_label} <span className="db-arrow">→</span> {run.head_snapshot_label}
                    </span>
                    <span
                      className={`db-status ${
                        run.status === 'completed'
                          ? 'complete'
                          : run.status === 'running'
                          ? 'running'
                          : 'failed'
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                  <div className="db-metadata">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(run.created_at).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>Engine v{run.engine_version}</span>
                    <span>•</span>
                      <span>ID {run.id.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="db-metrics">
                  <div><span>Deltas</span><strong>
                      {run.counts?.deltas ?? 0}
                    </strong>
                  </div>
                  <div><span>Contracts</span><strong>
                      {run.counts?.contracts ?? 0}
                    </strong>
                  </div>
                  <div><span>Unknowns</span><strong>
                      {run.counts?.unknowns ?? 0}
                    </strong>
                  </div>

                  <ArrowRight className="db-row-arrow" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="db-empty">
            <FileCode2 className="w-8 h-8" />
            <div>
              <h3>No matching analyses</h3>
              <p>
                {searchQuery ? `No analysis found matching "${searchQuery}".` : 'Upload base and head source ZIP archives to run your first behavioral impact analysis.'}
              </p>
            </div>
            <button
              onClick={() => {
                if (!activeWorkspace) {
                  toast.error('Create a workspace first', 'You need a workspace before running a snapshot analysis.');
                  return;
                }

                setSelectedWorkspaceId(activeWorkspace.id);
                setIsUploadModalOpen(true);
              }}
              className="db-button db-button-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Snapshots</span>
            </button>
          </div>
        )}
      </div>

      {activeWorkspace && (
        <SnapshotUploadModal
          workspaceId={activeWorkspace.id}
          isOpen={isUploadModalOpen}
          initialMode={uploadModalMode}
          onClose={() => setIsUploadModalOpen(false)}
          onAnalysisCreated={(newId) => {
            refetchHistory();
            navigate(`/analysis/${newId}`);
          }}
        />
      )}
    </div>
  );
};
