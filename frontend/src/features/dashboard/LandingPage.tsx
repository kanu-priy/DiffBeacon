import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Split,
  Layers,
  Network,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  Play,
  Pause,
  Code2,
  GitPullRequest,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  AlertTriangle,
  Zap,
  Shield,
  GitBranch,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { api } from '../../lib/api';
import { EpistemicBadge } from '../../components/EpistemicBadge';

/* ─── PR DEMO DATA ──────────────────────────────────────────────────── */

interface DemoStep {
  title: string;
  file: string;
  line: string;
  before: string;
  after: string;
  beforeCode: string;
  afterCode: string;
  provenance: 'statically_established' | 'framework_rule' | 'inferred' | 'unresolved' | 'runtime_verified';
}

interface DemoPR {
  id: string;
  number: number;
  branch: string;
  title: string;
  file: string;
  symbol: string;
  breaking: boolean;
  question: string;
  answer: string;
  steps: DemoStep[];
  nodes: { label: string; type: string; status: 'modified' | 'affected' | 'unaffected' }[];
  terminal: string[];
}

const DEMOS: DemoPR[] = [
  {
    id: 'pr-142', number: 142,
    branch: 'feat/department-fallback',
    title: 'Make department_id optional with default fallback resolver',
    file: 'serializers.py', symbol: 'EmployeeCreateSerializer',
    breaking: false,
    question: 'What happens if a mobile request omits department_id?',
    answer: 'Payloads omitting department_id no longer return 400; the fallback resolver assigns the holding pool.',
    steps: [
      {
        title: 'Payload Validation', file: 'serializers.py', line: '18-24',
        before: 'Validates department_id is present. Missing → 400 Bad Request.',
        after: 'department_id is required=False, allow_null=True. Validation passes.',
        beforeCode: 'department_id = IntegerField(required=True)',
        afterCode: 'department_id = IntegerField(required=False, default=None)',
        provenance: 'statically_established',
      },
      {
        title: 'Service Resolution', file: 'services.py', line: '42-49',
        before: 'Department.objects.get(id=dept_id) — throws DoesNotExist if invalid.',
        after: 'Checks None → calls Department.get_default_holding_pool() as fallback.',
        beforeCode: 'dept = Department.objects.get(id=dept_id)\nemp.department = dept',
        afterCode: 'if not dept_id:\n    dept = Department.get_default_holding_pool()\nelse:\n    dept = Department.objects.get(id=dept_id)',
        provenance: 'framework_rule',
      },
      {
        title: 'HTTP Response Change', file: 'views.py', line: '76-82',
        before: 'Returns 400 with {"department_id": ["required"]}.',
        after: 'Returns 201 with assigned department_id=1.',
        beforeCode: '# HTTP 400 Bad Request\n{"department_id": ["This field is required."]}',
        afterCode: '# HTTP 201 Created\n{"id": 47, "department_id": 1, "status": "assigned"}',
        provenance: 'runtime_verified',
      },
    ],
    nodes: [
      { label: 'POST /employees/', type: 'endpoint', status: 'unaffected' },
      { label: 'EmployeeCreateSerializer', type: 'serializer', status: 'modified' },
      { label: 'assign_department()', type: 'service', status: 'modified' },
      { label: 'Employee Model', type: 'model', status: 'affected' },
      { label: 'test_create_employee', type: 'test', status: 'affected' },
    ],
    terminal: [
      '$ diffbeacon analyze --pr=142 --sandbox',
      '[parse] Extracting AST from base and head snapshots...',
      '[diff]  3 symbols changed across 3 files',
      '[graph] Traversing call graph — 5 nodes, 1 modified root',
      '[test]  tests/test_employees.py::test_create_no_dept PASSED',
      '[test]  tests/test_employees.py::test_fallback_pool PASSED',
      '[done]  Analysis complete. Contract: COMPATIBLE.',
    ],
  },
  {
    id: 'pr-189', number: 189,
    branch: 'fix/salary-floor-enforcement',
    title: 'Enforce minimum salary floor of 50k in offer validation',
    file: 'validators.py', symbol: 'validate_salary_offer',
    breaking: true,
    question: 'Will existing offers below 50k still be accepted?',
    answer: 'No. The new floor rejects any offer below 50,000 — previously accepted offers at 40k now fail validation.',
    steps: [
      {
        title: 'Validation Logic', file: 'validators.py', line: '28-35',
        before: 'No minimum floor enforced. Any positive integer accepted.',
        after: 'Raises ValidationError if salary < 50000.',
        beforeCode: 'def validate_salary(value):\n    if value <= 0:\n        raise ValidationError("Must be positive")',
        afterCode: 'SALARY_FLOOR = 50_000\ndef validate_salary(value):\n    if value < SALARY_FLOOR:\n        raise ValidationError(f"Below minimum {SALARY_FLOOR}")',
        provenance: 'statically_established',
      },
      {
        title: 'Contract Impact', file: 'serializers.py', line: '44-48',
        before: 'Serializer passes salary=40000 without error.',
        after: 'Serializer now rejects salary=40000 → HTTP 400.',
        beforeCode: '# salary=40000 → valid\nserializer.is_valid()  # True',
        afterCode: '# salary=40000 → invalid\nserializer.is_valid()  # False\n# {"salary": ["Below minimum 50000"]}',
        provenance: 'runtime_verified',
      },
    ],
    nodes: [
      { label: 'POST /offers/', type: 'endpoint', status: 'unaffected' },
      { label: 'validate_salary_offer()', type: 'service', status: 'modified' },
      { label: 'OfferSerializer', type: 'serializer', status: 'affected' },
      { label: 'Offer Model', type: 'model', status: 'unaffected' },
      { label: 'test_salary_validation', type: 'test', status: 'affected' },
    ],
    terminal: [
      '$ diffbeacon analyze --pr=189 --sandbox',
      '[parse] Extracting AST from base and head snapshots...',
      '[diff]  2 symbols changed across 2 files',
      '[graph] Traversing call graph — 5 nodes, 1 breaking',
      '[test]  tests/test_salary.py::test_40k_rejected PASSED',
      '[test]  tests/test_salary.py::test_50k_accepted PASSED',
      '[done]  Analysis complete. Contract: BREAKING DELTA.',
    ],
  },
  {
    id: 'pr-205', number: 205,
    branch: 'refactor/async-audit',
    title: 'Migrate synchronous audit logging to async event broker',
    file: 'services.py', symbol: 'dispatch_audit_event',
    breaking: false,
    question: 'Are audit logs guaranteed to persist before the HTTP response?',
    answer: 'No. Logs are now dispatched to Celery workers with ~30ms eventual consistency.',
    steps: [
      {
        title: 'Dispatch Mechanism', file: 'services.py', line: '54-61',
        before: 'AuditLog.objects.create() inside the request transaction.',
        after: 'celery_app.send_task("audit.record") — returns immediately.',
        beforeCode: 'def record_audit(event, payload):\n    AuditLog.objects.create(type=event, data=payload)',
        afterCode: 'def record_audit(event, payload):\n    record_event_task.delay(event, payload)',
        provenance: 'statically_established',
      },
      {
        title: 'Consistency Window', file: 'tasks.py', line: '15-22',
        before: 'Immediate queryability in the next request.',
        after: 'Record available ~20-60ms later depending on queue lag.',
        beforeCode: 'assert AuditLog.objects.filter(type=event).exists()  # True',
        afterCode: '# Immediate SELECT may return 0 rows\n# Available after ~30ms worker processing',
        provenance: 'inferred',
      },
    ],
    nodes: [
      { label: 'POST /api/audit/', type: 'endpoint', status: 'unaffected' },
      { label: 'dispatch_audit_event()', type: 'service', status: 'modified' },
      { label: 'record_event_task', type: 'service', status: 'modified' },
      { label: 'AuditLog Model', type: 'model', status: 'affected' },
      { label: 'test_async_dispatch', type: 'test', status: 'affected' },
    ],
    terminal: [
      '$ diffbeacon analyze --pr=205 --sandbox',
      '[parse] Extracting AST from base and head snapshots...',
      '[diff]  2 symbols changed across 2 files',
      '[graph] Traversing call graph — 5 nodes, 0 breaking',
      '[test]  tests/test_audit.py::test_task_queued PASSED',
      '[test]  tests/test_audit.py::test_worker_consumes PASSED',
      '[done]  Analysis complete. Contract: COMPATIBLE.',
    ],
  },
];

