import React from 'react';
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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-violet-500/10 to-teal-500/10 blur-[100px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/60 text-cyan-400 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>AI-Assisted Code-Change Understanding & Impact Analysis</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          See what a code change <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">touches</span> before you ship.
        </h1>

        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          DiffBeacon delivers an evidence-backed explanation of how program behavior differs between two versions, which downstream systems are impacted, which scenarios require verification, and what static analysis acknowledges it cannot know.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/demo')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            <span>Launch Built-In Demo (BeaconWorks API)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileCode2 className="w-4 h-4 text-slate-400" />
            <span>Open Dashboard / Upload Snapshots</span>
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-4">
          <span>✓ 100% Free & Local</span>
          <span>•</span>
          <span>✓ No API Keys or Cloud Account Required</span>
          <span>•</span>
          <span>✓ Zero Hallucination Guarantee</span>
        </div>
      </section>

      {/* The Change Story Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="border border-slate-800 rounded-2xl bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-100">
              The Core Concept: The Change Story
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              DiffBeacon rejects generic code review summaries. Every analysis builds an evidence-backed Change Story answering six vital questions:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-2">01 / BEHAVIOR LEDGER</div>
              <h3 className="text-base font-semibold text-slate-200">What changed in behavior?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Meaningful behavior shifts (e.g. serializer field made optional, minimum salary raised) rather than just added and removed lines.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-teal-400 mb-2">02 / CONTRACT SURFACE</div>
              <h3 className="text-base font-semibold text-slate-200">Which interfaces shifted?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Compares API routes, DRF serializers, and database models. Distinguishes schema differences from demonstrated breaking changes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-violet-400 mb-2">03 / IMPACT EXPLORER</div>
              <h3 className="text-base font-semibold text-slate-200">What can reach this change?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Interactive typed dependency graph connecting changed symbols to routes, serializers, models, and tests with line provenance.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-amber-400 mb-2">04 / SCENARIO STUDIO</div>
              <h3 className="text-base font-semibold text-slate-200">Under which situations does it matter?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Query concrete conditions (*"What happens if request omits field X?"*) and inspect side-by-side Base vs Head execution traces.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-2">05 / VERIFICATION MATRIX</div>
              <h3 className="text-base font-semibold text-slate-200">What should you verify?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Concrete test cases with preconditions, inputs, and expected outcomes, distinguishing existing tests from suggested uncovered cases.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
              <div className="text-xs font-mono font-bold text-rose-400 mb-2">06 / UNKNOWNS REGISTER</div>
              <h3 className="text-base font-semibold text-slate-200">What cannot yet be established?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                First-class ledger of static analysis boundaries: dynamic dispatches, missing runtime configs, and external service contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Differentiator: Scenario Studio Highlight */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/50 border border-violet-700/60 text-violet-300 text-xs font-medium mb-4">
              <Split className="w-3.5 h-3.5 text-violet-400" />
              <span>Signature Experience</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-100">
              Change Scenario Studio
            </h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              General AI chatbots give vague conversational explanations of diffs. Scenario Studio begins with a developer's concrete question about runtime behavior.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-teal-950 text-teal-400 border border-teal-800 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-100">Deterministic Path Extraction:</span> Resolves AST candidate paths in Base and Head versions before invoking the AI model.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-teal-950 text-teal-400 border border-teal-800 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-100">Zero Fabricated Line Numbers:</span> Every step is audited against the snapshot AST; unsupported references are strictly downgraded or rejected.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-teal-950 text-teal-400 border border-teal-800 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-100">Explicit Epistemic Labels:</span> Clearly separates Statically Established facts, Framework Rules, Inferred predictions, and Unresolved unknowns.
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate('/demo')}
                className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Try an example scenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Card Preview */}
          <div className="border border-slate-800 rounded-xl bg-slate-950 p-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <span className="text-[11px] font-semibold text-cyan-400">SCENARIO STUDIO PREVIEW</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">BeaconWorks API</span>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200">
              <span className="text-slate-400 text-[11px] block mb-1">Developer Question:</span>
              <span className="text-cyan-300 font-medium">"What happens if a request omits department_id now?"</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>Base Path (v1.0)</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1.5">
                  <div>1. POST /employees/</div>
                  <div>2. Serializer validation: <span className="text-rose-400 font-bold">Fails (required=True)</span></div>
                  <div>3. Returns HTTP 400 Bad Request</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-900/40">
                <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>Head Path (v1.1)</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1.5">
                  <div>1. POST /employees/</div>
                  <div>2. Serializer validation: <span className="text-teal-400 font-bold">Passes (optional)</span></div>
                  <div>3. Service assigns fallback Dept #1</div>
                  <div>4. Returns HTTP 201 Created</div>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded bg-amber-950/20 border border-amber-900/30 text-[11px] text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>Uncertainty: Assumes department ID 1 exists in DB at runtime. Missing row raises Department.DoesNotExist.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
