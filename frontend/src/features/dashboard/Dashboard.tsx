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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2638]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Engineering Workspaces
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400 font-mono">AST Snapshots</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Code-Change Workspaces</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-xl">
            Track deterministic AST snapshots, inspect behavioral deltas, compare DRF/OpenAPI contract surfaces, and execute isolated scenario verifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleLaunchDemo}
            disabled={isSeedingDemo}
            className="px-4 py-2 rounded-lg bg-[#121622] hover:bg-[#181e2e] border border-[#222a3d] text-indigo-300 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
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
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Snapshot Analysis</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1 border-[#1c2233]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Workspaces</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {workspaces?.length || 1}
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Configured repositories
          </div>
        </div>

        <div className="surface-card p-4 space-y-1 border-[#1c2233]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Completed Analyses</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {history?.length || 0}
          </div>
          <div className="text-[11px] text-emerald-400 font-sans">
            Immutable AST snapshots
          </div>
        </div>

        <div className="surface-card p-4 space-y-1 border-[#1c2233]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Behavior Deltas</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {totalDeltas}
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Observable changes detected
          </div>
        </div>

        <div className="surface-card p-4 space-y-1 border-[#1c2233]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Contract Surfaces</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {totalContracts}
          </div>
          <div className="text-[11px] text-indigo-400 font-sans">
            DRF & Model schemas mapped
          </div>
        </div>
      </div>

      {/* Workspace Switcher & Creator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
          <span className="text-xs text-slate-400 mr-2 font-mono uppercase tracking-wider text-[11px]">Workspace:</span>
          {workspaces?.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWorkspaceId(w.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorkspace?.id === w.id
                  ? 'bg-indigo-950/70 text-indigo-200 border border-indigo-700/60 font-semibold shadow-sm'
                  : 'bg-[#10141f] text-slate-400 border border-[#1d2334] hover:text-white'
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

        <form onSubmit={handleCreateWorkspace} className="flex items-center gap-2">
          <input
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="New workspace name..."
            className="px-3 py-1.5 rounded-lg bg-[#0e111a] border border-[#1f2638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={isCreatingWorkspace || !newWorkspaceName.trim()}
            className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#232b3e] text-xs font-medium text-slate-200 disabled:opacity-50 cursor-pointer"
          >
            {isCreatingWorkspace ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>

      {/* Analyses Table with Search */}
      <div className="surface-card border-[#1f2638] overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#1b2130] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0e15]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Recent Snapshot Analyses</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#161b27] text-slate-400 border border-[#232b3e]">
              {filteredHistory.length}
            </span>
          </div>

          {/* Search in History */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by branch, status, or ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#090b10] border border-[#1e2537] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {isHistoryLoading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-xs font-mono">Loading analysis snapshots from database...</span>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="divide-y divide-[#171d2b] font-mono text-xs">
            {filteredHistory.map((run: any) => (
              <div
                key={run.id}
                onClick={() => navigate(`/analysis/${run.id}`)}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#111522] transition-colors cursor-pointer group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm">
                      {run.base_snapshot_label} <span className="text-slate-500">→</span> {run.head_snapshot_label}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                        run.status === 'completed'
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                          : run.status === 'running'
                          ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 animate-pulse'
                          : 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-sans">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(run.created_at).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>Engine v{run.engine_version}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">ID: {run.id.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="flex items-center gap-3 font-sans shrink-0">
                  <div className="text-center px-3 py-1.5 rounded-lg bg-[#0e111a] border border-[#1e2537] min-w-[64px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Deltas</span>
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {run.counts?.deltas ?? 0}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-[#0e111a] border border-[#1e2537] min-w-[64px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Contracts</span>
                    <span className="text-xs font-bold text-indigo-300 font-mono">
                      {run.counts?.contracts ?? 0}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-[#0e111a] border border-[#1e2537] min-w-[64px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Unknowns</span>
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      {run.counts?.unknowns ?? 0}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all ml-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center space-y-4">
            <FileCode2 className="w-10 h-10 text-slate-500 mx-auto" />
            <div>
              <h3 className="text-sm font-semibold text-slate-200">No matching analyses</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery ? `No analysis found matching "${searchQuery}".` : 'Upload base and head source ZIP archives to run your first behavioral impact analysis.'}
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs inline-flex items-center gap-1.5 cursor-pointer"
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