/* ─── ANIMATED TERMINAL COMPONENT ───────────────────────────────────── */

const AnimatedTerminal: React.FC<{ lines: string[] }> = ({ lines }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(0);
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= lines.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(timer);
  }, [lines]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount]);

  return (
    <div ref={containerRef} className="code-block h-56 overflow-y-auto space-y-1 text-xs">
      <div className="flex items-center gap-2 text-[#444] text-[11px] pb-2 border-b border-[#222] mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2">diffbeacon — terminal</span>
      </div>
      {lines.slice(0, visibleCount).map((line, i) => (
        <div
          key={i}
          className={`animate-fade-up font-mono ${
            line.startsWith('$') ? 'text-[#3b82f6] font-semibold' :
            line.includes('PASSED') ? 'text-green-400' :
            line.includes('BREAKING') ? 'text-red-400 font-semibold' :
            line.startsWith('[done]') ? 'text-green-400 font-semibold' :
            'text-[#a1a1a1]'
          }`}
        >
          {line}
        </div>
      ))}
      {visibleCount < lines.length && (
        <span className="inline-block w-2 h-4 bg-[#3b82f6] animate-pulse" />
      )}
    </div>
  );
};

/* ─── LIVE CODE DIFF COMPONENT ──────────────────────────────────────── */

