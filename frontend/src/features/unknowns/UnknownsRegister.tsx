import React, { useState, useMemo } from 'react';
import { UnknownEntry } from '../../types';
import {
  AlertTriangle,
  Wrench,
  FileCode,
  CheckCircle2,
  Search,
  Filter,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../components/Toast';

interface Props {
  unknowns: UnknownEntry[];
  onInspectLine?: (filePath: string, line: number) => void;
}

export const UnknownsRegister: React.FC<Props> = ({ unknowns, onInspectLine }) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [resolvedEntries, setResolvedEntries] = useState<Record<string, { status: string; note: string }>>({});
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [annotationInput, setAnnotationInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reasons = useMemo(() => ['all', ...Array.from(new Set(unknowns.map((u) => u.reason)))], [unknowns]);

  const filteredUnknowns = useMemo(() => {
    return unknowns.filter((u) => {
      const matchesReason = reasonFilter === 'all' || u.reason === reasonFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        u.title.toLowerCase().includes(q) ||
        u.explanation.toLowerCase().includes(q) ||
        u.code_snippet.toLowerCase().includes(q) ||
        u.file_path.toLowerCase().includes(q) ||
        u.resolution_strategy.toLowerCase().includes(q);

      return matchesReason && matchesSearch;
    });
  }, [unknowns, reasonFilter, searchQuery]);

  const handleSaveAnnotation = (id: string) => {
    setResolvedEntries((prev) => ({
      ...prev,
      [id]: {
        status: 'Developer Annotated',
        note: annotationInput || 'Developer confirmed dynamic dispatch is safe at runtime.',
      },
    }));
    setActiveAnnotationId(null);
    setAnnotationInput('');
    toast.success('Static Boundary Annotated', 'Runtime assumption successfully recorded.');
  };

  const copyDiagnostic = (entry: UnknownEntry) => {
    const md = `### [Static Analysis Uncertainty] ${entry.title} (${entry.reason})
**File:** \`${entry.file_path}:${entry.line_number || 'N/A'}\`
**Limit:** ${entry.explanation}
**Observed Code:** \`${entry.code_snippet}\`
**Recommended Resolution:** ${entry.resolution_strategy}
`;
    navigator.clipboard.writeText(md);
    setCopiedId(entry.id);
    toast.success('Copied Uncertainty Record', 'Diagnostic markdown copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>The Unknowns Register</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            First-class tracking of static analysis boundaries. DiffBeacon explicitly surfaces dynamic calls and missing runtime state instead of manufacturing hallucinations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/60 font-bold">
            {unknowns.length} Explicit Uncertainties
          </span>
          <span className="text-teal-400 bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-800/60 font-bold">
            {Object.keys(resolvedEntries).length} Annotated
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search uncertainties by file, symbol, or limit..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Reason Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Limit Type:</span>
          {reasons.map((r) => (
            <button
              key={r}
              onClick={() => setReasonFilter(r)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                reasonFilter === r
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Unknowns List */}
      <div className="space-y-4">
        {filteredUnknowns.map((entry) => {
          const resolved = resolvedEntries[entry.id];
          const isAnnotating = activeAnnotationId === entry.id;

          return (
            <div
              key={entry.id}
              className={`rounded-xl border transition-all overflow-hidden shadow-xl ${
                resolved
                  ? 'bg-slate-900/90 border-teal-800/60'
                  : 'bg-slate-900/80 border-amber-900/40 hover:border-amber-800/60'
              }`}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {resolved ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{entry.title}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {entry.file_path} {entry.line_number ? `:${entry.line_number}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold font-mono bg-amber-950/60 text-amber-300 border border-amber-800">
                    {entry.reason.replace('_', ' ')}
                  </span>

                  {resolved ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>{resolved.status}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveAnnotationId(isAnnotating ? null : entry.id);
                        setAnnotationInput('');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    >
                      <Edit3 className="w-3 h-3 text-cyan-400" />
                      <span>Annotate</span>
                    </button>
                  )}

                  <button
                    onClick={() => copyDiagnostic(entry)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Copy diagnostic record"
                  >
                    {copiedId === entry.id ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 font-mono text-xs">
                {/* Code Snippet */}
                {entry.code_snippet && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                      Static AST Observation:
                    </span>
                    <code>{entry.code_snippet}</code>
                  </div>
                )}

                {/* Explanation */}
                <div className="font-sans text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-100">Deterministic Analysis Boundary: </span>
                  {entry.explanation}
                </div>

                {/* Resolution Strategy */}
                <div className="p-3.5 rounded-lg bg-teal-950/20 border border-teal-900/30 text-teal-200 font-sans text-xs flex items-start gap-2.5">
                  <Wrench className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-teal-300 block mb-0.5">Recommended Resolution Strategy:</span>
                    <span className="leading-relaxed">{entry.resolution_strategy}</span>
                  </div>
                </div>

                {/* Resolved Note if Present */}
                {resolved && (
                  <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-800/60 text-xs font-sans text-teal-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-teal-300 block">Developer Annotation:</span>
                      <span>{resolved.note}</span>
                    </div>
                  </div>
                )}

                {/* Annotation Input Box */}
                {isAnnotating && (
                  <div className="p-4 rounded-lg bg-slate-950 border border-cyan-800/80 space-y-3 font-sans">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Record Developer Ground Truth / Runtime Contract:</span>
                    </div>
                    <textarea
                      value={annotationInput}
                      onChange={(e) => setAnnotationInput(e.target.value)}
                      placeholder="e.g. Verified notification event triggers PaymentNotificationHandler in production settings..."
                      className="w-full p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 h-20"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveAnnotationId(null)}
                        className="px-3 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveAnnotation(entry.id)}
                        className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        Save Annotation
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Source Link */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-sans">
                  <span>
                    Referenced File: <strong className="font-mono text-slate-300">{entry.file_path}</strong>
                  </span>
                  {entry.line_number && onInspectLine && (
                    <button
                      onClick={() => onInspectLine(entry.file_path, entry.line_number!)}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Inspect in Split Diff</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
