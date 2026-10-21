import React from 'react';
import { ContractDelta } from '../../types';
import { ShieldAlert, ShieldCheck, Cpu, Database, Network, AlertTriangle } from 'lucide-react';

interface Props {
  contracts: ContractDelta[];
}

export const ContractMap: React.FC<Props> = ({ contracts }) => {
  const getContractIcon = (type: string) => {
    switch (type) {
      case 'drf_serializer':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'django_model':
        return <Database className="w-4 h-4 text-teal-400" />;
      case 'api_route':
        return <Network className="w-4 h-4 text-violet-400" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Contract Surface Map</h3>
          <p className="text-xs text-slate-400">
            Compare supported contracts across base and head. Distinguishes schema differences from demonstrated breaking changes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-teal-950/60 text-teal-400 border border-teal-800/60">
            {contracts.filter((c) => !c.is_breaking).length} Non-Breaking
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-400 border border-rose-800/60">
            {contracts.filter((c) => c.is_breaking).length} Breaking
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 font-sans">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                  {getContractIcon(contract.contract_type)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 font-mono">{contract.identifier}</h4>
                  <span className="text-[11px] text-slate-400 font-sans capitalize">
                    {contract.contract_type.replace('_', ' ')} • {contract.change_nature.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                {contract.is_breaking ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/50 text-rose-400 border border-rose-800/80">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Breaking Change</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-950/50 text-teal-400 border border-teal-800/80">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Backward-Compatible</span>
                  </span>
                )}
              </div>
            </div>

            {/* Assessment */}
            <div className="font-sans text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
              <span className="font-semibold text-slate-200">Compatibility Assessment: </span>
              {contract.compatibility_assessment}
            </div>

            {/* Spec Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Base Specification (v1.0)
                </span>
                <pre className="text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(contract.before_spec, null, 2)}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                  Head Specification (v1.1)
                </span>
                <pre className="text-[11px] text-cyan-200 overflow-x-auto">
                  {JSON.stringify(contract.after_spec, null, 2)}
                </pre>
              </div>
            </div>

            {/* Unresolved Assumptions */}
            {contract.unresolved_assumptions && contract.unresolved_assumptions.length > 0 && (
              <div className="pt-2 font-sans">
                <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Unresolved Assumptions / Required Follow-ups:</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-1">
                  {contract.unresolved_assumptions.map((asm, idx) => (
                    <li key={idx}>{asm}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
