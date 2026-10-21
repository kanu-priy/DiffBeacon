import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScenarioQuery, TraceStep } from '../../types';
import { api } from '../../lib/api';
import { EpistemicBadge } from '../../components/EpistemicBadge';
import {
  Split,
  Send,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Loader2,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Props {
  analysisId: string;
  onInspectLine: (filePath: string, line: number) => void;
}

export const ScenarioStudio: React.FC<Props> = ({ analysisId, onInspectLine }) => {
  const queryClient = useQueryClient();
  const [questionInput, setQuestionInput] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');

  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['scenarios', analysisId],
    queryFn: () => api.getScenarios(analysisId),
  });

  const activeScenario =
    scenarios?.find((s) => s.id === selectedScenarioId) || scenarios?.[0];

  const createScenarioMutation = useMutation({
    mutationFn: (q: string) => api.createScenario(analysisId, q),
    onSuccess: (newScenario) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios', analysisId] });
      setSelectedScenarioId(newScenario.id);
      setQuestionInput('');
    },
  });

  const starterQuestions = [
    'What happens if a request omits department_id now?',
    'How does salary validation behave between versions?',
    'What is different in the old and new execution paths?',
    'Which downstream consumers may be affected?',
    'What tests would distinguish the previous and proposed behavior?',
    'What assumptions are needed to reach this conclusion?',
  ];

  const handleStarterClick = (q: string) => {
    setQuestionInput(q);
    createScenarioMutation.mutate(q);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || createScenarioMutation.isPending) return;
    createScenarioMutation.mutate(questionInput.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header & Prompt Box */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-800/60 text-violet-400">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Change Scenario Studio</h2>
              <p className="text-xs text-slate-400">
                Query hypothetical runtime conditions and inspect side-by-side comparative execution traces.
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/60">
            Zero-Hallucination Guardrail Active
          </div>
        </div>

        {/* Question Starters */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suggested Scenario Starters:
          </span>
          <div className="flex flex-wrap gap-2">
            {starterQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleStarterClick(q)}
                disabled={createScenarioMutation.isPending}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 transition-colors text-left cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Ask a concrete behavioral question (e.g. 'What happens if a request omits department_id now?')..."
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            disabled={createScenarioMutation.isPending}
            className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!questionInput.trim() || createScenarioMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            {createScenarioMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Evaluate</span>
          </button>
        </form>
      </div>

      {/* Scenario List Tabs */}
      {scenarios && scenarios.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-semibold mr-1 shrink-0">Evaluated Scenarios:</span>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedScenarioId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono truncate max-w-xs transition-colors cursor-pointer shrink-0 ${
                activeScenario?.id === s.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {s.question}
            </button>
          ))}
        </div>
      )}

      {/* Active Scenario Detailed Trace */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <span className="text-xs">Extracting AST candidate execution paths...</span>
        </div>
      ) : activeScenario ? (
        <div className="space-y-6">
          {/* Section A: Scenario Interpretation */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                A. Scenario Interpretation
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Status: <strong className="text-teal-400 uppercase">{activeScenario.status}</strong>
              </span>
            </div>

            <div className="font-mono text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block mb-1">Normalized Runtime Condition:</span>
              <span className="text-cyan-300 font-semibold">{activeScenario.normalized_condition}</span>
            </div>

            {activeScenario.interpretation_assumptions?.length > 0 && (
              <div className="text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block text-[11px]">Evaluation Assumptions:</span>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {activeScenario.interpretation_assumptions.map((asm, idx) => (
                    <li key={idx}>{asm}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section B & C: Side-by-Side Path Traces */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
            {/* Before Path */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-rose-900/40 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-rose-900/40 font-sans">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  B. Before Path (Base v1.0)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeScenario.traces?.base?.length || 0} Steps
                </span>
              </div>

              <div className="space-y-3">
                {activeScenario.traces?.base?.map((step: TraceStep) => (
                  <div
                    key={step.step_index}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold flex items-center justify-center">
                          {step.step_index}
                        </span>
                        <span className="font-bold text-slate-200 truncate" title={step.symbol_qname}>
                          {step.symbol_qname}
                        </span>
                      </div>
                      <EpistemicBadge provenance={step.provenance} />
                    </div>

                    <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                      {step.explanation}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-400">
                      <span>{step.file_path}:{step.line_number}</span>
                      {step.line_number && (
                        <button
                          onClick={() => onInspectLine(step.file_path, step.line_number!)}
                          className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <FileCode className="w-3 h-3" />
                          <span>View Line</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* After Path */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-teal-900/40 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-teal-900/40 font-sans">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  C. After Path (Head v1.1)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeScenario.traces?.head?.length || 0} Steps
                </span>
              </div>

              <div className="space-y-3">
                {activeScenario.traces?.head?.map((step: TraceStep) => (
                  <div
                    key={step.step_index}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-950 text-teal-400 border border-teal-800 text-[10px] font-bold flex items-center justify-center">
                          {step.step_index}
                        </span>
                        <span className="font-bold text-slate-200 truncate" title={step.symbol_qname}>
                          {step.symbol_qname}
                        </span>
                      </div>
                      <EpistemicBadge provenance={step.provenance} />
                    </div>

                    <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                      {step.explanation}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-400">
                      <span>{step.file_path}:{step.line_number}</span>
                      {step.line_number && (
                        <button
                          onClick={() => onInspectLine(step.file_path, step.line_number!)}
                          className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <FileCode className="w-3 h-3" />
                          <span>View Line</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section D & E: Behavioral Delta & Downstream Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                D. Behavioral Delta
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeScenario.behavioral_delta_summary}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block">
                E. Downstream Impact
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeScenario.impact_summary}
              </p>
            </div>
          </div>

          {/* Section F: Verification Plan */}
          {activeScenario.verification_plan && (
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>F. Suggested Verification Plan</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                  {activeScenario.verification_plan.coverage_classification?.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Preconditions:</span>
                  <span>{activeScenario.verification_plan.preconditions}</span>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Input Payload:</span>
                  <span className="text-cyan-300">{activeScenario.verification_plan.input_data}</span>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Expected Outcome:</span>
                <span className="text-teal-300">{activeScenario.verification_plan.expected_result}</span>
              </div>

              {activeScenario.verification_plan.existing_test_ref && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <span className="font-semibold text-slate-300">Target Test Match:</span>
                  <code className="text-cyan-400">{activeScenario.verification_plan.existing_test_ref}</code>
                </div>
              )}
            </div>
          )}

          {/* Section G: Uncertainty Report */}
          {activeScenario.uncertainty_report?.length > 0 && (
            <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider font-sans">
                <AlertTriangle className="w-4 h-4" />
                <span>G. Uncertainty & Runtime Unknowns Report</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-200/90 pl-1">
                {activeScenario.uncertainty_report.map((unc, idx) => (
                  <li key={idx} className="leading-relaxed">{unc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
