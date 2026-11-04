import React, { useState, useMemo } from 'react';
import { BehaviorDelta } from '../../types';
import { EpistemicBadge } from '../../components/EpistemicBadge';
import {
  FileCode,
  ArrowRight,
  Filter,
  Search,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Network,
  Copy,
  Check,
  LayoutGrid,
  List,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

interface Props {
  deltas: BehaviorDelta[];
  analysisId: string;
  onInspectEvidence: (filePath: string, lineRange: [number, number]) => void;
  onNavigateToGraph?: (symbol: string) => void;
}

export const BehaviorLedger: React.FC<Props> = ({
  deltas,
  analysisId,
  onInspectEvidence,
  onNavigateToGraph,
}) => {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});
  const [copiedDeltaId, setCopiedDeltaId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => ['all', ...Array.from(new Set(deltas.map((d) => d.category)))], [deltas]);
  const confidences = useMemo(() => ['all', ...Array.from(new Set(deltas.map((d) => d.confidence)))], [deltas]);

  const filteredDeltas = useMemo(() => {
    return deltas.filter((d) => {
      const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
      const matchesConfidence = selectedConfidence === 'all' || d.confidence === selectedConfidence;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.affected_symbol.toLowerCase().includes(q) ||
        d.file_path.toLowerCase().includes(q) ||
        d.before_behavior.toLowerCase().includes(q) ||
        d.after_behavior.toLowerCase().includes(q);

      return matchesCategory && matchesConfidence && matchesSearch;
    });
  }, [deltas, selectedCategory, selectedConfidence, searchQuery]);

  const handleFeedback = async (deltaId: string, rating: string) => {
    try {
      await api.submitFeedback(analysisId, {
        target_type: 'delta',
        target_id: deltaId,
        rating,
      });
      setFeedbackSent((prev) => ({ ...prev, [deltaId]: rating }));
      toast.success(
        rating === 'useful' ? 'Feedback Recorded: Helpful' : 'Feedback Recorded: Reported',
        'Your assessment helps calibrate deterministic reasoning.'
      );
    } catch (err) {
      toast.error('Failed to submit feedback');
    }
  };

  const copyAsMarkdown = (delta: BehaviorDelta) => {
    const md = `### [Behavior Delta] ${delta.title} (${delta.category})
**Symbol:** \`${delta.affected_symbol}\` in \`${delta.file_path}\`
**Epistemic Provenance:** ${delta.confidence.replace('_', ' ')}

- **Before:** ${delta.before_behavior}
- **After:** ${delta.after_behavior}
- **Summary:** ${delta.summary}
`;
    navigator.clipboard.writeText(md);
    setCopiedDeltaId(delta.id);
    toast.success('Copied PR Review Note', 'Markdown summary copied to clipboard');
    setTimeout(() => setCopiedDeltaId(null), 2500);
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Search & Control Filter Bar */}
      <div className="surface-card p-4 border-[#1d2b22] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deltas by symbol, file, or behavior..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#080d0a] border border-[#1b281f] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8fe6a9]/80 transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* View Mode Toggle & Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg bg-[#080d0a] p-1 border border-[#1b281f] text-xs">
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'detailed' ? 'bg-[#15241b] text-[#d6fa64] border border-[#2e4738] font-medium shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Detailed Side-by-Side View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Detailed</span>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'compact' ? 'bg-[#15241b] text-[#d6fa64] border border-[#2e4738] font-medium shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Compact List View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Compact</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              <span className="text-[#8fe6a9] font-bold">{filteredDeltas.length}</span> of {deltas.length} deltas
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#1b281f] text-xs">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#15231c] text-[#8fe6a9] border border-[#2e4738] font-semibold shadow-sm'
                    : 'bg-[#080d0a] text-slate-400 hover:text-white border border-[#1b281f]'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="hidden lg:block w-px h-4 bg-[#1b281f]" />

          {/* Confidence Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-1">Provenance:</span>
            {confidences.map((conf) => (
              <button
                key={conf}
                onClick={() => setSelectedConfidence(conf)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  selectedConfidence === conf
                    ? 'bg-[#15231c] text-[#7ee7b2] border border-[#2e4738] font-semibold shadow-sm'
                    : 'bg-[#080d0a] text-slate-400 hover:text-white border border-[#1b281f]'
                }`}
              >
                {conf.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deltas Cards */}
      {filteredDeltas.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs border border-[#1d2b22] rounded-xl bg-[#080d0a] space-y-2 font-mono">
          <p>No behavior deltas match your search and filter criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedConfidence('all');
              setSearchQuery('');
            }}
            className="text-[#8fe6a9] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeltas.map((delta) => {
            const isExpanded = expandedCards[delta.id] ?? (viewMode === 'detailed');

            return (
              <div
                key={delta.id}
                className="surface-card border-[#1d2b22] overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b110d] border-b border-[#1b281f]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#13231a] text-[#8fe6a9] border border-[#213b2c]">
                      {delta.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-semibold text-white">{delta.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <EpistemicBadge provenance={delta.confidence} />
                    <button
                      onClick={() => toggleExpand(delta.id)}
                      className="p-1.5 rounded bg-[#0c120e] hover:bg-[#14231b] text-slate-300 transition-colors cursor-pointer border border-[#1d2b22]"
                      title={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                {isExpanded && (
                  <div className="p-5 space-y-4">
                    {/* Summary */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{delta.summary}</p>

                    {/* Before vs After Side-by-Side Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                      {/* Before */}
                      <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                          <span>Baseline Behavior</span>
                          <span className="text-[10px] text-slate-400">
                            L{delta.base_line_range[0]}-{delta.base_line_range[1]}
                          </span>
                        </div>
                        <div className="text-slate-300 whitespace-pre-wrap text-[11px] bg-[#060b09] p-2.5 rounded border border-rose-900/20 font-mono leading-relaxed">
                          {delta.before_behavior}
                        </div>
                      </div>

                      {/* After */}
                      <div className="p-3.5 rounded-lg bg-[#0e1913]/70 border border-[#1f382a] space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#8fe6a9] uppercase tracking-wider">
                          <span>Updated Behavior</span>
                          <span className="text-[10px] text-slate-400">
                            L{delta.head_line_range[0]}-{delta.head_line_range[1]}
                          </span>
                        </div>
                        <div className="text-slate-300 whitespace-pre-wrap text-[11px] bg-[#060b09] p-2.5 rounded border border-[#1f382a]/50 font-mono leading-relaxed">
                          {delta.after_behavior}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1b281f] text-xs text-slate-400 font-sans">
                      {/* Symbol Location */}
                      <div className="flex items-center gap-2 font-mono truncate">
                        <FileCode className="w-3.5 h-3.5 text-[#8fe6a9] shrink-0" />
                        <span className="text-[#d6fa64] font-semibold truncate">{delta.affected_symbol}</span>
                        <span className="text-slate-600">in</span>
                        <span className="text-slate-400 truncate">{delta.file_path}</span>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Copy Markdown */}
                        <button
                          onClick={() => copyAsMarkdown(delta)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0c120e] hover:bg-[#14231b] border border-[#1d2b22] text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Copy Markdown summary for pull request review"
                        >
                          {copiedDeltaId === delta.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy PR Note</span>
                            </>
                          )}
                        </button>

                        {/* Inspect Source Diff */}
                        <button
                          onClick={() => onInspectEvidence(delta.file_path, delta.head_line_range)}
                          className="px-3 py-1.5 rounded-lg bg-[#15241b] hover:bg-[#1f382a] text-[#d6fa64] border border-[#2e4738] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Inspect Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        {/* Feedback Thumbs */}
                        <div className="flex items-center gap-1 pl-1">
                          <button
                            onClick={() => handleFeedback(delta.id, 'useful')}
                            className={`p-1.5 rounded hover:bg-[#0c120e] transition-colors cursor-pointer ${
                              feedbackSent[delta.id] === 'useful' ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-400'
                            }`}
                            title="Helpful and verified"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(delta.id, 'incorrect')}
                            className={`p-1.5 rounded hover:bg-[#0c120e] transition-colors cursor-pointer ${
                              feedbackSent[delta.id] === 'incorrect' ? 'text-rose-400 bg-rose-950/60' : 'text-slate-400'
                            }`}
                            title="Report inaccuracy"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
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
