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
  ChevronDown,
  ChevronUp,
  Workflow,
  Radio,
  Flame,
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

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
    <div className="relative overflow-hidden selection:bg-cyan-500/30 selection:text-white">
      {/* Background Architectural Grid with Radiant Glow */}
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[64rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px] animate-pulse-glow" />
      <div className="pointer-events-none absolute top-96 -left-20 h-[30rem] w-[30rem] rounded-full bg-violet-600/15 blur-[130px]" />
      <div className="pointer-events-none absolute top-[50rem] -right-20 h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[130px]" />

      {/* HERO SECTION */}
      <section className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 text-center space-y-8 animate-fade-up">
        {/* Release Pill with Radar Scan Effect */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#08122c]/90 border border-cyan-500/40 text-slate-200 text-xs font-mono shadow-[0_0_24px_-4px_rgba(6,182,212,0.4)] backdrop-blur-md">
          <span className="live-dot" />
          <span className="text-cyan-300 font-bold tracking-tight">DiffBeacon v1.4</span>
          <span className="text-cyan-500/50">|</span>
          <span className="text-slate-200 font-medium">Deterministic Behavioral Blast Radius Engine</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 ml-1" />
        </div>

        {/* Main Headline */}
        <div className="space-y-5 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.06]">
            Your diff shows what changed.{' '}
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(6,182,212,0.3)]">
              Understand what it means.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans">
            Trace code changes into observable runtime contracts, dependency blast radiuses, and verification scenarios — with source evidence behind every conclusion.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
          <button
            onClick={() => navigate('/demo')}
            className="btn-primary-radiant w-full sm:w-auto"
          >
            <Compass className="w-4 h-4 text-slate-950 animate-spin-slow" />
            <span>Launch Live Demo Workspace</span>
            <ArrowRight className="w-4 h-4 ml-0.5 text-slate-950" />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary-radiant w-full sm:w-auto"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Explore Workspaces</span>
          </button>

          {/* Quick install pill */}
          <button
            onClick={handleCopyInstall}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#091129] hover:bg-[#0f1b40] border border-cyan-500/30 hover:border-cyan-400/60 text-xs font-mono text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer group shadow-sm"
          >
            <span className="text-cyan-400 font-bold">$</span>
            <span>pip install diffbeacon</span>
            {copiedInstall ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 ml-1 transition-colors" />
            )}
          </button>
        </div>

        {/* Metrics Guarantee Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-6">
          {[
            { label: 'Zero Hallucinations', value: '100% AST Grounded', sub: 'Every claim links to exact line numbers', border: 'border-cyan-500/30' },
            { label: 'Contract Invariants', value: 'DRF & OpenAPI Native', sub: 'Automated schema diff classification', border: 'border-violet-500/30' },
            { label: 'Epistemic Truth', value: 'Explicit Labels', sub: 'Statically established vs inferred vs unknown', border: 'border-emerald-500/30' },
            { label: 'Sandbox Execution', value: 'Reproducible Proof', sub: 'Runs isolated pytest matrix harnesses', border: 'border-cyan-500/30' },
          ].map((item) => (
            <div key={item.label} className={`surface-card p-4 text-left ${item.border} surface-card-hover`}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">{item.label}</div>
              <div className="text-sm sm:text-base font-bold text-white mt-1">{item.value}</div>
              <div className="text-[11px] text-slate-300 mt-1 leading-snug">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Multi-Language Capability Preview Bar */}
        <div className="max-w-4xl mx-auto p-3.5 rounded-2xl bg-[#081028]/90 border border-cyan-500/30 shadow-[0_4px_24px_-4px_rgba(6,182,212,0.2)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-slate-300 font-mono text-[11px] flex-wrap justify-center sm:justify-start">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>26 Languages Supported:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['Python', 'TypeScript', 'Go', 'Rust', 'Java', 'C#', 'PHP', 'Ruby'].map((lang) => (
                <span key={lang} className="px-2 py-0.5 rounded-md bg-[#0e193d] text-cyan-200 border border-cyan-500/30 text-[11px]">
                  {lang}
                </span>
              ))}
              <span className="text-cyan-400/80 text-[11px] font-semibold">+ 18 more</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/languages')}
            className="text-xs text-cyan-300 hover:text-white font-mono font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer group"
          >
            <span>Explore Registry</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-cyan-400" />
          </button>
        </div>
      </section>

      {/* SIGNATURE INTERACTIVE CHANGE PLAYGROUND */}
      <section className="relative max-w-6xl mx-auto px-4 pb-24">
        <div className="surface-card border-cyan-500/30 overflow-hidden shadow-[0_16px_48px_-12px_rgba(6,182,212,0.3)] glow-border-top">
          {/* PR Selector Header Bar */}
          <div className="p-4 sm:p-5 border-b border-[#1c294e] bg-[#070e24] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <GitPullRequest className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-white font-bold tracking-tight">Interactive Pull Request Simulator</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">Select a real scenario to inspect:</span>
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    selectedPrIndex === idx
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold shadow-[0_0_20px_-3px_rgba(6,182,212,0.6)] border border-cyan-400'
                      : 'bg-[#0a122e] hover:bg-[#0f1b40] text-slate-300 border border-cyan-500/20'
                  }`}
                >
                  <span className="text-cyan-300 font-bold">#{pr.prNumber}</span>
                  <span className="truncate max-w-[140px] sm:max-w-none">{pr.symbol}</span>
                  {pr.isBreaking ? (
                    <span className="badge-rose text-[10px] py-0">
                      Breaking
                    </span>
                  ) : (
                    <span className="badge-emerald text-[10px] py-0">
                      Safe
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PR Summary Bar */}
          <div className="px-6 py-4 bg-[#091129] border-b border-[#1c294e] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold">{currentPr.branch}</span>
                <span className="text-slate-600">/</span>
                <span className="text-xs text-slate-300 font-mono">{currentPr.file}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight">{currentPr.title}</h2>
            </div>

            <button
              onClick={() => navigate('/demo')}
              className="px-4 py-2 rounded-xl bg-[#0e193d] hover:bg-[#132354] border border-cyan-500/40 text-xs font-semibold text-cyan-200 flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-sm group"
            >
              <span>Launch in Full Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Interactive Mode Navigation Tabs */}
          <div className="px-6 pt-3 border-b border-[#1c294e] bg-[#070e24] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'scenario', label: 'Scenario Walkthrough', icon: Split, desc: 'Step-by-step trace' },
                { id: 'diff', label: 'AST Unified Diff', icon: Code2, desc: 'Syntax highlighted' },
                { id: 'graph', label: 'Blast Radius Graph', icon: Network, desc: 'Connected callers' },
                { id: 'terminal', label: 'Sandbox Terminal', icon: Terminal, desc: 'CLI execution' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-300 bg-[#0c1638]'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#091129]'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === 'scenario' && (
              <button
                onClick={() => setIsPlayingTrace(!isPlayingTrace)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPlayingTrace
                    ? 'bg-rose-950 text-rose-300 border border-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isPlayingTrace ? (
                  <>
                    <RotateCcw className="w-3 h-3 animate-spin" />
                    <span>Pause Playback</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                    <span>Play Trace Sequence</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* TAB 1: SCENARIO WALKTHROUGH */}
          {activeTab === 'scenario' && (
            <div className="p-6 space-y-6 bg-[#070d1e]">
              {/* Question Banner */}
              <div className="p-4 rounded-xl bg-[#0c1535] border border-cyan-500/30 flex items-start gap-3.5 shadow-md">
                <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 shrink-0 shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)]">
                  <Split className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Developer Behavioral Hypothesis
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">"{currentPr.question}"</div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">{currentPr.summary}</div>
                </div>
              </div>

              {/* Step Navigation Pill Stepper */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Execution Trace Steps (Click to inspect):</span>
                  <span className="text-cyan-400 font-bold">
                    Step {activeStepIndex + 1} of {currentPr.steps.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {currentPr.steps.map((st, idx) => (
                    <button
                      key={st.number}
                      onClick={() => {
                        setActiveStepIndex(idx);
                        setIsPlayingTrace(false);
                      }}
                      className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                        activeStepIndex === idx
                          ? 'bg-[#101d44] border-cyan-400 shadow-[0_0_20px_-4px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/50'
                          : 'bg-[#0a122e] hover:bg-[#0e193d] border-[#1c294e] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className={activeStepIndex === idx ? 'text-cyan-300 font-extrabold' : 'text-slate-400'}>
                          Step 0{st.number}
                        </span>
                        <EpistemicBadge provenance={st.provenance} />
                      </div>
                      <div className="text-xs font-bold text-white mt-1.5 truncate">{st.title}</div>
                      <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5 truncate">{st.file}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Inspection Card: Before vs After & Code Highlighting */}
              <div className="surface-card p-5 border-cyan-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c294e] pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>Step {currentStep.number}: {currentStep.title}</span>
                    </h3>
                    <p className="text-xs text-cyan-300/80 font-mono mt-0.5">
                      {currentStep.file} · {currentStep.line}
                    </p>
                  </div>
                  <EpistemicBadge provenance={currentStep.provenance} />
                </div>

                {/* Behavioral Delta Narrative */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#091129] border border-slate-800 space-y-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>Base Baseline (v1.0)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentStep.baseBehavior}</p>
                    <pre className="p-3 rounded-lg bg-[#040817] border border-slate-800 font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre-wrap">
                      {currentStep.codeSnippet.base}
                    </pre>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0a1738] border border-cyan-500/40 space-y-2 shadow-[0_0_20px_-6px_rgba(6,182,212,0.3)]">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Head Behavior (Proposed Change)</span>
                    </div>
                    <p className="text-xs text-cyan-100 leading-relaxed font-sans font-medium">{currentStep.headBehavior}</p>
                    <pre className="p-3 rounded-lg bg-[#040817] border border-cyan-500/30 font-mono text-[11px] text-cyan-200 overflow-x-auto whitespace-pre-wrap">
                      {currentStep.codeSnippet.head}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AST UNIFIED DIFF */}
          {activeTab === 'diff' && (
            <div className="p-6 bg-[#070d1e] space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#0a1433] border border-cyan-500/30 flex items-center justify-between text-xs text-slate-300">
                <span className="text-white font-bold">{currentPr.file}</span>
                <span className="badge-cyan text-[10px]">Deterministic AST Hunk</span>
              </div>
              <div className="surface-card p-4 border-[#1c294e] bg-[#040817] divide-y divide-[#132042] overflow-x-auto">
                {currentPr.steps.map((st, i) => (
                  <div key={i} className="py-3 space-y-2">
                    <div className="text-[11px] text-cyan-400 font-bold">@@ {st.title} ({st.line}) @@</div>
                    <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-rose-300 whitespace-pre-wrap leading-relaxed">
                      - {st.codeSnippet.base}
                    </div>
                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 whitespace-pre-wrap leading-relaxed">
                      + {st.codeSnippet.head}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BLAST RADIUS GRAPH */}
          {activeTab === 'graph' && (
            <div className="p-6 bg-[#070d1e] space-y-4">
              <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Call-Graph Provenance (Affected Consumers):</span>
                <span className="badge-cyan text-[10px]">{currentPr.graphNodes.length} Nodes Indexed</span>
              </div>
              <div className="surface-card p-6 border-cyan-500/30 bg-[#050b1c] grid grid-cols-1 sm:grid-cols-5 gap-3">
                {currentPr.graphNodes.map((gn) => (
                  <div
                    key={gn.id}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      gn.status === 'modified'
                        ? 'bg-amber-950/50 border-amber-500/70 text-amber-200 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]'
                        : gn.status === 'affected'
                        ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-200 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]'
                        : 'bg-[#0a122e] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-[9px] font-mono uppercase font-bold tracking-wider opacity-75">{gn.type}</div>
                    <div className="text-xs font-bold mt-1 truncate text-white">{gn.label}</div>
                    <div className="text-[10px] font-mono uppercase mt-1">
                      {gn.status === 'modified' && '⚡ Modified'}
                      {gn.status === 'affected' && '↳ Affected'}
                      {gn.status === 'unaffected' && '✓ Untouched'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SANDBOX TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="p-6 bg-[#070d1e]">
              <div className="surface-card p-5 border-cyan-500/30 bg-[#030612] font-mono text-xs space-y-2 text-emerald-400 overflow-x-auto shadow-inner">
                {currentPr.terminalOutput.map((line, idx) => (
                  <div key={idx} className={line.startsWith('$') ? 'text-cyan-300 font-bold' : line.includes('PASSED') ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WHY DIFFBEACON: COMPARISON MATRIX */}
      <section className="relative max-w-6xl mx-auto px-4 pb-24 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="badge-cyan text-xs inline-flex mb-1">
            Architectural Differentiation
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Why DiffBeacon is not another AI reviewer</h2>
          <p className="text-sm text-slate-300">
            Generic LLMs hallucinate dependencies and produce superficial line summaries. DiffBeacon builds an evidence-anchored ledger of behavioral deltas.
          </p>
        </div>

        <div className="surface-card border-cyan-500/25 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1c294e] bg-[#070e24] text-slate-300">
                <th className="p-4 font-bold">Capability / Standard</th>
                <th className="p-4 text-slate-400">Manual PR Review</th>
                <th className="p-4 text-slate-400">Generic AI Code Reviewer</th>
                <th className="p-4 text-cyan-300 font-extrabold bg-cyan-950/40">DiffBeacon Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132042] text-slate-300">
              {[
                { cap: 'Deterministic AST Analysis', manual: 'Mental compilation', ai: 'Statistical token prediction', beacon: '100% Tree-sitter & AST verified' },
                { cap: 'Citation Provenance', manual: 'None', ai: 'Hallucinates files & line numbers', beacon: 'Zero fabricated citations' },
                { cap: 'Epistemic Truth Labels', manual: 'Unstated assumptions', ai: 'False confidence on all claims', beacon: 'Explicit (Fact vs Inferred vs Unknown)' },
                { cap: 'Contract Surface Diffing', manual: 'Manual checklist review', ai: 'Generic markdown summary', beacon: 'Automated OpenAPI & DRF schema diffs' },
                { cap: 'Downstream Blast Radius', manual: 'Blindspot risk', ai: 'No whole-graph indexing', beacon: 'Multi-layer caller-graph traversal' },
                { cap: 'Sandbox Test Verification', manual: 'Wait for CI suite', ai: 'Cannot run code', beacon: 'Local reproducible test execution' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#0a122e] transition-colors">
                  <td className="p-4 font-bold text-white">{row.cap}</td>
                  <td className="p-4 text-slate-400">{row.manual}</td>
                  <td className="p-4 text-rose-300/90">{row.ai}</td>
                  <td className="p-4 text-cyan-300 font-bold bg-cyan-950/20">{row.beacon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SIX CORE PILLARS */}
      <section className="relative max-w-6xl mx-auto px-4 pb-24 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="badge-violet text-xs inline-flex mb-1">
            Comprehensive Investigation Surfaces
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Six coordinated views into every change</h2>
          <p className="text-sm text-slate-300">
            Every screen connects directly to the AST analysis snapshot. No disconnected mockups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Layers, title: 'Behavior Delta Ledger', copy: 'Observable deltas anchored in exact source references, distinguishing compatible extensions from breaking changes.', tag: 'Core Ledger', border: 'border-cyan-500/30' },
            { icon: Cpu, title: 'Contract Surface Map', copy: 'Diffs serializer fields, HTTP request parameters, and model definitions before downstream consumers fail in production.', tag: 'Schema Invariants', border: 'border-violet-500/30' },
            { icon: Network, title: 'Blast Radius Explorer', copy: 'Interactive graph traversing imported symbols, views, services, and tests that touch the modified code path.', tag: 'Dependency Graph', border: 'border-emerald-500/30' },
            { icon: Split, title: 'Change Scenario Studio', copy: 'Ask concrete hypotheses ("What happens if this param is null?") and walk old vs new paths step-by-step.', tag: 'Signature Experience', border: 'border-cyan-500/30' },
            { icon: CheckCircle2, title: 'Verification Matrix', copy: 'Generates and runs isolated pytest assertions against the head snapshot, persisting runtime results with timestamped proof.', tag: 'Pytest Sandbox', border: 'border-emerald-500/30' },
            { icon: HelpCircle, title: 'Unknowns Register', copy: 'Explicitly flags dynamic method dispatch, unanalyzable reflection, and runtime blindspots that require manual review.', tag: 'Epistemic Safety', border: 'border-amber-500/30' },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className={`surface-card p-5 surface-card-hover ${pillar.border} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    <pillar.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-cyan-300 bg-[#0a1435] px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">{pillar.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">{pillar.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5-STAGE BEHAVIORAL PIPELINE */}
      <section className="relative max-w-6xl mx-auto px-4 pb-24 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="badge-cyan text-xs inline-flex mb-1">
            Execution Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How DiffBeacon turns raw diffs into behavioral certainty</h2>
          <p className="text-sm text-slate-300">
            A deterministic, multi-stage static analysis engine built for multi-language microservices and monolithic backends.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[
            { step: '01', title: 'Ingest & Normalize', desc: 'Parses base and head snapshot archives, validating checksums and filtering non-source assets.', pill: 'Stage 1' },
            { step: '02', title: 'AST Diff & Symbols', desc: 'Extracts classes, functions, imports, decorators, and function signatures with exact line ranges.', pill: 'Stage 2' },
            { step: '03', title: 'Contract Invariants', desc: 'Diffs serializer validation rules, model fields, OpenAPI query parameters, and return types.', pill: 'Stage 3' },
            { step: '04', title: 'Blast Radius Graph', desc: 'Traverses typed call graphs and import chains to isolate every affected downstream consumer.', pill: 'Stage 4' },
            { step: '05', title: 'Verification Matrix', desc: 'Discovers existing tests, identifies unverified delta paths, and flags epistemic unknowns.', pill: 'Stage 5' },
          ].map((stage) => (
            <div key={stage.step} className="surface-card p-4 border-cyan-500/25 flex flex-col justify-between surface-card-hover">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black text-cyan-400">{stage.step}</span>
                  <span className="text-[10px] font-mono uppercase text-cyan-300 bg-[#0a1435] px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {stage.pill}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1.5">{stage.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative max-w-4xl mx-auto px-4 pb-24 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="badge-cyan text-xs inline-flex mb-1">
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl font-extrabold text-white">Engineering FAQ</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does DiffBeacon differ from GitHub Copilot and CodeRabbit?',
              a: 'General AI code reviewers use standard LLM prompts to produce informal text summaries or linter-like comments on diff hunks. DiffBeacon is an evidence-first static analysis platform: it parses snapshots into deterministic ASTs, extracts contract schemas, traverses call-graph blast radiuses, and generates an auditable ledger with zero fabricated citations. When an LLM is used, it operates strictly on structured facts with fallback guarantees.',
            },
            {
              q: 'Does DiffBeacon send our proprietary source code to external AI vendors?',
              a: 'No, not unless explicitly configured. DiffBeacon includes a 100% deterministic local rule engine that works offline with zero external API keys. When external providers (OpenAI, Anthropic, Gemini, Ollama) are configured in Settings, DiffBeacon applies automated secret and credential redaction before sending payload context, and never transmits base/head archive binaries.',
            },
            {
              q: 'What languages and frameworks are supported?',
              a: 'DiffBeacon features a 26-language capability registry with Tier 1 support for Python (Django/DRF, FastAPI, Flask), TypeScript, JavaScript, Go, Rust, Java, C#, PHP, and Ruby. Tier 2 support covers Kotlin, Swift, Scala, Dart, Lua, R, Shell, SQL, GraphQL, Protobuf, and config schemas. Every language displays its exact AST parser status and analysis limitations.',
            },
            {
              q: 'How does DiffBeacon handle dynamic or unanalyzable code?',
              a: 'Unlike tools that claim 100% certainty by hallucinating, DiffBeacon maintains an explicit Unknowns Register. If a call is made via reflection (e.g. getattr or dynamic dispatch) or if a dependency cannot be resolved statically, it is surfaced as an Unresolved Unknown with explicit risk classification so engineers know exactly what requires manual testing.',
            },
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="surface-card border-cyan-500/25 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[#0c1638] transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-white">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-[#1c294e] pt-3.5 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL PRODUCTION CTA */}
      <section className="relative max-w-4xl mx-auto px-4 pb-24 text-center">
        <div className="surface-card p-8 sm:p-12 border-cyan-500/40 bg-gradient-to-b from-[#0a1330] to-[#040817] shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3)] space-y-6 glow-border-top">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for Production Engineering Teams</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Stop guessing the consequences of pull requests.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-sans">
            Deploy DiffBeacon locally, run it in CI pipelines via GitHub Actions, or explore the live seeded BeaconWorks analysis right now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={() => navigate('/demo')}
              className="btn-primary-radiant w-full sm:w-auto"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Explore Live Seeded Demo</span>
              <ArrowRight className="w-4 h-4 text-slate-950 ml-1" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary-radiant w-full sm:w-auto"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Browse Analysis Snapshots</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
