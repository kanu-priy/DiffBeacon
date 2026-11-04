import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  Compass,
  ArrowRight,
  Loader2,
  Sparkles,
  Play,
  Layers,
  Code2,
  ShieldCheck,
  AlertTriangle,
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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121c15] border border-[#233829] text-[#a3e635] text-xs font-mono">
          <Compass className="w-3.5 h-3.5" />
          <span>Fictional Fixture Service</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          BeaconWorks API Demo Workspace
        </h1>
        <p className="text-[#a1a1a1] text-sm max-w-xl mx-auto leading-relaxed">
          A realistic Django REST Framework service bundled with deliberate behavioral changes, schema shifts, broken references, and dynamic dispatch unknowns.
        </p>
      </div>

      {/* Main Seed & Launch Card */}
      <div className="surface-card p-8 border-[#202e23] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b261d]">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#a3e635] font-semibold">Snapshot Comparison</div>
            <h2 className="text-lg font-semibold text-white mt-1">BeaconWorks baseline → updated analysis</h2>
            <p className="text-xs text-[#a1a1a1] font-mono mt-0.5">
              Base: <code className="text-slate-300">baseline</code> | Head: <code className="text-[#d6fa64]">updated-change-set</code>
            </p>
          </div>

          <button
            onClick={handleStartOrOpenDemo}
            disabled={isSeeding}
            className="btn-primary font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSeeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#07110b]" />
                <span>Running 12-Stage AST Pipeline...</span>
              </>
            ) : demoStatus?.is_seeded ? (
              <>
                <Play className="w-4 h-4 fill-current text-[#07110b]" />
                <span>Open Seeded Analysis Story</span>
                <ArrowRight className="w-4 h-4 text-[#07110b]" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#07110b]" />
                <span>Seed & Run Analysis Pipeline</span>
                <ArrowRight className="w-4 h-4 text-[#07110b]" />
              </>
            )}
          </button>
        </div>

        {/* Deliberate Fixture Scenarios Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-[#a1a1a1]">
            Deliberately Designed Behavioral Changes in Fixture:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-[#0c120e] border border-[#1b281f] space-y-1">
              <span className="text-[#a3e635] font-bold block">1. Optional DRF Serializer Field</span>
              <p className="text-[#a1a1a1] font-sans text-xs">
                <code>department_id</code> changed from <code>required=True</code> to <code>required=False</code> in <code>EmployeeCreateSerializer</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c120e] border border-[#1b281f] space-y-1">
              <span className="text-amber-400 font-bold block">2. Altered Validation Floor</span>
              <p className="text-[#a1a1a1] font-sans text-xs">
                Minimum salary threshold raised from $30,000 to $45,000 in <code>validate_annual_salary</code> and payroll service.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c120e] border border-[#1b281f] space-y-1">
              <span className="text-[#d6fa64] font-bold block">3. Django Model Default Shift</span>
              <p className="text-[#a1a1a1] font-sans text-xs">
                <code>Employee.employment_status</code> default altered from <code>'probation'</code> to <code>'active'</code> with migration.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c120e] border border-[#1b281f] space-y-1">
              <span className="text-[#7ee7b2] font-bold block">4. Tax Rate Modification</span>
              <p className="text-[#a1a1a1] font-sans text-xs">
                Tax deduction calculation changed from 15% to 20% in <code>payroll.py</code> with unit test assertions.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c120e] border border-[#1b281f] space-y-1">
              <span className="text-[#ff7d7d] font-bold block">5. Broken Reference to Deleted Symbol</span>
              <p className="text-[#a1a1a1] font-sans text-xs">
                <code>legacy_format_ssn</code> deleted in head <code>utils.py</code>, leaving broken reference in <code>reporting.py</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c120e] border border-[#1b281f] space-y-1">
              <span className="text-[#8aa99a] font-bold block">6. Intentionally Unresolved Dynamic Dispatch</span>
              <p className="text-[#a1a1a1] font-sans text-xs">
                <code>notifications.py</code> uses <code>getattr(notifier, 'send_' + channel)</code>, correctly tracked in Unknowns Register.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c120e] border border-[#1b281f] space-y-1">
              <span className="text-[#8fe6a9] font-bold block">7. Cross-Stack Frontend Client Tracing</span>
              <p className="text-[#a1a1a1] font-sans text-xs">
                <code>client/employeeClient.ts</code> API consumers statically linked to DRF routes via <code>consumed_by_client</code> edges.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c120e] border border-[#1b281f] space-y-1">
              <span className="text-[#a3e635] font-bold block">8. Cryptographic Citation Linter</span>
              <p className="text-[#a1a1a1] font-sans text-xs">
                Every line range re-opened from disk in Stage 11 with SHA-256 slice hash validation (0 hallucinated citations).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
