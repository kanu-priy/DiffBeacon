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
  Code2,
  GitCommit,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPrIndex, setSelectedPrIndex] = useState(0);

  const samplePullRequests = [
    {
      id: 'pr-102',
      title: 'Make department_id optional with default fallback',
      branch: 'feature/optional-dept',
      symbol: 'EmployeeCreateSerializer',
      file: 'serializers.py:12',
      nature: 'Behavioral Fork',
      status: 'Compatible',
      question: 'What happens if a request omits department_id now?',
      baseBehavior: 'Returns HTTP 400 Bad Request ("department_id is required").',
      headBehavior: 'Passes validation; downstream service assigns fallback Department #1.',
      divergence: 'Step 2: Base raises DRF ValidationError; Head routes to assign_default_department.',
      contract: 'DRF Serializer: department_id changed from required=True to required=False.',
      test: 'POST /api/v1/employees/ with {"name": "Alex", "salary": 50000}',
    },
    {
      id: 'pr-103',
      title: 'Raise minimum employee salary floor from $30k to $45k',
      branch: 'feature/salary-bounds',
      symbol: 'EmployeeCreateView',
      file: 'views.py:15',
      nature: 'Validation Tightening',
      status: 'Breaking',
      question: 'How does salary validation behave for $40,000 compensation?',
      baseBehavior: 'Validates successfully and persists record in Employee table.',
      headBehavior: 'Fails with HTTP 400 ValidationError ("Minimum salary threshold is $45,000").',
      divergence: 'Step 3: Base executes model.save(); Head rejects compensation bounds.',
      contract: 'API Endpoint: POST /api/v1/employees/ rejects previously accepted payloads.',
      test: 'POST /api/v1/employees/ with {"salary": 40000}',
    },
    {
      id: 'pr-104',
      title: 'Update payroll statutory tax withholding from 15% to 20%',
      branch: 'feature/payroll-tax',
      symbol: 'PayrollService.calculate_payroll',
      file: 'services/payroll.py:18',
      nature: 'Calculation Shift',
      status: 'Compatible',
      question: 'What net payout is generated for $50,000 gross salary?',
      baseBehavior: 'Deducts 15% tax ($7,500) yielding $42,500 net compensation.',
      headBehavior: 'Deducts 20% tax ($10,000) yielding $40,000 net compensation.',
      divergence: 'Step 4: Output formula changed from gross * 0.85 to gross * 0.80.',
      contract: 'Service Contract: Internal calculation difference affecting payslip reports.',
      test: 'calculate_payroll(employee_id=1, gross_salary=50000)',
    },
  ];

  const currentPr = samplePullRequests[selectedPrIndex];

  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Deterministic Code-Change Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Understand how backend changes behave <span className="text-blue-400">before merging</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          DiffBeacon analyzes abstract syntax trees, API contracts, and dependency graphs between Git snapshots. Trace behavioral forks, detect breaking contracts, and verify execution paths with zero fabricated citations.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/demo')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore BeaconWorks API Demo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileCode2 className="w-4 h-4 text-slate-400" />
            <span>Workspace Dashboard</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="pt-4 flex items-center justify-center gap-5 text-xs text-slate-400 flex-wrap font-mono">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>Python AST Symbol Table</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>DRF & Model Contract Mapping</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>Isolated Sandbox Test Suite</span>
          </span>
        </div>
      </section>

      {/* Interactive PR Impact Explorer (Live Interactive Demo in Hero) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-xl border border-slate-800 bg-[#0e1320] shadow-2xl overflow-hidden">
          {/* PR Selector Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">Interactive Change Story Showcase:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {samplePullRequests.map((pr, idx) => (
                <button
                  key={pr.id}
                  onClick={() => setSelectedPrIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                    selectedPrIndex === idx
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {pr.id.toUpperCase()}: {pr.symbol.split('.').pop()}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Inspection Workspace */}
          <div className="p-6 space-y-6">
            {/* PR Meta Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentPr.title}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold rounded ${
                      currentPr.status === 'Breaking'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {currentPr.status}
                  </span>
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                  <span>Branch: {currentPr.branch}</span>
                  <span>•</span>
                  <span>Target: {currentPr.file}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/demo')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>View Full Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scenario Question */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
              <Split className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-slate-400 font-mono block text-[11px] mb-0.5">Developer Scenario Query:</span>
                <span className="text-slate-200 font-medium">"{currentPr.question}"</span>
              </div>
            </div>

            {/* Side-by-Side Execution Trace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* Base Trace */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800/80">
                  <span className="font-bold text-slate-300 uppercase">Base Snapshot (v1.0)</span>
                  <span className="text-[10px] text-slate-500">main baseline</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  {currentPr.baseBehavior}
                </p>
              </div>

              {/* Head Trace */}
              <div className="p-4 rounded-lg bg-slate-950 border border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-blue-400 pb-2 border-b border-slate-800/80">
                  <span className="font-bold text-blue-300 uppercase">Head Snapshot (v1.1)</span>
                  <span className="text-[10px] text-blue-400/80">pull request changes</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans text-xs">
                  {currentPr.headBehavior}
                </p>
              </div>
            </div>

            {/* Behavioral Divergence Fork */}
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 font-sans flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-amber-200">Execution Divergence Point:</span>
                <span>{currentPr.divergence}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 6 Core Engineering Pillars */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Comprehensive Behavioral Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            DiffBeacon structures every code comparison into six verified facets so engineers can review with complete clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-[11px] font-bold">
              <Layers className="w-4 h-4" />
              <span>BEHAVIORAL DELTAS</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Observable Behavior Ledger</h3>
            <p className="text-slate-400 leading-relaxed">
              Examines meaningful behavior shifts (modified validation boundaries, tax calculation changes, error status codes) rather than added lines.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-mono text-[11px] font-bold">
              <Cpu className="w-4 h-4" />
              <span>CONTRACT SURFACE MAP</span>
            </div>
            <h3 className="text-sm font-semibold text-white">API & Model Schema Diffs</h3>
            <p className="text-slate-400 leading-relaxed">
              Audits DRF serializers, URL route definitions, and database constraints. Distinguishes harmless extensions from breaking interface regressions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-[11px] font-bold">
              <Network className="w-4 h-4" />
              <span>IMPACT EXPLORER</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Dependency Blast Radius</h3>
            <p className="text-slate-400 leading-relaxed">
              Interactive topological graph connecting modified symbols to callers, serializers, models, and test suites with verified line citations.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-violet-400 font-mono text-[11px] font-bold">
              <Split className="w-4 h-4" />
              <span>SCENARIO STUDIO</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Execution Path Simulation</h3>
            <p className="text-slate-400 leading-relaxed">
              Query specific runtime hypotheses (*"What if input X is omitted?"*) and step through synchronized Base vs. Head execution paths.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>VERIFICATION MATRIX</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Automated Sandbox Runner</h3>
            <p className="text-slate-400 leading-relaxed">
              Derived test recommendations with preconditions, inputs, and expected outcomes. Execute tests directly in an isolated sandbox runner.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>ANALYSIS BOUNDARIES</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Explicit Unknowns Register</h3>
            <p className="text-slate-400 leading-relaxed">
              Surfaces dynamic dispatches, missing runtime configuration, and database row assumptions that require runtime testing.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center py-6">
        <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Ready to inspect your first code change?
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Test the pre-seeded BeaconWorks Django REST API analysis or upload your own Git snapshots.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/demo')}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs cursor-pointer transition-colors"
            >
              Open BeaconWorks Demo
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
