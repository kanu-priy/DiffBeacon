import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Compass,
  FileCode2,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Loader2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { SnapshotUploadModal } from './SnapshotUploadModal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');

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
    if (demoStatus?.is_seeded && demoStatus.analysis_id) {
      navigate(`/analysis/${demoStatus.analysis_id}`);
    } else {
      const res = await api.seedDemoWorkspace();
      refetchDemo();
      refetchWorkspaces();
      navigate(`/analysis/${res.analysis_id}`);
    }
  };

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
            Track immutable change intelligence runs and inspect behavioral deltas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchDemo}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-800/80 text-cyan-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Open BeaconWorks Demo</span>
          </button>

          <button
            onClick={() => {
              if (activeWorkspace) {
                setSelectedWorkspaceId(activeWorkspace.id);
                setIsUploadModalOpen(true);
              }
            }}
            disabled={!activeWorkspace}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>New Snapshot Analysis</span>
          </button>
        </div>
      </div>

      {/* Workspace Selector Bar */}
      {workspaces && workspaces.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-slate-400 mr-2 font-medium">Workspaces:</span>
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWorkspaceId(w.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                (activeWorkspace?.id === w.id)
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/80'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {w.name} {w.is_demo && '(Demo)'}
            </button>
          ))}
        </div>
      )}

      {/* Analyses Table */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-200">Recent Analysis Runs</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400">
              {history?.length || 0}
            </span>
          </div>
        </div>

        {isHistoryLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-xs">Loading analysis records...</span>
          </div>
        ) : history && history.length > 0 ? (
          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {history.map((run: any) => (
              <div
                key={run.id}
                onClick={() => navigate(`/analysis/${run.id}`)}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
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
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(run.created_at).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>Engine v{run.engine_version}</span>
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="flex items-center gap-3 font-sans">
                  <div className="text-center px-3 py-1 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Deltas</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {run.counts?.deltas ?? 0}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Contracts</span>
                    <span className="text-xs font-bold text-teal-400 font-mono">
                      {run.counts?.contracts ?? 0}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Unknowns</span>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {run.counts?.unknowns ?? 0}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <FileCode2 className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-sm font-semibold text-slate-300">No analyses yet in this workspace</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload a base and head source ZIP to run your first behavioral impact analysis.
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
