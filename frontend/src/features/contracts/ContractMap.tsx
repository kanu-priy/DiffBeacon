import React, { useState, useMemo } from 'react';
import { ContractDelta } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Database,
  Network,
  AlertTriangle,
  Search,
  Filter,
  Copy,
  Check,
  Code2,
  ListTree,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../../components/Toast';

interface Props {
  contracts: ContractDelta[];
  onInspectEvidence?: (filePath: string, lineRange: [number, number]) => void;
}

export const ContractMap: React.FC<Props> = ({ contracts, onInspectEvidence }) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [breakingFilter, setBreakingFilter] = useState<'all' | 'breaking' | 'compatible'>('all');
  const [viewFormat, setViewFormat] = useState<'visual' | 'json'>('visual');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getContractIcon = (type: string) => {
    switch (type) {
      case 'drf_serializer':
        return <Cpu className="w-4 h-4 text-[#d6fa64]" />;
      case 'django_model':
        return <Database className="w-4 h-4 text-[#8fe6a9]" />;
      case 'api_route':
        return <Network className="w-4 h-4 text-[#7ee7b2]" />;
      default:
        return <Cpu className="w-4 h-4 text-[#a7b7b0]" />;
    }
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesType = typeFilter === 'all' || c.contract_type === typeFilter;
      const matchesBreaking =
        breakingFilter === 'all' ||
        (breakingFilter === 'breaking' && c.is_breaking) ||
        (breakingFilter === 'compatible' && !c.is_breaking);

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.identifier.toLowerCase().includes(q) ||
        c.compatibility_assessment.toLowerCase().includes(q) ||
        c.contract_type.toLowerCase().includes(q);

      return matchesType && matchesBreaking && matchesSearch;
    });
  }, [contracts, typeFilter, breakingFilter, searchQuery]);

  const copySpec = (contract: ContractDelta) => {
    const payload = JSON.stringify(
      {
        identifier: contract.identifier,
        type: contract.contract_type,
        is_breaking: contract.is_breaking,
        before: contract.before_spec,
        after: contract.after_spec,
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setCopiedId(contract.id);
    toast.success('Contract Spec Copied', `Copied specification for ${contract.identifier}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper to render schema properties side-by-side
  const renderVisualFieldDiff = (before: Record<string, any> = {}, after: Record<string, any> = {}) => {
    const allKeys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));

    if (allKeys.length === 0) {
      return (
        <div className="p-3 text-slate-500 text-xs italic">
          No explicit schema fields declared.
        </div>
      );
    }

    return (
      <div className="divide-y divide-slate-800/80 font-mono text-xs">
        {allKeys.map((key) => {
          const beforeVal = before[key];
          const afterVal = after[key];
          const isAdded = beforeVal === undefined && afterVal !== undefined;
          const isRemoved = beforeVal !== undefined && afterVal === undefined;
          const isModified =
            beforeVal !== undefined &&
            afterVal !== undefined &&
            JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

          return (
            <div
              key={key}
              className={`p-2.5 grid grid-cols-1 md:grid-cols-12 gap-2 items-center transition-colors ${
                isAdded
                  ? 'bg-teal-950/20'
                  : isRemoved
                  ? 'bg-rose-950/20'
                  : isModified
                  ? 'bg-amber-950/20'
                  : 'hover:bg-slate-900/40'
              }`}
            >
              {/* Field Key & Change Indicator */}
              <div className="md:col-span-4 flex items-center gap-2">
                {isAdded && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                )}
                {isRemoved && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
                {isModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                {!isAdded && !isRemoved && !isModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                )}
                <span className="font-semibold text-slate-200">{key}</span>
                {isAdded && (
                  <span className="text-[10px] font-bold text-teal-400 uppercase bg-teal-950 px-1 rounded border border-teal-800">
                    Added
                  </span>
                )}
                {isRemoved && (
                  <span className="text-[10px] font-bold text-rose-400 uppercase bg-rose-950 px-1 rounded border border-rose-800">
                    Removed
                  </span>
                )}
                {isModified && (
                  <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-950 px-1 rounded border border-amber-800">
                    Modified
                  </span>
                )}
              </div>

              {/* Before Value */}
              <div className="md:col-span-4 text-slate-400 text-[11px] truncate" title={JSON.stringify(beforeVal)}>
                <span className="text-[10px] text-slate-600 md:hidden block">Base:</span>
                {beforeVal !== undefined ? (
                  typeof beforeVal === 'object' ? JSON.stringify(beforeVal) : String(beforeVal)
                ) : (
                  <span className="text-slate-600 italic">None</span>
                )}
              </div>

              {/* After Value */}
              <div
                className={`md:col-span-4 text-[11px] truncate ${
                  isAdded
                    ? 'text-teal-300 font-semibold'
                    : isModified
                    ? 'text-amber-300 font-semibold'
                    : 'text-slate-300'
                }`}
                title={JSON.stringify(afterVal)}
              >
                <span className="text-[10px] text-slate-600 md:hidden block">Head:</span>
                {afterVal !== undefined ? (
                  typeof afterVal === 'object' ? JSON.stringify(afterVal) : String(afterVal)
                ) : (
                  <span className="text-rose-400/80 italic">Removed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const breakingCount = contracts.filter((c) => c.is_breaking).length;
  const compatibleCount = contracts.filter((c) => !c.is_breaking).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="surface-card p-4 border-[#1e2a22] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#d6fa64]" />
            <span>Contract Surface Map</span>
          </h3>
          <p className="text-xs text-[#a7b7b0] mt-0.5">
            Compare supported contracts across base and head. Distinguishes structural schema differences from demonstrated breaking changes.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setBreakingFilter(breakingFilter === 'compatible' ? 'all' : 'compatible')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              breakingFilter === 'compatible'
                ? 'bg-[#14231b] text-[#9ef0c7] border-[#2e4738] font-bold shadow-sm'
                : 'bg-[#0f1713] text-[#7ee7b2] border-[#1d2b22] hover:bg-[#15231c]'
            }`}
          >
            {compatibleCount} Compatible
          </button>
          <button
            onClick={() => setBreakingFilter(breakingFilter === 'breaking' ? 'all' : 'breaking')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              breakingFilter === 'breaking'
                ? 'bg-[#291313] text-[#ffb0b0] border-[#592222] font-bold shadow-sm'
                : 'bg-[#1c0f0f] text-[#ff7d7d] border-[#381a1a] hover:bg-[#261313]'
            }`}
          >
            {breakingCount} Breaking
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#0b100d] border border-[#1b281f] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#7a8c86] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts (e.g. EmployeeCreateSerializer)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#070b09] border border-[#1d2b22] text-[#edf7f2] placeholder-[#7a8c86] text-xs focus:outline-none focus:border-[#8fe6a9] font-mono"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            {['all', 'drf_serializer', 'django_model', 'api_route'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  typeFilter === type
                    ? 'bg-[#15231c] text-[#d6fa64] border border-[#2e4738] font-semibold'
                    : 'bg-[#070b09] text-[#a7b7b0] hover:text-white border border-[#1d2b22]'
                }`}
              >
                {type === 'drf_serializer' ? 'Serializers' : type === 'django_model' ? 'Models' : type === 'api_route' ? 'Routes' : 'All Types'}
              </button>
            ))}
          </div>
        </div>

        {/* View Format Toggle (Visual Diff vs JSON) */}
        <div className="flex items-center rounded-lg bg-[#070b09] p-1 border border-[#1d2b22] text-xs">
          <button
            onClick={() => setViewFormat('visual')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewFormat === 'visual' ? 'bg-[#d6fa64] text-[#07110b] font-medium shadow-sm' : 'text-[#a7b7b0] hover:text-white'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Field Diff</span>
          </button>
          <button
            onClick={() => setViewFormat('json')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewFormat === 'json' ? 'bg-[#d6fa64] text-[#07110b] font-medium shadow-sm' : 'text-[#a7b7b0] hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs border border-slate-800 rounded-xl bg-slate-950/40">
          No contracts found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 overflow-hidden shadow-xl"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1410] border-b border-[#1b281f]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#070b09] border border-[#1d2b22]">
                    {getContractIcon(contract.contract_type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <span>{contract.identifier}</span>
                    </h4>
                    <span className="text-[11px] text-[#a7b7b0] font-sans capitalize">
                      {contract.contract_type.replace('_', ' ')} • Nature: {contract.change_nature.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {contract.is_breaking ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#291313] text-[#ffb0b0] border border-[#592222] shadow-sm">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#ff7d7d]" />
                      <span>Breaking Change</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#14231b] text-[#9ef0c7] border border-[#2e4738] shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#7ee7b2]" />
                      <span>Backward-Compatible</span>
                    </span>
                  )}

                  <button
                    onClick={() => copySpec(contract)}
                    className="p-1.5 rounded bg-[#15231c] hover:bg-[#1d2f26] border border-[#23352b] text-[#a7b7b0] hover:text-white transition-colors cursor-pointer"
                    title="Copy contract specification"
                  >
                    {copiedId === contract.id ? <Check className="w-3.5 h-3.5 text-[#7ee7b2]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 pb-5 space-y-4">
                {/* Assessment Box */}
                <div className="font-sans text-xs text-slate-300 leading-relaxed bg-[#070b09] p-3.5 rounded-lg border border-[#1d2b22]">
                  <span className="font-semibold text-white">Compatibility Assessment: </span>
                  {contract.compatibility_assessment}
                </div>

                {/* Schema Diff: Visual or JSON */}
                <div className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
                  <div className="px-3.5 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>SCHEMA FIELD DIFF (Baseline → Updated)</span>
                    <span className="text-slate-500">Property Comparisons</span>
                  </div>

                  {viewFormat === 'visual' ? (
                    renderVisualFieldDiff(contract.before_spec, contract.after_spec)
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-3 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Base Version Specification
                        </span>
                        <pre className="text-[11px] text-slate-300 overflow-x-auto bg-slate-900/40 p-2.5 rounded">
                          {JSON.stringify(contract.before_spec, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                          Head Version Specification
                        </span>
                        <pre className="text-[11px] text-cyan-200 overflow-x-auto bg-slate-900/40 p-2.5 rounded">
                          {JSON.stringify(contract.after_spec, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Unresolved Assumptions */}
                {contract.unresolved_assumptions && contract.unresolved_assumptions.length > 0 && (
                  <div className="pt-1 font-sans">
                    <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 mb-1.5">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
