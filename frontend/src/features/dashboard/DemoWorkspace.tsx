import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  Compass,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const DemoWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);

  const { data: demoStatus, isLoading, refetch } = useQuery({
    queryKey: ['demo-status'],
    queryFn: api.getDemoStatus,
  });

  const handleStartOrOpenDemo = async () => {
    if (demoStatus?.is_seeded && demoStatus.analysis_id) {
      navigate(`/analysis/${demoStatus.analysis_id}`);
    } else {
      setIsSeeding(true);
      try {
        const res = await api.seedDemoWorkspace();
        await refetch();
        setIsSeeding(false);
        navigate(`/analysis/${res.analysis_id}`);
      } catch (err) {
        setIsSeeding(false);
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Fictional Fixture Project</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">
          BeaconWorks API Demo Workspace
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          A realistic Django REST Framework service bundled with deliberate behavioral changes, schema shifts, broken references, and dynamic unknowns.
        </p>
      </div>

      {/* Main Seed & Launch Card */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Snapshot Comparison: v1.0 → v1.1</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Base: <code className="text-slate-300">v1.0-baseline</code> | Head: <code className="text-cyan-400">v1.1-department-update</code>
            </p>
          </div>

          <button
            onClick={handleStartOrOpenDemo}
            disabled={isSeeding}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSeeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running 12-Stage Pipeline...</span>
              </>
            ) : demoStatus?.is_seeded ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Open Seeded Analysis Story</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Seed & Run Analysis Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Deliberate Fixture Scenarios Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
            Deliberately Designed Behavioral Changes in Fixture:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-cyan-400 font-bold block">1. Optional DRF Serializer Field</span>
              <p className="text-slate-400 font-sans text-[11px]">
                <code>department_id</code> changed from <code>required=True</code> to <code>required=False</code> in <code>EmployeeCreateSerializer</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-teal-400 font-bold block">2. Altered Validation Floor</span>
              <p className="text-slate-400 font-sans text-[11px]">
                Minimum salary threshold raised from $30,000 to $45,000 in <code>validate_annual_salary</code> and payroll service.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-violet-400 font-bold block">3. Django Model Default Shift</span>
              <p className="text-slate-400 font-sans text-[11px]">
                <code>Employee.employment_status</code> default altered from <code>'probation'</code> to <code>'active'</code> with migration.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-emerald-400 font-bold block">4. Tax Rate Modification</span>
              <p className="text-slate-400 font-sans text-[11px]">
                Tax deduction calculation changed from 15% to 20% in <code>payroll.py</code> with unit test assertions.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-rose-400 font-bold block">5. Broken Reference to Deleted Symbol</span>
              <p className="text-slate-400 font-sans text-[11px]">
                <code>legacy_format_ssn</code> deleted in head <code>utils.py</code>, leaving broken reference in <code>reporting.py</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-amber-400 font-bold block">6. Intentionally Unresolved Dynamic Dispatch</span>
              <p className="text-slate-400 font-sans text-[11px]">
                <code>notifications.py</code> uses <code>getattr(notifier, 'send_' + channel)</code>, correctly tracked in Unknowns Register.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