const LiveDiff: React.FC<{ step: DemoStep }> = ({ step }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-[#666]">
        <span className="w-2 h-2 rounded-full bg-[#444]" />
        <span className="font-mono">BASE</span>
        <span className="text-[#444]">·</span>
        <span>{step.file}:{step.line}</span>
      </div>
      <div className="code-block text-xs space-y-1">
        {step.beforeCode.split('\n').map((line, i) => (
          <div key={i} className="diff-del py-0.5">{line}</div>
        ))}
      </div>
      <p className="text-xs text-[#666] leading-relaxed">{step.before}</p>
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-[#666]">
        <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
        <span className="font-mono text-[#3b82f6]">HEAD</span>
        <span className="text-[#444]">·</span>
        <span>{step.file}:{step.line}</span>
      </div>
      <div className="code-block text-xs space-y-1">
        {step.afterCode.split('\n').map((line, i) => (
          <div key={i} className="diff-add py-0.5">{line}</div>
        ))}
      </div>
      <p className="text-xs text-[#a1a1a1] leading-relaxed">{step.after}</p>
    </div>
  </div>
);

/* ─── MAIN LANDING PAGE ─────────────────────────────────────────────── */

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [prIndex, setPrIndex] = useState(0);
  const [tab, setTab] = useState<'walkthrough' | 'diff' | 'graph' | 'terminal'>('walkthrough');
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const pr = DEMOS[prIndex];
  const step = pr.steps[stepIndex] || pr.steps[0];

  // Autoplay
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setStepIndex((i) => {
        if (i >= pr.steps.length - 1) { setPlaying(false); return 0; }
        return i + 1;
      });
    }, 2000);
    return () => clearInterval(t);
  }, [playing, pr.steps.length]);

  const copyInstall = useCallback(() => {
    navigator.clipboard.writeText('pip install diffbeacon');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const { data: demoStatus } = useQuery({
    queryKey: ['demo-status'],
    queryFn: api.getDemoStatus,
  });

  const switchPr = (i: number) => { setPrIndex(i); setStepIndex(0); setPlaying(false); setTab('walkthrough'); };

  return (
    <div className="min-h-screen">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="badge-blue text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 inline-block" />
              v2.0 — Deterministic AST Engine
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            See what a code change<br />
            <span className="text-[#3b82f6]">actually touches.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#a1a1a1] leading-relaxed max-w-2xl">
            DiffBeacon traces every code change through its call graph, flags contract breaks,
            and shows exactly which downstream modules, tests, and API surfaces are affected — with
            zero hallucinated citations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button onClick={() => navigate('/demo')} className="btn-primary flex items-center gap-2">
              <span>Open Analyzer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#666]" />
              <span>Workspaces</span>
            </button>
            <button onClick={copyInstall} className="btn-secondary flex items-center gap-2 font-mono text-xs">
              <span className="text-[#3b82f6]">$</span>
              <span>pip install diffbeacon</span>
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-[#666]" />}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-3xl">
          {[
            { label: 'AST Grounded', value: '100%', desc: 'Zero fabricated line numbers' },
            { label: 'Languages', value: '26', desc: 'Tier 1 and Tier 2 adapters' },
            { label: 'Epistemic Labels', value: '5 tiers', desc: 'Fact → Inferred → Unknown' },
            { label: 'Works Offline', value: 'Yes', desc: 'No API key required' },
          ].map((s) => (
            <div key={s.label} className="card p-3.5">
              <div className="text-xs text-[#666] font-mono uppercase tracking-wider">{s.label}</div>
              <div className="text-lg font-bold text-white mt-1">{s.value}</div>
              <div className="text-[11px] text-[#555] mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE PR ANALYZER ───────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="card overflow-hidden">
          {/* PR selector */}
          <div className="p-4 border-b border-[#222] bg-[#0a0a0a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#a1a1a1]">
              <GitPullRequest className="w-4 h-4 text-[#3b82f6]" />
              <span className="font-medium text-white">Live PR Analyzer</span>
              <span className="text-[#444]">·</span>
              <span>Select a scenario:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {DEMOS.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => switchPr(i)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                    prIndex === i
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#111] text-[#a1a1a1] hover:text-white border border-[#222] hover:border-[#333]'
                  }`}
                >
                  <span>#{d.number}</span>
                  <span className="hidden sm:inline text-[11px]">{d.symbol}</span>
                  {d.breaking && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* PR header */}
          <div className="px-5 py-3.5 border-b border-[#1a1a1a] bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#666] font-mono">
                <GitBranch className="w-3.5 h-3.5" />
                <span className="text-[#3b82f6]">{pr.branch}</span>
                <span>→</span>
                <span>{pr.file}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-1">{pr.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {pr.breaking ? <span className="badge-red text-[11px]">Breaking</span> : <span className="badge-green text-[11px]">Compatible</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#1a1a1a] bg-[#050505] px-5 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {[
                { id: 'walkthrough', label: 'Walkthrough', icon: Split },
                { id: 'diff', label: 'Code Diff', icon: Code2 },
                { id: 'graph', label: 'Blast Radius', icon: Network },
                { id: 'terminal', label: 'Terminal', icon: Terminal },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`px-3 py-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                    tab === t.id
                      ? 'border-[#3b82f6] text-white'
                      : 'border-transparent text-[#666] hover:text-[#a1a1a1]'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            {tab === 'walkthrough' && (
              <button
                onClick={() => setPlaying(!playing)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  playing ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-[#111] text-[#a1a1a1] border border-[#222] hover:text-white'
                }`}
              >
                {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{playing ? 'Pause' : 'Play'}</span>
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="p-5 bg-[#050505]">
            {/* WALKTHROUGH */}
            {tab === 'walkthrough' && (
              <div className="space-y-5 animate-fade-in">
                {/* Question */}
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-[#3b82f6]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#666] font-mono uppercase tracking-wider">Hypothesis</div>
                    <p className="text-sm font-medium text-white mt-0.5">"{pr.question}"</p>
                    <p className="text-xs text-[#a1a1a1] mt-1">{pr.answer}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#666]">
                    <span className="font-mono">Trace step {stepIndex + 1}/{pr.steps.length}</span>
                  </div>
                  <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3b82f6] transition-all duration-300 rounded-full"
                      style={{ width: `${((stepIndex + 1) / pr.steps.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    {pr.steps.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setStepIndex(i); setPlaying(false); }}
                        className={`flex-1 p-3 rounded-lg text-left text-xs transition-all border ${
                          stepIndex === i
                            ? 'bg-[#111] border-[#3b82f6]/50 text-white'
                            : 'bg-[#0a0a0a] border-[#1a1a1a] text-[#666] hover:border-[#333] hover:text-[#a1a1a1]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono">{String(i + 1).padStart(2, '0')}</span>
                          <EpistemicBadge provenance={s.provenance} />
                        </div>
                        <div className="font-medium mt-1 truncate">{s.title}</div>
                        <div className="text-[10px] font-mono text-[#555] mt-0.5">{s.file}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active step detail */}
                <div className="card p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                      <span className="text-xs font-mono text-[#666]">{step.file}:{step.line}</span>
                    </div>
                    <EpistemicBadge provenance={step.provenance} />
                  </div>
                  <LiveDiff step={step} />
                </div>
              </div>
            )}

            {/* DIFF */}
            {tab === 'diff' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#666]">{pr.file}</span>
                  <span className="badge-blue text-[11px]">AST Diff</span>
                </div>
                <div className="code-block space-y-4">
                  {pr.steps.map((s, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="text-[11px] text-[#3b82f6] font-mono font-semibold">
                        @@ {s.title} ({s.file}:{s.line}) @@
                      </div>
                      {s.beforeCode.split('\n').map((line, j) => (
                        <div key={`d-${j}`} className="diff-del text-xs py-0.5">- {line}</div>
                      ))}
                      {s.afterCode.split('\n').map((line, j) => (
                        <div key={`a-${j}`} className="diff-add text-xs py-0.5">+ {line}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BLAST RADIUS */}
            {tab === 'graph' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#666]">Call-graph traversal — {pr.nodes.length} nodes indexed</span>
                  <div className="flex gap-3 text-[11px] text-[#666]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Modified</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Affected</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#333]" /> Untouched</span>
                  </div>
                </div>

                {/* Graph nodes as a clean timeline */}
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#222]" />
                  <div className="space-y-2">
                    {pr.nodes.map((n, i) => (
                      <div key={i} className="relative pl-10 py-2.5">
                        <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                          n.status === 'modified' ? 'bg-yellow-500 border-yellow-400' :
                          n.status === 'affected' ? 'bg-[#3b82f6] border-blue-400' :
                          'bg-[#222] border-[#333]'
                        }`} />
                        <div className="card p-3 card-hover flex items-center justify-between">
                          <div>
                            <div className="text-xs font-medium text-white">{n.label}</div>
                            <div className="text-[11px] text-[#555] font-mono mt-0.5">{n.type}</div>
                          </div>
                          <span className={`text-[11px] font-mono ${
                            n.status === 'modified' ? 'text-yellow-400' :
                            n.status === 'affected' ? 'text-[#3b82f6]' :
                            'text-[#555]'
                          }`}>
                            {n.status === 'modified' && '⚡ modified'}
                            {n.status === 'affected' && '↳ affected'}
                            {n.status === 'unaffected' && '✓ untouched'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TERMINAL */}
            {tab === 'terminal' && (
              <div className="animate-fade-in">
                <AnimatedTerminal lines={pr.terminal} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── WHAT DIFFBEACON DOES (6 capabilities) ─────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">What DiffBeacon does</h2>
          <p className="text-sm text-[#a1a1a1] mt-1">Six coordinated views into every code change.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Layers, title: 'Behavior Delta Ledger', desc: 'Observable differences anchored in exact source references, distinguishing compatible from breaking changes.', tag: 'Core' },
            { icon: Cpu, title: 'Contract Surface Map', desc: 'Diffs serializer fields, HTTP parameters, and model definitions before downstream consumers fail.', tag: 'Schema' },
            { icon: Network, title: 'Blast Radius Explorer', desc: 'Interactive graph traversing imports, views, services, and tests that touch the modified code path.', tag: 'Graph' },
            { icon: Split, title: 'Change Scenario Studio', desc: 'Ask concrete hypotheses and walk old vs new execution paths step by step with live code.', tag: 'Scenarios' },
            { icon: CheckCircle2, title: 'Verification Matrix', desc: 'Discovers existing tests, identifies uncovered delta paths, runs assertions in an isolated sandbox.', tag: 'Tests' },
            { icon: HelpCircle, title: 'Unknowns Register', desc: 'Flags dynamic dispatch, reflection, and runtime blindspots that require manual review.', tag: 'Safety' },
          ].map((c) => (
            <div key={c.title} className="card p-4 card-hover flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-md bg-[#111] border border-[#222] flex items-center justify-center">
                  <c.icon className="w-4 h-4 text-[#a1a1a1]" />
                </div>
                <span className="badge-neutral text-[10px] font-mono">{c.tag}</span>
              </div>
              <h3 className="text-sm font-semibold text-white">{c.title}</h3>
              <p className="text-xs text-[#666] mt-1.5 leading-relaxed flex-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">How it compares</h2>
          <p className="text-sm text-[#a1a1a1] mt-1">DiffBeacon vs manual review vs generic AI reviewers.</p>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222] bg-[#0a0a0a]">
                <th className="p-3.5 font-semibold text-[#a1a1a1]">Capability</th>
                <th className="p-3.5 text-[#666]">Manual Review</th>
                <th className="p-3.5 text-[#666]">AI Code Reviewer</th>
                <th className="p-3.5 text-[#3b82f6] font-semibold">DiffBeacon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {[
                ['AST Analysis', 'Mental model', 'Token prediction', '100% Tree-sitter verified'],
                ['Citation Accuracy', 'None', 'Hallucinated files & lines', 'Zero fabricated citations'],
                ['Epistemic Labels', 'Unstated assumptions', 'False confidence', 'Fact / Inferred / Unknown'],
                ['Schema Diffing', 'Manual checklist', 'Markdown summary', 'Automated OpenAPI + DRF diffs'],
                ['Blast Radius', 'Blindspot risk', 'No graph indexing', 'Multi-layer call graph traversal'],
                ['Test Verification', 'Wait for CI', 'Cannot run code', 'Sandbox test execution'],
              ].map(([cap, manual, ai, beacon], i) => (
                <tr key={i} className="hover:bg-[#0a0a0a] transition-colors">
                  <td className="p-3.5 font-medium text-white">{cap}</td>
                  <td className="p-3.5 text-[#666]">{manual}</td>
                  <td className="p-3.5 text-red-400/80">{ai}</td>
                  <td className="p-3.5 text-[#3b82f6] font-medium">{beacon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PIPELINE ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Analysis pipeline</h2>
          <p className="text-sm text-[#a1a1a1] mt-1">Five deterministic stages from raw diff to verified impact report.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[
            { n: '01', title: 'Ingest', desc: 'Parse base & head snapshots, validate checksums.' },
            { n: '02', title: 'AST Diff', desc: 'Extract classes, functions, signatures with exact lines.' },
            { n: '03', title: 'Contracts', desc: 'Diff serializer rules, model fields, return types.' },
            { n: '04', title: 'Blast Radius', desc: 'Traverse call graphs and import chains.' },
            { n: '05', title: 'Verify', desc: 'Discover tests, flag unknowns, run sandbox.' },
          ].map((s) => (
            <div key={s.n} className="card p-3.5 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-[#3b82f6] font-mono">{s.n}</span>
                {s.n !== '05' && <ArrowRight className="w-3 h-3 text-[#333] hidden sm:block" />}
              </div>
              <h4 className="text-xs font-semibold text-white">{s.title}</h4>
              <p className="text-[11px] text-[#666] mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>

        <div className="space-y-2">
          {[
            {
              q: 'How does DiffBeacon differ from GitHub Copilot and CodeRabbit?',
              a: 'Generic AI reviewers use LLM prompts to produce informal summaries. DiffBeacon is a deterministic static analysis platform — it parses snapshots into ASTs, extracts contract schemas, traverses blast radiuses, and generates an auditable ledger with zero fabricated citations.',
            },
            {
              q: 'Does it send source code to external AI vendors?',
              a: 'Not unless explicitly configured. DiffBeacon includes a 100% deterministic local engine that works offline with zero API keys. When external providers are configured, it applies automated credential redaction before sending context.',
            },
            {
              q: 'What languages are supported?',
              a: 'Tier 1: Python, TypeScript, JavaScript, Go, Rust, Java, C#, PHP, Ruby. Tier 2: Kotlin, Swift, Scala, Dart, Lua, R, Shell, SQL, GraphQL, Protobuf, YAML, JSON, TOML, and more. 26 total.',
            },
            {
              q: 'How does it handle dynamic or unanalyzable code?',
              a: 'Unlike tools that claim 100% certainty, DiffBeacon maintains an explicit Unknowns Register. Dynamic dispatch, reflection, and unresolvable dependencies are flagged with risk classifications.',
            },
          ].map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[#111] transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-white">{f.q}</span>
                {faqOpen === i ? <ChevronUp className="w-4 h-4 text-[#666] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#666] shrink-0" />}
              </button>
              {faqOpen === i && (
                <div className="px-4 pb-4 text-sm text-[#a1a1a1] leading-relaxed border-t border-[#1a1a1a] pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <div className="card p-8 sm:p-12 space-y-5 bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Stop guessing what a PR touches.
          </h2>
          <p className="text-sm text-[#a1a1a1] max-w-lg mx-auto">
            Deploy locally, run in CI via GitHub Actions, or explore the live demo right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button onClick={() => navigate('/demo')} className="btn-primary flex items-center gap-2">
              <span>Open Analyzer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#666]" />
              <span>Browse Snapshots</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
