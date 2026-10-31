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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-soft)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--brand)] font-semibold uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5" />
            <span>Capability Registry</span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-secondary)]">Multi-Language Modular Adapters</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Language Analysis Capabilities
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            DiffBeacon enforces strict epistemic honesty. We explicitly disclose parser depth, extracted relationship types, and framework limitations for every language.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="surface-card px-3.5 py-2 border-[var(--border-soft)] text-center">
            <div className="text-[10px] uppercase font-mono text-[var(--text-muted)]">Total Languages</div>
            <div className="text-base font-bold text-[var(--text-primary)] font-mono">{data?.total_supported || 26}</div>
          </div>
          <div className="surface-card px-3.5 py-2 border-[var(--border-soft)] text-center">
            <div className="text-[10px] uppercase font-mono text-[var(--brand)]">Tier 1 Full AST</div>
            <div className="text-base font-bold text-[var(--brand-strong)] font-mono">{data?.tier_1_count || 11}</div>
          </div>
          <div className="surface-card px-3.5 py-2 border-[var(--border-soft)] text-center">
            <div className="text-[10px] uppercase font-mono text-[var(--brand-blue)]">Tier 2 Structural</div>
            <div className="text-base font-bold text-[var(--brand-blue)] font-mono">{data?.tier_2_count || 15}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card p-4 border-[var(--border-soft)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by language, extension (.py, .ts, .go), or engine..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-soft)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Toggle */}
          <div className="flex items-center rounded-lg bg-[var(--bg-base)] p-1 border border-[var(--border-soft)] text-xs">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedTier === 'all' ? 'bg-[var(--brand)] text-[var(--bg-base)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setSelectedTier('1')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedTier === '1' ? 'bg-[var(--brand-strong)] text-[var(--bg-base)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Tier 1 (Core)
            </button>
            <button
              onClick={() => setSelectedTier('2')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                selectedTier === '2' ? 'bg-[var(--brand)] text-[var(--bg-base)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                    ? 'bg-[rgba(143,230,169,0.08)] text-[var(--brand)] border-[var(--brand)]/40 font-semibold'
                    : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-soft)]'
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
            className="surface-card p-5 border-[var(--border-soft)] surface-card-hover flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{lang.name}</h3>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-mono font-semibold uppercase ${
                      lang.tier === 1
                        ? 'bg-[rgba(126,231,178,0.12)] text-[var(--success)] border border-[rgba(126,231,178,0.25)]'
                        : 'bg-[rgba(125,181,255,0.12)] text-[var(--brand-blue)] border border-[rgba(125,181,255,0.25)]'
                    }`}
                  >
                    Tier {lang.tier}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] text-[var(--text-muted)]">
                  {lang.extensions.slice(0, 3).map((ext) => (
                    <span key={ext} className="bg-[rgba(11,17,16,0.9)] px-1.5 py-0.5 rounded border border-[var(--border-soft)]">
                      {ext}
                    </span>
                  ))}
                  {lang.extensions.length > 3 && (
                    <span className="text-[var(--text-muted)]">+{lang.extensions.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Description & Engine */}
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">{lang.description}</p>

              <div className="mt-3 p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-soft)] text-[11px] font-mono text-[var(--text-secondary)]">
                <span className="text-[var(--text-muted)] block text-[9px] uppercase tracking-wider">Parser Architecture:</span>
                <span className="text-[var(--brand-blue)]">{lang.parser_engine}</span>
              </div>

              {/* Supported Frameworks */}
              {lang.supported_frameworks.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                  <span className="text-[var(--text-muted)]">Frameworks:</span>
                  {lang.supported_frameworks.map((fw) => (
                    <span key={fw} className="bg-[rgba(11,17,16,0.9)] text-[var(--success)] px-1.5 py-0.5 rounded border border-[var(--border-soft)]">
                      {fw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              {/* Capabilities checklist */}
              <div className="pt-3 border-t border-[var(--border-soft)] space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Capabilities:</div>
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                  {lang.capabilities.map((cap: string) => (
                    <span
                      key={cap}
                      className="inline-flex items-center gap-1 text-[var(--text-secondary)] bg-[rgba(11,17,16,0.9)] px-2 py-0.5 rounded border border-[var(--border-soft)]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
                      <span>{cap.replace('_', ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Known Limitations */}
              {lang.known_limitations.length > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-[rgba(245,214,123,0.08)] border border-[rgba(245,214,123,0.25)] text-[10px] font-mono text-[rgba(243,216,138,0.9)] space-y-1">
                  <div className="flex items-center gap-1 text-[var(--brand-strong)] font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Analysis Boundaries:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[var(--text-secondary)]">
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
