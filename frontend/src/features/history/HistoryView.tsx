import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { History, Calendar, CheckCircle2, ArrowRight, Loader2, GitCommit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  workspaceId: string;
  currentAnalysisId: string;
}

export const HistoryView: React.FC<Props> = ({ workspaceId, currentAnalysisId }) => {
  const navigate = useNavigate();

  const { data: history, isLoading } = useQuery({
    queryKey: ['workspace-history', workspaceId],
    queryFn: () => api.getWorkspaceHistory(workspaceId),
    enabled: !!workspaceId,
  });

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Historical Change Stories</h3>
          <p className="text-xs text-slate-400">
            Immutable analysis runs for this project. DiffBeacon preserves original evidence records rather than silently overwriting them.
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400">
          <strong>{history?.length || 0}</strong> Immutable Runs
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-xs">Loading versioned analysis history...</span>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {history?.map((run: any) => {
            const isCurrent = run.id === currentAnalysisId;
            return (
              <div
                key={run.id}
                className={`relative p-5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/20 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[27px] top-5 w-3.5 h-3.5 rounded-full border-2 ${
                    isCurrent
                      ? 'bg-cyan-400 border-slate-950 shadow-md shadow-cyan-400/50'
                      : 'bg-slate-700 border-slate-950'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200 text-xs">
                      {run.base_snapshot_label} <span className="text-slate-500">→</span> {run.head_snapshot_label}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                        Current View
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(run.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-3 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Deltas</span>
                    <span className="font-bold text-cyan-400">{run.counts?.deltas ?? 0}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Contracts</span>
                    <span className="font-bold text-teal-400">{run.counts?.contracts ?? 0}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Scenarios</span>
                    <span className="font-bold text-violet-400">{run.counts?.scenarios ?? 0}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Unknowns</span>
                    <span className="font-bold text-amber-400">{run.counts?.unknowns ?? 0}</span>
                  </div>
                </div>

                {!isCurrent && (
                  <div className="pt-3 text-right">
                    <button
                      onClick={() => navigate(`/analysis/${run.id}`)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>Switch to this Analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
