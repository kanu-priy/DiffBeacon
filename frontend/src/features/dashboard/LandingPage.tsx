import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  ArrowRight,
  Split,
  AlertTriangle,
  FileCode2,
  Layers,
  Cpu,
  Network,
  CheckCircle2,
  Sparkles,
  Activity,
  Terminal,
  Copy,
  Check,
  Play,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Code2,
  Eye,
  Zap,
  ArrowUpRight,
  GitPullRequest,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { EpistemicBadge } from '../../components/EpistemicBadge';

interface InteractivePR {
  id: string;
  prNumber: number;
  branch: string;
  title: string;
  file: string;
  symbol: string;
  category: string;
  isBreaking: boolean;
  question: string;
  summary: string;
  steps: {
    number: number;
    title: string;
    file: string;
    line: string;
    baseBehavior: string;
    headBehavior: string;
    provenance: 'statically_established' | 'framework_rule' | 'inferred' | 'unresolved' | 'runtime_verified';
    codeSnippet: {
      base: string;
      head: string;
    };
  }[];
  graphNodes: {
    id: string;
    label: string;
    type: 'endpoint' | 'serializer' | 'service' | 'model' | 'test';
    status: 'modified' | 'affected' | 'unaffected';
  }[];
  terminalOutput: string[];
}

