import React from 'react';
import { VerificationCase } from '../../types';
import { CheckCircle2, AlertCircle, FileCheck, PlayCircle, ShieldCheck } from 'lucide-react';

interface Props {
  cases: VerificationCase[];
}

export const VerificationMatrix: React.FC<Props> = ({ cases }) => {
  const getCoverageBadge = (classification: string) => {
    switch (classification) {
      case 'existing_covered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-950/60 text-teal-400 border border-teal-800/80">
            <CheckCircle2 className="w-3 h-3" />
            <span>Existing Test Matched</span>
          </span>
        );
      case 'possibly_covered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-950/60 text-violet-400 border border-violet-800/80">
            <FileCheck className="w-3 h-3" />
            <span>Possibly Covered (Indirect)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/80">
            <AlertCircle className="w-3 h-3" />
            <span>Suggested Test (Uncovered)</span>
          </span>
        );
    }
  };

  const getExecutionBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
            Runtime Verified: Passed
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-rose-950 text-rose-400 border border-rose-800">
            Runtime Verified: Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-slate-900 text-slate-400 border border-slate-800">
            Static Recommendation (Not Executed)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Verification Matrix</h3>
          <p className="text-xs text-slate-400">
            Derived verification recommendations rooted in actual detected changes and test references.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          <strong className="text-cyan-400">{cases.length}</strong> Test Recommendations
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {cases.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 font-sans">
              <h4 className="text-sm font-bold text-slate-100">{c.title}</h4>
              <div className="flex items-center gap-2">
                {getCoverageBadge(c.coverage_classification)}
                {getExecutionBadge(c.execution_status)}
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              <strong className="text-slate-200">Rationale: </strong>
              {c.rationale}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Preconditions:
                </span>
                <span>{c.preconditions}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Input Data / Test Invocation:
                </span>
                <span className="text-cyan-300">{c.input_data}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Expected Observable Result:
              </span>
              <span className="text-teal-300">{c.expected_result}</span>
            </div>

            {c.existing_test_ref && (
              <div className="text-[11px] text-slate-400 pt-1 font-sans flex items-center gap-1.5">
                <span className="font-semibold text-slate-300 font-mono">Referenced Test:</span>
                <code className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {c.existing_test_ref}
                </code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
