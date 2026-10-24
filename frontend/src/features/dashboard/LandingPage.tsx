import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Split,
  Search,
  CheckCircle,
  AlertTriangle,
  FileCode2,
  GitBranch,
  Layers,
  Cpu,
  Network,
  CheckCircle2,
  FileCheck,
  PlayCircle,
  Terminal,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scenarios' | 'ledger' | 'contracts' | 'graph' | 'verification' | 'unknowns'>('scenarios');
  const [selectedScenarioPrompt, setSelectedScenarioPrompt] = useState(
    'What happens if a request omits department_id now?'
  );

  const scenarioExamples = [
    {
      q: 'What happens if a request omits department_id now?',
      target: 'EmployeeCreateSerializer',
      base: 'Returns HTTP 400 Bad Request ("department_id is required").',
      head: 'Passes validation; downstream service assigns fallback Dept #1.',
      divergence: 'Step 2: Base raises ValidationError; Head branches to fallback service.',
    },
    {
      q: 'What happens if an employee salary is under $45,000?',
      target: 'EmployeeCreateView',
      base: 'Passes validation (Base salary floor: $30,000).',
      head: 'Raises HTTP 400 ValidationError ("Minimum salary threshold is $45,000").',
      divergence: 'Step 3: Base saves record; Head rejects compensation.',
    },
    {
      q: 'What happens when an event notification triggers unknown handler?',
      target: 'send_notification',
      base: 'Silent fallback or missing handler log.',
      head: 'Dynamic getattr dispatch; static analyzer surfaces explicit boundary.',
      divergence: 'Step 2: Analysis marks dynamic dispatch in Unknowns Register.',
    },
  ];

  const currentScenario = scenarioExamples.find((s) => s.q === selectedScenarioPrompt) || scenarioExamples[0];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 text-center">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-tr from-cyan-500/15 via-violet-500/15 to-teal-500/15 blur-[120px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-800/80 text-cyan-400 text-xs font-medium mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>AI-Assisted Code-Change Understanding & Behavioral Impact Analysis</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          See what a code change <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">touches</span> before you ship.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          DiffBeacon delivers an evidence-backed explanation of how program behavior differs between two versions, which downstream systems are impacted, which scenarios require verification, and what static analysis acknowledges it cannot know.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/demo')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            <span>Launch Built-In Demo (BeaconWorks API)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <FileCode2 className="w-4 h-4 text-slate-400" />
            <span>Open Dashboard / Upload Snapshots</span>
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
          <span>✓ 100% Free & Local</span>
          <span>•</span>
          <span>✓ No API Keys or Cloud Account Required</span>
          <span>•</span>
          <span>✓ Zero Hallucination Guarantee</span>
        </div>
      </section>

      {/* Interactive Scenario Studio Live Showcase */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="border border-slate-800 rounded-2xl bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-700/60 text-violet-300 text-xs font-semibold mb-2">
                <Split className="w-3.5 h-3.5 text-violet-400" />
                <span>The Signature Experience</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Change Scenario Studio
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                DiffBeacon resolves deterministic AST paths before synthesizing side-by-side Base vs Head execution traces. Try a prompt below:
              </p>
            </div>

            <button
              onClick={() => navigate('/demo')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start lg:self-auto cursor-pointer transition-colors"
            >
              <span>Explore in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Question Prompts */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {scenarioExamples.map((ex) => (
                <button
                  key={ex.q}
                  onClick={() => setSelectedScenarioPrompt(ex.q)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    selectedScenarioPrompt === ex.q
                      ? 'bg-violet-950/80 text-violet-200 border border-violet-500/80 font-bold shadow-md shadow-violet-950'
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {ex.q}
                </button>
              ))}
            </div>

            {/* Interactive Trace Result Card */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Target Symbol:</span>
                  <span className="text-cyan-300 font-bold">{currentScenario.target}</span>
                </div>
                <span className="text-[10px] text-teal-400 font-bold uppercase bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  Statically Established
                </span>
              </div>

              {/* Side-by-Side Path Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    Base Path Execution (v1.0)
                  </div>
                  <div className="text-slate-300 text-xs leading-relaxed">
                    {currentScenario.base}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-teal-950/20 border border-teal-900/40 space-y-2">
                  <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                    Head Path Execution (v1.1)
                  </div>
                  <div className="text-slate-300 text-xs leading-relaxed">
                    {currentScenario.head}
                  </div>
                </div>
              </div>

              {/* Divergence Fork Highlight */}
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 flex items-center gap-2.5 text-amber-300 text-xs font-sans">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Behavioral Fork:</strong> {currentScenario.divergence}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 6 Pillars of the Change Story Interactive Explorer */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            The 6 Pillars of the Change Story
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Every analysis constructs a verifiable Change Story answering what changed, what it touches, and what static analysis cannot know.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
          {[
            { id: 'scenarios', label: 'Scenario Studio', icon: <Split className="w-3.5 h-3.5 text-violet-400" /> },
            { id: 'ledger', label: 'Behavior Ledger', icon: <Layers className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'contracts', label: 'Contract Map', icon: <Cpu className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'graph', label: 'Impact Explorer', icon: <Network className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: 'verification', label: 'Verification Matrix', icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'unknowns', label: 'Unknowns Register', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === t.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-md shadow-cyan-950'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Preview Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-4xl mx-auto text-xs space-y-3 font-sans">
          {activeTab === 'scenarios' && (
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Split className="w-4 h-4 text-violet-400" />
                <span>Scenario Studio: Side-by-Side Execution Paths</span>
              </h3>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Pose hypothetical developer questions about inputs, edge cases, and runtime conditions. The system calculates deterministic AST paths and renders side-by-side before/after traces with source line citations.
              </p>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Behavior Delta Ledger: Observable Shifts</span>
              </h3>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Explains meaningful behavioral consequences rather than lines added or removed. Categorizes API contracts, validation bounds, data models, error handling, and deleted symbols with exact line ranges.
              </p>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span>Contract Surface Map: Breaking vs Compatible Differences</span>
              </h3>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Compares supported contracts across DRF serializers, URL routes, and database models. Distinguishes harmless schema field additions from demonstrated breaking contract regressions.
              </p>
            </div>
          )}

          {activeTab === 'graph' && (
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400" />
                <span>Evidence-Backed Impact Explorer: Interactive Graph Canvas</span>
              </h3>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Powered by an interactive topological canvas with real-time blast-radius isolation. Clicking any node dims unrelated code, spotlighting the exact chain of callers and callees connected to the change.
              </p>
            </div>
          )}

          {activeTab === 'verification' && (
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Verification Matrix: Test Recommendations & Sandbox Execution</span>
              </h3>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Derives test cases with preconditions, input payloads, and expected observable results. Test cases can be run directly inside the interactive sandbox runner to verify runtime assertions.
              </p>
            </div>
          )}

          {activeTab === 'unknowns' && (
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>The Unknowns Register: Honest Epistemic Boundaries</span>
              </h3>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Surfaces what static analysis cannot establish with certainty—such as dynamic dispatches, missing runtime configuration, and database state assumptions—instead of manufacturing hallucinations.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Grid: Generic PR Bots vs DiffBeacon */}
      <section className="max-w-5xl mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100">
            Why DiffBeacon is Different
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Built from first principles to solve the fundamental flaws of conversational diff reviewers.
          </p>
        </div>

        <div className="border border-slate-800 rounded-2xl bg-slate-900/50 overflow-hidden text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Generic PR Bots */}
            <div className="p-6 space-y-4 bg-slate-950/40">
              <div className="text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                Generic AI Code Reviewers & PR Bots
              </div>
              <ul className="space-y-2.5 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Summarizes diff lines without understanding program execution paths.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Fabricates nonexistent line numbers, files, and functions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Conflates schema additions with catastrophic breaking changes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Hides dynamic execution uncertainties behind false confidence.</span>
                </li>
              </ul>
            </div>

            {/* DiffBeacon */}
            <div className="p-6 space-y-4 bg-teal-950/10">
              <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>DiffBeacon Behavioral Impact Platform</span>
              </div>
              <ul className="space-y-2.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Answers concrete developer scenarios (*"What happens if input X is missing?"*).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Zero fabricated citations; audited against snapshot AST symbol tables.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Visual field-level schema diffing with breaking vs compatible distinction.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Explicit Unknowns Register cataloging dynamic boundaries and reflection.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
