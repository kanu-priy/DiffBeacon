import React, { useState } from 'react';
import { BehaviorDelta } from '../../types';
import { EpistemicBadge } from '../../components/EpistemicBadge';
import {
  FileCode,
  ArrowRight,
  Filter,
  Check,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api';

interface Props {
  deltas: BehaviorDelta[];
  analysisId: string;
  onInspectEvidence: (filePath: string, lineRange: [number, number]) => void;
}

export const BehaviorLedger: React.FC<Props> = ({
  deltas,
  analysisId,
  onInspectEvidence,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});

  const categories = ['all', ...Array.from(new Set(deltas.map((d) => d.category)))];

  const filteredDeltas =
    selectedCategory === 'all'
      ? deltas
      : deltas.filter((d) => d.category === selectedCategory);

  const handleFeedback = async (deltaId: string, rating: string) => {
    try {
      await api.submitFeedback(analysisId, {
        target_type: 'delta',
        target_id: deltaId,
        rating,
      });
      setFeedbackSent((prev) => ({ ...prev, [deltaId]: rating }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">Category Filter:</span>
          <div className="flex flex-wrap gap-1.5 ml-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-cyan-400 font-bold">{filteredDeltas.length}</span> of {deltas.length} deltas
        </div>
      </div>

      {/* Deltas List */}
      <div className="space-y-4">
        {filteredDeltas.map((delta) => (
          <div
            key={delta.id}
            className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-slate-800 text-slate-300">
                  {delta.category.replace('_', ' ')}
                </span>
                <h3 className="text-sm font-bold text-slate-100">{delta.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <EpistemicBadge provenance={delta.confidence} />
              </div>
            </div>

            {/* Summary */}
            <p className="text-xs text-slate-300 leading-relaxed">{delta.summary}</p>

            {/* Before vs After Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* Before */}
              <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  <span>Before Version (v1.0)</span>
                  <span className="text-[10px] text-slate-400">
                    L{delta.base_line_range[0]}-{delta.base_line_range[1]}
                  </span>
                </div>
                <div className="text-slate-300 whitespace-pre-wrap text-[11px] bg-slate-950/60 p-2.5 rounded border border-rose-900/20 font-mono">
                  {delta.before_behavior}
                </div>
              </div>

              {/* After */}
              <div className="p-3.5 rounded-lg bg-teal-950/20 border border-teal-900/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                  <span>After Version (v1.1)</span>
                  <span className="text-[10px] text-slate-400">
                    L{delta.head_line_range[0]}-{delta.head_line_range[1]}
                  </span>
                </div>
                <div className="text-slate-300 whitespace-pre-wrap text-[11px] bg-slate-950/60 p-2.5 rounded border border-teal-900/20 font-mono">
                  {delta.after_behavior}
                </div>
              </div>
            </div>

            {/* Target Symbol & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono truncate">
                <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-cyan-300 font-semibold truncate">{delta.affected_symbol}</span>
                <span className="text-slate-500">in</span>
                <span className="text-slate-400 truncate">{delta.file_path}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Feedback */}
                <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
                  <span className="text-[10px] text-slate-400 mr-1">Helpful?</span>
                  <button
                    onClick={() => handleFeedback(delta.id, 'useful')}
                    className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                      feedbackSent[delta.id] === 'useful' ? 'text-teal-400' : 'text-slate-400'
                    }`}
                    title="Mark as useful and accurate"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(delta.id, 'incorrect')}
                    className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                      feedbackSent[delta.id] === 'incorrect' ? 'text-rose-400' : 'text-slate-400'
                    }`}
                    title="Mark as incorrect"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onInspectEvidence(delta.file_path, delta.head_line_range)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Inspect Source Evidence</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