const INTERACTIVE_PRS: InteractivePR[] = [
  {
    id: 'pr-142',
    prNumber: 142,
    branch: 'feat/department-fallback',
    title: 'Make department_id optional with default fallback resolver',
    file: 'beaconworks/serializers.py',
    symbol: 'EmployeeCreateSerializer',
    category: 'API Contract',
    isBreaking: false,
    question: 'What happens if a mobile request omits department_id now?',
    summary: 'Payloads omitting department_id no longer return 400 Bad Request; downstream resolver automatically assigns the unassigned holding pool.',
    steps: [
      {
        number: 1,
        title: 'Payload Validation in Serializer',
        file: 'beaconworks/serializers.py',
        line: 'lines 18-24',
        baseBehavior: 'Validates department_id is present. If missing, raises ValidationError("department_id is required").',
        headBehavior: 'Marks department_id as required=False, allow_null=True. Validation succeeds without error.',
        provenance: 'statically_established',
        codeSnippet: {
          base: `class EmployeeCreateSerializer(serializers.ModelSerializer):\n    department_id = serializers.IntegerField(required=True)\n    email = serializers.EmailField()`,
          head: `class EmployeeCreateSerializer(serializers.ModelSerializer):\n    department_id = serializers.IntegerField(required=False, default=None)\n    email = serializers.EmailField()`,
        }
      },
      {
        number: 2,
        title: 'Service Fallback Resolution',
        file: 'beaconworks/services.py',
        line: 'lines 42-49',
        baseBehavior: 'Directly executes Department.objects.get(id=department_id). Throws DoesNotExist if invalid.',
        headBehavior: 'Checks if department_id is None. If None, queries Department.get_default_holding_pool() as fallback.',
        provenance: 'framework_rule',
        codeSnippet: {
          base: `def assign_department(emp, dept_id):\n    dept = Department.objects.get(id=dept_id)\n    emp.department = dept\n    emp.save()`,
          head: `def assign_department(emp, dept_id):\n    if not dept_id:\n        dept = Department.get_default_holding_pool()\n    else:\n        dept = Department.objects.get(id=dept_id)\n    emp.department = dept\n    emp.save()`,
        }
      },
      {
        number: 3,
        title: 'HTTP Response & Status Code',
        file: 'beaconworks/views.py',
        line: 'lines 76-82',
        baseBehavior: 'Returns HTTP 400 Bad Request if serializer.is_valid() was false.',
        headBehavior: 'Returns HTTP 201 Created with JSON response containing assigned department_id=1.',
        provenance: 'runtime_verified',
        codeSnippet: {
          base: `# HTTP 400 Bad Request\n{\n  "department_id": ["This field is required."]\n}`,
          head: `# HTTP 201 Created\n{\n  "id": 841,\n  "department_id": 1, // Auto-fallback pool\n  "status": "active"\n}`,
        }
      },
    ],
    graphNodes: [
      { id: 'ep', label: 'POST /api/v1/employees', type: 'endpoint', status: 'unaffected' },
      { id: 'ser', label: 'EmployeeCreateSerializer', type: 'serializer', status: 'modified' },
      { id: 'svc', label: 'assign_department()', type: 'service', status: 'modified' },
      { id: 'mod', label: 'Department Model', type: 'model', status: 'affected' },
      { id: 'tst', label: 'test_create_without_dept', type: 'test', status: 'affected' },
    ],
    terminalOutput: [
      '$ diffbeacon verify --analysis=pr-142 --sandbox',
      '[DiffBeacon] Loading AST snapshot tree: base=v1.2 head=feat/dept-fallback',
      '[DiffBeacon] Analyzing symbol: EmployeeCreateSerializer (serializers.py)',
      '  ✓ Field `department_id`: required True -> False (Non-breaking additive)',
      '  ✓ Downstream caller identified: EmployeeCreateView.post()',
      '  ✓ Service fallback path detected: Department.get_default_holding_pool()',
      '[Pytest Sandbox] Running verification matrix for scenario #142...',
      '  tests/test_employees.py::test_missing_dept_returns_fallback PASSED [0.08s]',
      '  tests/test_employees.py::test_legacy_dept_payload_persists PASSED [0.06s]',
      '[Result] 2 tests verified. Contract: COMPATIBLE. Zero breaking changes.',
    ]
  },
  {
    id: 'pr-189',
    prNumber: 189,
    branch: 'fix/salary-compensation-floor',
    title: 'Raise minimum employee salary threshold from $30k to $45k',
    file: 'beaconworks/views.py',
    symbol: 'EmployeeCreateView',
    category: 'Validation Rule',
    isBreaking: true,
    question: 'How does salary validation behave for $40,000 compensation offers?',
    summary: 'Breaking validation delta: Payloads offering between $30,000 and $44,999 that previously succeeded now trigger HTTP 400 validation rejections.',
    steps: [
      {
        number: 1,
        title: 'Salary Floor Bound Check',
        file: 'beaconworks/views.py',
        line: 'lines 88-94',
        baseBehavior: 'Validates salary >= 30,000. $40k offer passes validation cleanly.',
        headBehavior: 'Validates salary >= 45,000. $40k offer fails and throws ValidationError.',
        provenance: 'statically_established',
        codeSnippet: {
          base: `MIN_SALARY = 30000\nif salary < MIN_SALARY:\n    raise ValidationError("Salary must be at least $30k")`,
          head: `MIN_SALARY = 45000\nif salary < MIN_SALARY:\n    raise ValidationError("Salary below company compensation floor ($45k)")`,
        }
      },
      {
        number: 2,
        title: 'Payroll Pre-registration Invariant',
        file: 'beaconworks/services.py',
        line: 'lines 112-118',
        baseBehavior: 'Registers new hire with Tier-1 baseline benefits.',
        headBehavior: 'Execution aborted before service invocation. No payroll record created.',
        provenance: 'framework_rule',
        codeSnippet: {
          base: `def register_payroll(emp, salary):\n    # Persists salary tier\n    TierRegistry.create(emp=emp, amount=salary)`,
          head: `# Skipped on validation rejection\n# Endpoint terminates early with HTTP 400`,
        }
      },
      {
        number: 3,
        title: 'Observable API Response',
        file: 'beaconworks/views.py',
        line: 'lines 98-102',
        baseBehavior: 'Returns HTTP 201 Created with employee ID.',
        headBehavior: 'Returns HTTP 400 Bad Request with error detail "Salary below company compensation floor".',
        provenance: 'runtime_verified',
        codeSnippet: {
          base: `# HTTP 201 Created\n{\n  "id": 842,\n  "salary": 40000,\n  "tier": "STANDARD"\n}`,
          head: `# HTTP 400 Bad Request\n{\n  "error": "Salary below company compensation floor ($45k)"\n}`,
        }
      },
    ],
    graphNodes: [
      { id: 'ep', label: 'POST /api/v1/employees', type: 'endpoint', status: 'affected' },
      { id: 'view', label: 'EmployeeCreateView', type: 'serializer', status: 'modified' },
      { id: 'pay', label: 'register_payroll()', type: 'service', status: 'affected' },
      { id: 'mod', label: 'TierRegistry Model', type: 'model', status: 'unaffected' },
      { id: 'tst', label: 'test_salary_floor_rejection', type: 'test', status: 'modified' },
    ],
    terminalOutput: [
      '$ diffbeacon verify --analysis=pr-189 --sandbox',
      '[DiffBeacon] Analyzing boundary condition: salary=$40,000',
      '[Contract Matrix] WARNING: Constraint tightened (30,000 -> 45,000)',
      '  ⚠️  BREAKING CHANGE: Previously accepted payloads now rejected',
      '  ✓ Affected endpoints: 1 (POST /api/v1/employees)',
      '  ✓ Affected tests: 2 legacy fixtures require update',
      '[Pytest Sandbox] Running regression assertions...',
      '  tests/test_salary.py::test_40k_offer_rejected PASSED [0.05s]',
      '  tests/test_salary.py::test_50k_offer_accepted PASSED [0.04s]',
      '[Result] 2 tests verified. Contract: BREAKING DELTA CONFIRMED.',
    ]
  },
  {
    id: 'pr-205',
    prNumber: 205,
    branch: 'refactor/async-audit-pipeline',
    title: 'Migrate synchronous audit logging to async event broker',
    file: 'beaconworks/services.py',
    symbol: 'dispatch_audit_event',
    category: 'Pipeline Architecture',
    isBreaking: false,
    question: 'Are audit trails guaranteed to be persisted synchronously before response dispatch?',
    summary: 'Observable timing delta: Audit logs are now offloaded to background Celery workers. The HTTP request latency drops by 45ms, but log entries appear with eventual consistency.',
    steps: [
      {
        number: 1,
        title: 'Event Dispatch Mechanism',
        file: 'beaconworks/services.py',
        line: 'lines 54-61',
        baseBehavior: 'Calls AuditLog.objects.create() inside the HTTP request transaction block.',
        headBehavior: 'Dispatches task via celery_app.send_task("audit.record_event"). Returns immediately.',
        provenance: 'statically_established',
        codeSnippet: {
          base: `def record_audit(event_type, payload):\n    # Synchronous DB write\n    return AuditLog.objects.create(type=event_type, data=payload)`,
          head: `def record_audit(event_type, payload):\n    # Asynchronous broker dispatch\n    return record_event_task.delay(event_type, payload)`,
        }
      },
      {
        number: 2,
        title: 'Eventual Consistency Window',
        file: 'beaconworks/tasks.py',
        line: 'lines 15-22',
        baseBehavior: 'Instantaneous queryability in subsequent request.',
        headBehavior: 'Log record is available ~20-60ms later depending on worker queue lag.',
        provenance: 'inferred',
        codeSnippet: {
          base: `# Immediate persistence:\nassert AuditLog.objects.filter(type=event_type).exists() == True`,
          head: `# Eventual consistency:\n# Immediate subsequent SELECT might return 0 rows for ~30ms`,
        }
      },
    ],
    graphNodes: [
      { id: 'ep', label: 'POST /api/v1/audit', type: 'endpoint', status: 'unaffected' },
      { id: 'svc', label: 'dispatch_audit_event()', type: 'service', status: 'modified' },
      { id: 'tsk', label: 'record_event_task (Celery)', type: 'service', status: 'modified' },
      { id: 'mod', label: 'AuditLog Model', type: 'model', status: 'affected' },
      { id: 'tst', label: 'test_async_audit_dispatch', type: 'test', status: 'affected' },
    ],
    terminalOutput: [
      '$ diffbeacon verify --analysis=pr-205 --sandbox',
      '[DiffBeacon] Analyzing execution path: record_audit()',
      '  ✓ Synchronous DB call removed from request lifecycle',
      '  ✓ Asynchronous queue call introduced: celery.send_task',
      '  ℹ Epistemic note: Eventual consistency boundary detected (Inferred)',
      '[Pytest Sandbox] Running async worker harness...',
      '  tests/test_audit.py::test_celery_task_queued PASSED [0.07s]',
      '  tests/test_audit.py::test_worker_consumes_payload PASSED [0.11s]',
      '[Result] 2 tests verified. Contract: COMPATIBLE (Performance positive).',
    ]
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPrIndex, setSelectedPrIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'scenario' | 'diff' | 'graph' | 'terminal'>('scenario');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [isPlayingTrace, setIsPlayingTrace] = useState(false);

  const currentPr = INTERACTIVE_PRS[selectedPrIndex];
  const currentStep = currentPr.steps[activeStepIndex] || currentPr.steps[0];

  // Auto-play trace stepping when user clicks "Play Trace"
  useEffect(() => {
    let timer: any;
    if (isPlayingTrace) {
      timer = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= currentPr.steps.length - 1) {
            setIsPlayingTrace(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isPlayingTrace, currentPr.steps.length]);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('pip install diffbeacon');
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const { data: demoStatus } = useQuery({
    queryKey: ['demo-status'],
    queryFn: api.getDemoStatus,
  });

  return (
    <div className="relative overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Background Architectural Grid */}
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[56rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-12 text-center space-y-8">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121622] border border-[#222a3d] text-slate-300 text-xs font-mono shadow-sm">
          <span className="live-dot" />
          <span className="text-indigo-400 font-semibold">DiffBeacon v1.4</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Deterministic AST Blast-Radius Engine</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            Know the behavioral{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-200">
              blast radius
            </span>{' '}
            before you merge.
          </h1>
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            DiffBeacon maps how code changes alter backend runtime contracts, downstream functions, and API behavior.
            Anchored in deterministic AST analysis — zero AI hallucinations.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/demo')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Launch Live Demo Workspace
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#242c3f] text-slate-200 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            View Workspaces
          </button>

          {/* Quick install pill */}
          <button
            onClick={handleCopyInstall}
            className="w-full sm:w-auto px-4 py-3 rounded-lg bg-[#0e111a] hover:bg-[#131722] border border-[#1e2436] text-xs font-mono text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span className="text-indigo-400">$</span>
            <span>pip install diffbeacon</span>
            {copiedInstall ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 ml-1" />
            )}
          </button>
        </div>

        {/* Metrics Guarantee Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
          {[
            { label: 'Zero Hallucinations', value: '100% AST Grounded', sub: 'Every claim links to exact lines' },
            { label: 'Contract Invariants', value: 'DRF & OpenAPI Native', sub: 'Automatic schema diff analysis' },
            { label: 'Epistemic Certainty', value: 'Explicit Labels', sub: 'Distinguishes static facts vs inference' },
            { label: 'Local Verification', value: 'Reproducible Sandbox', sub: 'Executes isolated test matrices' },
          ].map((item) => (
            <div key={item.label} className="surface-card p-3.5 text-left border-[#1a2030]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">{item.label}</div>
              <div className="text-sm font-semibold text-white mt-1">{item.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SIGNATURE INTERACTIVE CHANGE PLAYGROUND */}
      <section className="relative max-w-6xl mx-auto px-4 pb-20">
        <div className="surface-card border-[#232b3e] overflow-hidden shadow-2xl">
          {/* PR Selector Header Bar */}
          <div className="p-4 border-b border-[#1f2638] bg-[#0c0f17] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <GitPullRequest className="w-4 h-4 text-indigo-400" />
                <span className="text-white font-semibold">Interactive Code Change Simulator</span>
                <span className="text-slate-500">·</span>
                <span>Select a sample Pull Request to test:</span>
              </div>
            </div>

            {/* 3 Interactive PR Switchers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {INTERACTIVE_PRS.map((pr, idx) => (
                <button
                  key={pr.id}
                  onClick={() => {
                    setSelectedPrIndex(idx);
                    setActiveStepIndex(0);
                    setIsPlayingTrace(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    selectedPrIndex === idx
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-[#131722] hover:bg-[#1a2030] text-slate-300 border border-[#21283a]'
                  }`}
                >
                  <span className="text-indigo-200">#{pr.prNumber}</span>
                  <span className="truncate max-w-[140px] sm:max-w-none">{pr.symbol}</span>
                  {pr.isBreaking ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800/60 font-mono">
                      Breaking
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                      Safe
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PR Summary Bar */}
          <div className="px-6 py-4 bg-[#0e121c] border-b border-[#1b2130] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-400 font-semibold">{currentPr.branch}</span>
                <span className="text-slate-600">/</span>
                <span className="text-xs text-slate-400 font-mono">{currentPr.file}</span>
              </div>
              <h2 className="text-base font-semibold text-white mt-1">{currentPr.title}</h2>
            </div>

            <button
              onClick={() => navigate('/demo')}
              className="px-3.5 py-1.5 rounded-lg bg-[#181e2b] hover:bg-[#202738] border border-[#2b354b] text-xs font-medium text-slate-200 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <span>Open in Full Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>

          {/* Interactive Mode Navigation Tabs */}
          <div className="px-6 pt-3 border-b border-[#1b2130] bg-[#0c0f17] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1">
              {[
                { id: 'scenario', label: 'Scenario Walkthrough', icon: Split, desc: 'Step-by-step trace' },
                { id: 'diff', label: 'AST Unified Diff', icon: Code2, desc: 'Syntax highlighted' },
                { id: 'graph', label: 'Blast Radius Graph', icon: Network, desc: 'Connected callers' },
                { id: 'terminal', label: 'Sandbox Terminal', icon: Terminal, desc: 'CLI execution' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-white bg-[#121622]'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0f131d]'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === 'scenario' && (
              <button
                onClick={() => setIsPlayingTrace(!isPlayingTrace)}
                className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPlayingTrace
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/50'
                }`}
              >
                {isPlayingTrace ? (
                  <>
                    <RotateCcw className="w-3 h-3 animate-spin" />
                    <span>Pause Playback</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                    <span>Play Trace Sequence</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* TAB 1: SCENARIO WALKTHROUGH */}
          {activeTab === 'scenario' && (
            <div className="p-6 space-y-6 bg-[#0a0d14]">
              {/* Question Banner */}
              <div className="p-4 rounded-xl bg-[#121622] border border-[#232c3f] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 shrink-0">
                  <Split className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                    Developer Behavioral Hypothesis
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">"{currentPr.question}"</div>
                  <div className="text-xs text-slate-400 mt-1">{currentPr.summary}</div>
                </div>
              </div>

              {/* Step Navigation Pill Stepper */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Execution Trace Steps (Click to inspect):</span>
                  <span className="text-indigo-400 font-semibold">
                    Step {activeStepIndex + 1} of {currentPr.steps.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentPr.steps.map((st, idx) => (
                    <button
                      key={st.number}
                      onClick={() => {
                        setActiveStepIndex(idx);
                        setIsPlayingTrace(false);
                      }}
                      className={`p-3 rounded-lg text-left transition-all cursor-pointer border ${
                        activeStepIndex === idx
                          ? 'bg-[#161c2b] border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                          : 'bg-[#0f121a] hover:bg-[#141824] border-[#1d2334] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className={activeStepIndex === idx ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                          Step 0{st.number}
                        </span>
                        <EpistemicBadge provenance={st.provenance} />
                      </div>
                      <div className="text-xs font-semibold text-white mt-1 truncate">{st.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{st.file}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Inspection Card: Before vs After & Code Highlighting */}
              <div className="surface-card p-5 border-[#21283a] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2130] pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>Step {currentStep.number}: {currentStep.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {currentStep.file} · {currentStep.line}
                    </p>
                  </div>
                  <EpistemicBadge provenance={currentStep.provenance} />
                </div>

                {/* Behavioral Delta Narrative */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/30">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Base Version Behavior</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{currentStep.baseBehavior}</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-indigo-950/25 border border-indigo-800/40">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>Head (Changed) Behavior</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{currentStep.headBehavior}</p>
                  </div>
                </div>

                {/* Code Snippet Comparison */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono text-slate-400">AST Source Diff Excerpt:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-[#07090e] border border-[#1b202e] text-slate-300 overflow-x-auto">
                      <div className="text-[10px] text-rose-400 mb-1 border-b border-[#1b202e] pb-1">Base Source (v1.2)</div>
                      <pre className="text-xs leading-relaxed">{currentStep.codeSnippet.base}</pre>
                    </div>
                    <div className="p-3 rounded-lg bg-[#07090e] border border-[#1b202e] text-slate-200 overflow-x-auto">
                      <div className="text-[10px] text-indigo-400 mb-1 border-b border-[#1b202e] pb-1">Head Source ({currentPr.branch})</div>
                      <pre className="text-xs leading-relaxed">{currentStep.codeSnippet.head}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNIFIED AST DIFF */}
          {activeTab === 'diff' && (
            <div className="p-6 bg-[#0a0d14] space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>AST Symbol: <strong className="text-white font-mono">{currentPr.symbol}</strong> ({currentPr.file})</span>
                <span className="text-[11px] font-mono text-emerald-400">Deterministic AST Tree Checked</span>
              </div>
              <div className="surface-card border-[#21283a] overflow-hidden font-mono text-xs">
                <div className="bg-[#121622] px-4 py-2 border-b border-[#1b2130] flex items-center justify-between text-slate-400 text-[11px]">
                  <span>{currentPr.file}</span>
                  <span>Unified AST View</span>
                </div>
                <div className="p-4 bg-[#07080d] space-y-1 text-slate-300 overflow-x-auto leading-relaxed">
                  <div className="text-slate-500">@@ -15,12 +15,14 @@ import serializers, models, services</div>
                  <div className="text-slate-400">  class {currentPr.symbol}(serializers.ModelSerializer):</div>
                  <div className="text-slate-400">      email = serializers.EmailField()</div>
                  <div className="bg-rose-950/30 text-rose-300 px-2 py-0.5 rounded -mx-2">
                    -     department_id = serializers.IntegerField(required=True)
                  </div>
                  <div className="bg-emerald-950/30 text-emerald-300 px-2 py-0.5 rounded -mx-2">
                    +     department_id = serializers.IntegerField(required=False, default=None)
                  </div>
                  <div className="text-slate-400">  </div>
                  <div className="text-slate-400">      def validate(self, attrs):</div>
                  <div className="bg-rose-950/30 text-rose-300 px-2 py-0.5 rounded -mx-2">
                    -         if not attrs.get('department_id'): raise ValidationError("Missing dept")
                  </div>
                  <div className="bg-emerald-950/30 text-emerald-300 px-2 py-0.5 rounded -mx-2">
                    +         # Downstream resolver will fallback to default holding pool
                  </div>
                  <div className="text-slate-400">          return attrs</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BLAST RADIUS DEPENDENCY GRAPH */}
          {activeTab === 'graph' && (
            <div className="p-6 bg-[#0a0d14] space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Blast Radius Call Tree: Symbols connected to this change</span>
                <span className="text-indigo-400 font-mono text-[11px]">5 Connected Nodes</span>
              </div>
              <div className="surface-card p-6 border-[#21283a] bg-[#0c0f18] min-h-[260px] flex items-center justify-center">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {currentPr.graphNodes.map((node, idx) => (
                    <React.Fragment key={node.id}>
                      <div
                        className={`p-3.5 rounded-xl border text-center font-mono text-xs transition-all ${
                          node.status === 'modified'
                            ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                            : node.status === 'affected'
                            ? 'bg-[#141926] border-amber-500/50 text-amber-200'
                            : 'bg-[#10131d] border-[#1d2436] text-slate-400'
                        }`}
                      >
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">{node.type}</div>
                        <div className="font-semibold mt-1">{node.label}</div>
                        <div className="text-[9px] mt-1 font-mono uppercase">
                          {node.status === 'modified' && '★ Modified Symbol'}
                          {node.status === 'affected' && '⚠ Downstream Affected'}
                          {node.status === 'unaffected' && '✓ Unchanged'}
                        </div>
                      </div>
                      {idx < currentPr.graphNodes.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 hidden sm:block" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SANDBOX CLI TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="p-6 bg-[#0a0d14] space-y-3">
              <div className="surface-card border-[#222a3d] bg-[#07080d] overflow-hidden font-mono text-xs shadow-xl">
                <div className="bg-[#10141f] px-4 py-2 border-b border-[#1b2130] flex items-center justify-between text-slate-400 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-300 font-semibold">diffbeacon-sandbox-runner</span>
                  </div>
                  <span className="text-emerald-400">Exit Code: 0</span>
                </div>
                <div className="p-4 space-y-1.5 text-slate-300">
                  {currentPr.terminalOutput.map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith('$')
                          ? 'text-indigo-400 font-bold'
                          : line.includes('PASSED')
                          ? 'text-emerald-400'
                          : line.includes('BREAKING')
                          ? 'text-rose-400 font-bold'
                          : line.includes('WARNING')
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WHY DIFFBEACON: COMPARISON MATRIX */}
      <section className="relative max-w-6xl mx-auto px-4 pb-24 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Architectural Differentiation
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why DiffBeacon is not another AI reviewer</h2>
          <p className="text-sm text-slate-400">
            Generic LLMs hallucinate dependencies and produce superficial line summaries. DiffBeacon builds an evidence-anchored ledger of behavioral deltas.
          </p>
        </div>

        <div className="surface-card border-[#222a3d] overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1f2638] bg-[#0c0f18] text-slate-400">
                <th className="p-4 font-semibold">Capability / Standard</th>
                <th className="p-4 text-slate-400">Manual PR Review</th>
                <th className="p-4 text-slate-400">Generic AI Code Reviewer</th>
                <th className="p-4 text-indigo-400 font-bold bg-indigo-950/30">DiffBeacon Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171c28] text-slate-300">
              {[
                {
                  cap: 'Deterministic AST Analysis',
                  manual: 'Mental compilation',
                  ai: 'Statistical token prediction',
                  beacon: '100% Tree-sitter & AST verified',
                },
                {
                  cap: 'Citation Provenance',
                  manual: 'None',
                  ai: 'Hallucinates files & line numbers',
                  beacon: 'Zero fabricated citations',
                },
                {
                  cap: 'Epistemic Truth Labels',
                  manual: 'Unstated assumptions',
                  ai: 'False confidence on all claims',
                  beacon: 'Explicit (Fact vs Inferred vs Unknown)',
                },
                {
                  cap: 'Contract Surface Diffing',
                  manual: 'Manual checklist review',
                  ai: 'Generic markdown summary',
                  beacon: 'Automated OpenAPI & DRF schema diffs',
                },
                {
                  cap: 'Downstream Blast Radius',
                  manual: 'Blindspot risk',
                  ai: 'No whole-graph indexing',
                  beacon: 'Multi-layer caller-graph traversal',
                },
                {
                  cap: 'Sandbox Test Verification',
                  manual: 'Wait for CI suite',
                  ai: 'Cannot run code',
                  beacon: 'Local reproducible test execution',
                },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#111522] transition-colors">
                  <td className="p-4 font-medium text-white">{row.cap}</td>
                  <td className="p-4 text-slate-400">{row.manual}</td>
                  <td className="p-4 text-rose-300/80">{row.ai}</td>
                  <td className="p-4 text-indigo-300 font-semibold bg-indigo-950/20">{row.beacon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SIX CORE PILLARS */}
      <section className="relative max-w-6xl mx-auto px-4 pb-24 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Comprehensive Investigation Surfaces
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Six coordinated views into every change</h2>
          <p className="text-sm text-slate-400">
            Every screen connects directly to the AST analysis snapshot. No disconnected mockups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Layers,
              title: 'Behavior Delta Ledger',
              copy: 'Observable deltas anchored in exact source references, distinguishing compatible extensions from breaking changes.',
              tag: 'Core Ledger',
            },
            {
              icon: Cpu,
              title: 'Contract Surface Map',
              copy: 'Diffs serializer fields, HTTP request parameters, and model definitions before downstream consumers fail in production.',
              tag: 'Schema Invariants',
            },
            {
              icon: Network,
              title: 'Blast Radius Explorer',
              copy: 'Interactive graph traversing imported symbols, views, services, and tests that touch the modified code path.',
              tag: 'Dependency Graph',
            },
            {
              icon: Split,
              title: 'Change Scenario Studio',
              copy: 'Ask concrete hypotheses ("What happens if this param is null?") and walk old vs new paths step-by-step.',
              tag: 'Signature Experience',
            },
            {
              icon: CheckCircle2,
              title: 'Verification Matrix',
              copy: 'Generates and runs isolated pytest assertions against the head snapshot, persisting runtime results with timestamped proof.',
              tag: 'Pytest Sandbox',
            },
            {
              icon: HelpCircle,
              title: 'Unknowns Register',
              copy: 'Explicitly flags dynamic method dispatch, unanalyzable reflection, and runtime blindspots that require manual review.',
              tag: 'Epistemic Safety',
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="surface-card p-5 surface-card-hover border-[#1f2638] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">
                    <pillar.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 bg-[#121622] px-2 py-0.5 rounded border border-[#1d2334]">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{pillar.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{pillar.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL PRODUCTION CTA */}
      <section className="relative max-w-4xl mx-auto px-4 pb-24 text-center">
        <div className="surface-card p-8 sm:p-12 border-[#2b354b] bg-gradient-to-b from-[#121624] to-[#0c0e15] shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for Production Engineering Teams</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Stop guessing the consequences of pull requests.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Deploy DiffBeacon locally, run it in CI pipelines via GitHub Actions, or explore the live seeded BeaconWorks analysis right now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/demo')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Live Seeded Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#242c3f] text-slate-200 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Browse Analysis Snapshots</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
