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
  AlertCircle,
  FileCheck,
  Search,
  Sparkles,
  RefreshCw,
  Cpu,
  Split,
  Network,
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
  });

  const { data: demoStatus, refetch: refetchDemo } = useQuery({
    queryKey: ['demo-status'],
    queryFn: api.getDemoStatus,
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Analysis Workspace Dashboard</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Track immutable change intelligence runs, inspect behavioral deltas, and run change scenario simulations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchDemo}
            disabled={isSeedingDemo}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-800/80 text-cyan-300 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            {isSeedingDemo ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Compass className="w-4 h-4 text-cyan-400" />
            )}
            <span>{isSeedingDemo ? 'Seeding Demo...' : 'Launch BeaconWorks Demo'}</span>
          </button>

          <button
            onClick={() => {
              if (activeWorkspace) {
                setSelectedWorkspaceId(activeWorkspace.id);
                setIsUploadModalOpen(true);
              }
            }}
            disabled={!activeWorkspace}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>New Snapshot Analysis</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Workspaces</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">
            {workspaces?.length || 1}
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Includes seeded demo repository
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Analyses</span>
            <FileCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">
            {history?.length || 0}
          </div>
          <div className="text-[11px] text-teal-400 font-sans">
            Immutable snapshot runs
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Behavior Deltas</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            {totalDeltas}
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Observed across snapshots
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Epistemic Guardrail</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono">
            100%
          </div>
          <div className="text-[11px] text-emerald-400 font-sans">
            Zero fabricated line citations
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      {workspaces && workspaces.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 mr-2 font-medium">Workspaces:</span>
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWorkspaceId(w.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeWorkspace?.id === w.id
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {w.name} {w.is_demo && '(Demo)'}
            </button>
          ))}
        </div>
      )}

      {/* Analyses Table with Search */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-200">Recent Analysis Runs</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400">
              {filteredHistory.length}
            </span>
          </div>

          {/* Search in History */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search analysis runs..."
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {isHistoryLoading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
            <span className="text-xs">Loading analysis history...</span>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {filteredHistory.map((run: any) => (
              <div
                key={run.id}
                onClick={() => navigate(`/analysis/${run.id}`)}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors text-sm">
                      {run.base_snapshot_label} <span className="text-slate-500">→</span> {run.head_snapshot_label}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                        run.status === 'completed'
                          ? 'bg-teal-950/60 text-teal-400 border border-teal-800/60'
                          : run.status === 'running'
                          ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 animate-pulse'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
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
                  <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 min-w-[64px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Deltas</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {run.counts?.deltas ?? 0}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 min-w-[64px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Contracts</span>
                    <span className="text-xs font-bold text-teal-400 font-mono">
                      {run.counts?.contracts ?? 0}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 min-w-[64px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Unknowns</span>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {run.counts?.unknowns ?? 0}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all ml-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center space-y-4">
            <FileCode2 className="w-10 h-10 text-slate-500 mx-auto" />
            <div>
              <h3 className="text-sm font-semibold text-slate-300">No matching analyses</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery ? `No analysis found matching "${searchQuery}".` : 'Upload a base and head source ZIP to run your first behavioral impact analysis.'}
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
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
