import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Compass,
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
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
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

  const { data: demoStatus, refetch: refetchDemo } = useQuery({
    queryKey: ['demo-status'],
    queryFn: api.getDemoStatus,
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

  const handleLaunchDemo = async () => {
    setIsSeedingDemo(true);
    try {
      if (demoStatus?.is_seeded && demoStatus.analysis_id) {
        toast.info('Opening BeaconWorks Demo Workspace', 'Loading seeded Change Story...');
        navigate(`/analysis/${demoStatus.analysis_id}`);
      } else {
        toast.info('Seeding BeaconWorks API v1.0 & v1.1', 'Extracting fixtures and building AST graph...');
        const res = await api.seedDemoWorkspace();
        refetchDemo();
        refetchWorkspaces();
        toast.success('Demo Workspace Ready', 'Loaded BeaconWorks API analysis snapshot.');
        navigate(`/analysis/${res.analysis_id}`);
      }
    } catch (err: any) {
      toast.error('Failed to launch demo', err.message);
    } finally {
      setIsSeedingDemo(false);
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
            onClick={handleLaunchDemo}
            disabled={isSeedingDemo}
            className="db-button db-button-secondary"
          >
            {isSeedingDemo ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : (
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{isSeedingDemo ? 'Seeding Demo...' : 'Open BeaconWorks Demo'}</span>
          </button>

          <button
            onClick={() => {
              if (activeWorkspace) {
                setSelectedWorkspaceId(activeWorkspace.id);
                setIsUploadModalOpen(true);
              }
            }}
            disabled={!activeWorkspace}
            className="db-button db-button-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Snapshot Analysis</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="db-stats">
        <div><span>Workspaces</span><strong>{workspaces?.length || 1}</strong></div>
        <div><span>Analyses</span><strong>{history?.length || 0}</strong></div>
        <div><span>Behavior changes</span><strong>{totalDeltas}</strong></div>
        <div><span>Contract surfaces</span><strong>{totalContracts}</strong></div>
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
              {w.is_demo && (
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1 rounded border border-indigo-800/40">
                  Demo
                </span>
              )}
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
              onClick={() => setIsUploadModalOpen(true)}
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
