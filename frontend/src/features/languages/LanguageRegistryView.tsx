import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  Code2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Cpu,
  FileCode,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const LanguageRegistryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | '1' | '2'>('all');
  const [selectedCapability, setSelectedCapability] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: api.getLanguages,
  });

  const languages = data?.languages || [];

  const filteredLanguages = useMemo(() => {
    return languages.filter((lang) => {
      const matchesSearch =
        !searchQuery ||
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.extensions.some((ext) => ext.toLowerCase().includes(searchQuery.toLowerCase())) ||
        lang.parser_engine.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier =
        selectedTier === 'all' ||
        (selectedTier === '1' && lang.tier === 1) ||
        (selectedTier === '2' && lang.tier === 2);

      const matchesCapability =
        selectedCapability === 'all' || lang.capabilities.includes(selectedCapability);

      return matchesSearch && matchesTier && matchesCapability;
    });
  }, [languages, searchQuery, selectedTier, selectedCapability]);

  const capabilitiesList = [
    { key: 'all', label: 'All Capabilities' },
    { key: 'ast_parsing', label: 'AST Parsing' },
    { key: 'symbol_extraction', label: 'Symbol Extraction' },
    { key: 'call_graph', label: 'Call Graph' },
    { key: 'contract_analysis', label: 'Contract Diffs' },
    { key: 'test_discovery', label: 'Test Discovery' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1f2638]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5" />
            <span>Capability Registry</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Multi-Language Modular Adapters</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Language Analysis Capabilities
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl leading-relaxed">
            DiffBeacon enforces strict epistemic honesty. We explicitly disclose parser depth, extracted relationship types, and framework limitations for every language.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="surface-card px-3.5 py-2 border-[#1e2537] text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Total Languages</div>
            <div className="text-base font-bold text-white font-mono">{data?.total_supported || 26}</div>
          </div>
          <div className="surface-card px-3.5 py-2 border-[#1e2537] text-center">
            <div className="text-[10px] uppercase font-mono text-emerald-400">Tier 1 Full AST</div>
            <div className="text-base font-bold text-emerald-300 font-mono">{data?.tier_1_count || 11}</div>
          </div>
          <div className="surface-card px-3.5 py-2 border-[#1e2537] text-center">
            <div className="text-[10px] uppercase font-mono text-indigo-400">Tier 2 Structural</div>
            <div className="text-base font-bold text-indigo-300 font-mono">{data?.tier_2_count || 15}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card p-4 border-[#1f2638] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by language, extension (.py, .ts, .go), or engine..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#0a0d14] border border-[#1b202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Toggle */}
          <div className="flex items-center rounded-lg bg-[#0a0d14] p-1 border border-[#1b202e] text-xs">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedTier === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setSelectedTier('1')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedTier === '1' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tier 1 (Core)
            </button>
            <button
              onClick={() => setSelectedTier('2')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedTier === '2' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tier 2 (Structural)
            </button>
          </div>

          {/* Capability Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {capabilitiesList.map((cap) => (
              <button
                key={cap.key}
                onClick={() => setSelectedCapability(cap.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCapability === cap.key
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60 font-semibold'
                    : 'bg-[#0a0d14] text-slate-400 hover:text-white border-[#1b202e]'
                }`}
              >
                {cap.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Language Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLanguages.map((lang) => (
          <div
            key={lang.key}
            className="surface-card p-5 border-[#1f2638] surface-card-hover flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{lang.name}</h3>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-mono font-semibold uppercase ${
                      lang.tier === 1
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                    }`}
                  >
                    Tier {lang.tier}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  {lang.extensions.slice(0, 3).map((ext) => (
                    <span key={ext} className="bg-[#121622] px-1.5 py-0.5 rounded border border-[#1e2537]">
                      {ext}
                    </span>
                  ))}
                  {lang.extensions.length > 3 && (
                    <span className="text-slate-500">+{lang.extensions.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Description & Engine */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{lang.description}</p>
              
              <div className="mt-3 p-2.5 rounded-lg bg-[#0a0d14] border border-[#1b202e] text-[11px] font-mono text-slate-400">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Parser Architecture:</span>
                <span className="text-indigo-300">{lang.parser_engine}</span>
              </div>

              {/* Supported Frameworks */}
              {lang.supported_frameworks.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                  <span className="text-slate-500">Frameworks:</span>
                  {lang.supported_frameworks.map((fw) => (
                    <span key={fw} className="bg-[#10141f] text-emerald-400 px-1.5 py-0.5 rounded border border-[#1d2638]">
                      {fw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              {/* Capabilities checklist */}
              <div className="pt-3 border-t border-[#1b202e] space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Capabilities:</div>
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                  {lang.capabilities.map((cap: string) => (
                    <span
                      key={cap}
                      className="inline-flex items-center gap-1 text-slate-300 bg-[#0e121c] px-2 py-0.5 rounded border border-[#1c2233]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{cap.replace('_', ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Known Limitations */}
              {lang.known_limitations.length > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[10px] font-mono text-amber-200/90 space-y-1">
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Analysis Boundaries:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-300">
                    {lang.known_limitations.map((lim: string, i: number) => (
                      <li key={i} className="truncate">{lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
