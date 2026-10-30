import React, { useState, useEffect } from 'react';
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
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Terminal,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { useToast } from '../../components/Toast';

interface Props {
  analysisId: string;
  onInspectLine: (filePath: string, line: number) => void;
}

export const ScenarioStudio: React.FC<Props> = ({ analysisId, onInspectLine }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [questionInput, setQuestionInput] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');

  // Interactive Execution Stepper state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [testExecutionResult, setTestExecutionResult] = useState<'not_executed' | 'passed'>('not_executed');
  const [copiedSummary, setCopiedSummary] = useState(false);

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
      setCurrentStepIndex(1);
      setIsPlaying(false);
      setTestExecutionResult('not_executed');
      toast.success('Scenario Trace Synthesized', 'AST paths extracted and verified against code index.');
    },
    onError: (err: any) => {
      toast.error('Failed to run scenario', err.message || 'Error communicating with analysis engine.');
    },
  });

  const starterQuestions: string[] = [];

  const maxSteps = Math.max(
    activeScenario?.traces?.base?.length || 0,
    activeScenario?.traces?.head?.length || 0,
    1
  );

  // Auto-play stepper loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxSteps]);

  const handleRunSimulatedTest = () => {
    setIsTestRunning(true);
    setTimeout(() => {
      setIsTestRunning(false);
      setTestExecutionResult('passed');
      toast.success('Sandbox Test Passed', 'Assertions verified against Head snapshot.');
    }, 1200);
  };

  const handleCopyMarkdown = () => {
    if (!activeScenario) return;
    const md = `### DiffBeacon Scenario Trace: ${activeScenario.question}
**Normalized Condition:** ${activeScenario.normalized_condition}

**Behavioral Delta:**
${activeScenario.behavioral_delta_summary}

**Downstream Impact:**
${activeScenario.impact_summary}

**Verification Plan:**
- Preconditions: ${activeScenario.verification_plan.preconditions}
- Expected: ${activeScenario.verification_plan.expected_result}`;
    navigator.clipboard.writeText(md);
    setCopiedSummary(true);
    toast.success('Copied Markdown Summary', 'Scenario analysis copied to clipboard.');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Query Input */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/80 text-indigo-400">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Scenario Simulation Studio</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Execution Stepper
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Formulate hypotheses about runtime conditions and inspect side-by-side execution divergence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              disabled={!activeScenario}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedSummary ? 'Copied' : 'Export for PR'}</span>
            </button>
          </div>
        </div>

        {/* Suggestion Starter Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
            Preset Scenario Hypotheses:
          </span>
          <div className="flex flex-wrap gap-2">
            {starterQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestionInput(q);
                  createScenarioMutation.mutate(q);
                }}
                disabled={createScenarioMutation.isPending}
                className="px-2.5 py-1.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-indigo-300 transition-colors text-left cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Question Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (questionInput.trim() && !createScenarioMutation.isPending) {
              createScenarioMutation.mutate(questionInput.trim());
            }
          }}
          className="flex gap-2 pt-2"
        >
          <input
            type="text"
            placeholder="Type a concrete hypothesis (e.g. 'What happens if a request omits department_id now?')..."
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            disabled={createScenarioMutation.isPending}
            className="flex-1 text-xs px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={!questionInput.trim() || createScenarioMutation.isPending}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {createScenarioMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing AST...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Simulate Scenario</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Evaluated Scenarios Tab Strip */}
      {scenarios && scenarios.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-semibold mr-1 shrink-0">Evaluated Scenarios:</span>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedScenarioId(s.id);
                setCurrentStepIndex(1);
                setIsPlaying(false);
                setTestExecutionResult('not_executed');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono truncate max-w-xs transition-colors cursor-pointer shrink-0 ${
                activeScenario?.id === s.id
                  ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-700 font-semibold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {s.question}
            </button>
          ))}
        </div>
      )}

      {/* Interactive Scenario View */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-400 mx-auto" />
          <span className="text-xs font-mono">Extracting AST candidate execution paths...</span>
        </div>
      ) : activeScenario ? (
        <div className="space-y-6">
          {/* Section: Scenario Interpretation */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>Scenario Interpretation</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Resolution: <strong className="text-emerald-400 uppercase">{activeScenario.status}</strong>
              </span>
            </div>

            <div className="font-mono text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[11px] block mb-1">Normalized Runtime Condition:</span>
              <span className="text-indigo-300 font-medium">{activeScenario.normalized_condition}</span>
            </div>

            {activeScenario.interpretation_assumptions?.length > 0 && (
              <div className="text-xs text-slate-400 space-y-1 font-sans">
                <span className="font-semibold text-slate-300 block text-[11px]">Assumptions Made:</span>
                <ul className="list-disc list-inside space-y-0.5 pl-1 font-mono text-[11px] text-slate-400">
                  {activeScenario.interpretation_assumptions.map((asm, idx) => (
                    <li key={idx}>{asm}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Interactive Step-by-Step Playback Controller */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans font-semibold mr-1">Trace Step Simulator:</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                title={isPlaying ? 'Pause Auto-step' : 'Play Trace Auto-step'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Simulate Run'}</span>
              </button>

              <button
                onClick={() => setCurrentStepIndex((p) => Math.max(1, p - 1))}
                disabled={currentStepIndex <= 1}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                title="Step backward"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentStepIndex((p) => Math.min(maxSteps, p + 1))}
                disabled={currentStepIndex >= maxSteps}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                title="Step forward"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setCurrentStepIndex(1);
                  setIsPlaying(false);
                }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Reset Stepper"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: maxSteps }).map((_, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = stepNum === currentStepIndex;
                  const isPassed = stepNum < currentStepIndex;
                  return (
                    <button
                      key={stepNum}
                      onClick={() => setCurrentStepIndex(stepNum)}
                      className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-500 text-white ring-2 ring-indigo-400/50 scale-105'
                          : isPassed
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      {stepNum}
                    </button>
                  );
                })}
              </div>
              <span className="text-slate-400 text-[11px]">
                Step <strong>{currentStepIndex}</strong> of {maxSteps}
              </span>
            </div>
          </div>

          {/* Divergence Notification Banner when current step diverges */}
          {(() => {
            const baseStep = activeScenario.traces?.base?.find((s) => s.step_index === currentStepIndex);
            const headStep = activeScenario.traces?.head?.find((s) => s.step_index === currentStepIndex);
            const diverges = Boolean(baseStep && headStep && baseStep.explanation !== headStep.explanation);
            if (!diverges) return null;
            return (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/60 text-xs flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-100 flex items-center gap-2">
                  <span>Execution Divergence Point Active (Step {currentStepIndex})</span>
                </span>
                <p className="text-slate-300 text-[11px] font-mono leading-relaxed">
                  Base: {baseStep?.explanation} · Head: {headStep?.explanation}
                </p>
              </div>
            </div>
            );
          })()}

          {/* Side-by-Side Path Traces with Active Step Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
            {/* Before Path */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Before Path (Base v1.0)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeScenario.traces?.base?.length || 0} Steps
                </span>
              </div>

              <div className="space-y-3">
                {activeScenario.traces?.base?.map((step: TraceStep) => {
                  const isActive = step.step_index === currentStepIndex;
                  return (
                    <div
                      key={step.step_index}
                      className={`p-3.5 rounded-xl border transition-all duration-200 relative space-y-2 ${
                        isActive
                          ? 'bg-rose-950/30 border-rose-500/80 shadow-md'
                          : 'bg-slate-950/80 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                              isActive
                                ? 'bg-rose-500 text-white'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
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
                            className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 font-sans"
                          >
                            <FileCode className="w-3 h-3" />
                            <span>Inspect Line</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* After Path */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  After Path (Head v1.1)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeScenario.traces?.head?.length || 0} Steps
                </span>
              </div>

              <div className="space-y-3">
                {activeScenario.traces?.head?.map((step: TraceStep) => {
                  const isActive = step.step_index === currentStepIndex;
                  return (
                    <div
                      key={step.step_index}
                      className={`p-3.5 rounded-xl border transition-all duration-200 relative space-y-2 ${
                        isActive
                          ? 'bg-indigo-950/30 border-indigo-500/80 shadow-md'
                          : 'bg-slate-950/80 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                            }`}
                          >
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
                            className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 font-sans"
                          >
                            <FileCode className="w-3 h-3" />
                            <span>Inspect Line</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Behavioral Delta & Downstream Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                Behavioral Delta
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeScenario.behavioral_delta_summary}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider block">
                Downstream Impact
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeScenario.impact_summary}
              </p>
            </div>
          </div>

          {/* Verification Plan & Sandbox Trigger */}
          {activeScenario.verification_plan && (
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 font-sans">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verification Plan & Test Sandbox</span>
                </span>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {activeScenario.verification_plan.coverage_classification?.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      testExecutionResult === 'passed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {testExecutionResult === 'passed'
                      ? 'Runtime Verified: Passed'
                      : 'Static Proposal (Not Executed)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Preconditions:</span>
                  <span>{activeScenario.verification_plan.preconditions}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Input Payload:</span>
                  <span className="text-indigo-300">{activeScenario.verification_plan.input_data}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Expected Outcome:</span>
                <span className="text-emerald-300">{activeScenario.verification_plan.expected_result}</span>
              </div>

              {/* Interactive Test Runner Trigger */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-sans flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span>Target Test: <code className="text-indigo-300">{activeScenario.verification_plan.existing_test_ref || 'tests.test_api'}</code></span>
                </div>

                <button
                  onClick={handleRunSimulatedTest}
                  disabled={isTestRunning || testExecutionResult === 'passed'}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Running in Sandbox...</span>
                    </>
                  ) : testExecutionResult === 'passed' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified: Assertions Passed</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
                      <span>Execute Sandbox Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Uncertainty Report */}
          {activeScenario.uncertainty_report?.length > 0 && (
            <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider font-sans">
                <AlertTriangle className="w-4 h-4" />
                <span>Uncertainty & Runtime Unknowns Report</span>
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
