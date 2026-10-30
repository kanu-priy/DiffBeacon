import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCode2,
  FolderOpen,
  GitBranch,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { api } from '../../lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('diffbeacon-auth-token');

  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: api.getWorkspaces,
    enabled: isAuthenticated,
  });

  const activeWorkspace = workspaces[0];

  const { data: recentHistory = [] } = useQuery({
    queryKey: ['workspace-history', activeWorkspace?.id],
    queryFn: () => (activeWorkspace ? api.getWorkspaceHistory(activeWorkspace.id) : []),
    enabled: !!activeWorkspace,
  });

  const summary = useMemo(() => {
    const totalAnalyses = recentHistory.length;
    const totalDeltas = recentHistory.reduce((sum, run) => sum + (run.counts?.deltas || 0), 0);
    const totalContracts = recentHistory.reduce((sum, run) => sum + (run.counts?.contracts || 0), 0);
    const totalUnknowns = recentHistory.reduce((sum, run) => sum + (run.counts?.unknowns || 0), 0);
    const lastUpdated = recentHistory[0]?.completed_at || recentHistory[0]?.created_at;

    return {
      totalAnalyses,
      totalDeltas,
      totalContracts,
      totalUnknowns,
      lastUpdated,
    };
  }, [recentHistory]);

  const workspaceHighlights = workspaces.slice(0, 3);
  const recentRuns = recentHistory.slice(0, 3);

  return (
    <div className="min-h-screen">
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#23342b] bg-[#0d1712]/80 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[#8fe6a9]">
              <Sparkles className="w-3.5 h-3.5" />
              workspace-aware analysis
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                Understand what your changes <span className="text-[#8fe6a9]">really affect.</span>
              </h1>
              <p className="max-w-xl text-base text-[#a1a1a1] leading-relaxed">
                DiffBeacon adapts to each user’s workspace, project history, and real code snapshots so the analysis feels like a working product instead of hard-coded mock data.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2">
                <span>Create workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#a1a1a1]" />
                <span>Open workspaces</span>
              </button>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#666] font-mono">live overview</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {activeWorkspace?.name || 'No workspace yet'}
                </h2>
              </div>
              <div className="rounded-full border border-[#213427] bg-[#0d1712] p-2 text-[#8fe6a9]">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-[#1e1e1e] bg-[#0b0b0b] p-3">
                <span className="text-sm text-[#a1a1a1]">Analyses</span>
                <strong className="text-lg font-semibold text-white">{summary.totalAnalyses}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#1e1e1e] bg-[#0b0b0b] p-3">
                <span className="text-sm text-[#a1a1a1]">Behavior changes</span>
                <strong className="text-lg font-semibold text-[#8fe6a9]">{summary.totalDeltas}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#1e1e1e] bg-[#0b0b0b] p-3">
                <span className="text-sm text-[#a1a1a1]">Contract surfaces</span>
                <strong className="text-lg font-semibold text-white">{summary.totalContracts}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#1e1e1e] bg-[#0b0b0b] p-3">
                <span className="text-sm text-[#a1a1a1]">Unknowns</span>
                <strong className="text-lg font-semibold text-[#f5b862]">{summary.totalUnknowns}</strong>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#666]">
              <Clock3 className="w-3.5 h-3.5" />
              <span>
                {summary.lastUpdated ? `Last updated ${new Date(summary.lastUpdated).toLocaleString()}` : 'No analysis run yet'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#666] font-mono">workspace feed</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Your projects</h2>
              </div>
              <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2 px-3 py-2">
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {isWorkspacesLoading ? (
              <div className="rounded-xl border border-dashed border-[#28342d] bg-[#0a0d0b] p-6 text-sm text-[#8a918d]">
                Loading workspaces...
              </div>
            ) : workspaceHighlights.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#28342d] bg-[#0a0d0b] p-6 text-sm text-[#8a918d]">
                No workspaces yet. Create your first project to start generating real change analysis.
              </div>
            ) : (
              <div className="space-y-3">
                {workspaceHighlights.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => navigate('/dashboard')}
                    className="w-full rounded-xl border border-[#202020] bg-[#0b0b0b] p-3 text-left transition-colors hover:border-[#2d3a30] hover:bg-[#0f130f]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md border border-[#1d2b22] bg-[#0f1712] p-2 text-[#8fe6a9]">
                          <FolderOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{workspace.name}</div>
                          <div className="text-[11px] text-[#666]">{workspace.description || 'Workspace'}</div>
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-[#8fe6a9]">{workspace.analysis_count || 0} runs</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#666] font-mono">recent activity</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Latest analyses</h2>

            {recentRuns.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-[#28342d] bg-[#0a0d0b] p-4 text-sm text-[#8a918d]">
                No analysis runs yet. Upload snapshots to build your first diff story.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentRuns.map((run) => (
                  <div key={run.id} className="rounded-xl border border-[#202020] bg-[#0b0b0b] p-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#8fe6a9] font-mono">
                      <GitBranch className="w-3.5 h-3.5" />
                      {run.base_snapshot_label || 'base'} → {run.head_snapshot_label || 'head'}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-[#a1a1a1]">
                      <span>{run.status}</span>
                      <span>{run.counts?.deltas || 0} deltas</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#666] font-mono">why it works</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Built around real user workflows</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Workflow,
              title: 'Workspace-aware',
              text: 'The experience uses the actual repositories and analysis history connected to the user instead of hard-coded example data.',
            },
            {
              icon: FileCode2,
              title: 'Snapshot-driven',
              text: 'Every result is anchored to the user’s base and head snapshots, so there is a clear trail from diff to impact.',
            },
            {
              icon: ShieldCheck,
              title: 'Evidence first',
              text: 'Breakages, contracts, and unknowns are surfaced with provenance instead of broad, generic AI-style claims.',
            },
            {
              icon: CheckCircle2,
              title: 'Autonomous flow',
              text: 'Users can create workspaces, upload snapshots, and review current analysis without manually forcing demo data into the product.',
            },
          ].map((item) => (
            <div key={item.title} className="card p-4">
              <div className="mb-3 inline-flex rounded-lg border border-[#1d2b22] bg-[#0f1712] p-2 text-[#8fe6a9]">
                <item.icon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a1a1a1]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="card p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Start from real work, not from a mock dataset.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#a1a1a1] leading-relaxed">
            Create a workspace, upload snapshots, and inspect the actual impact of your code changes in a system designed to behave like a proper product workflow.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2">
              <span>Open dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#8fe6a9]" />
              <span>Create a workspace</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
