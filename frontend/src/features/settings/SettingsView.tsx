import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';
import {
  Settings,
  Shield,
  Cpu,
  Key,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Loader2,
  Lock,
  EyeOff,
  Server,
  Terminal,
  Save,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'providers' | 'security' | 'general'>('providers');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [selectedProvider, setSelectedProvider] = useState('mock');
  const [redactionEnabled, setRedactionEnabled] = useState(true);

  const { data: providerSettings, isLoading } = useQuery({
    queryKey: ['provider-settings'],
    queryFn: api.getProviderSettings,
  });

  const handleTestProvider = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const res = await api.testProvider(providerId);
      setTestResults((prev) => ({ ...prev, [providerId]: res }));
      toast.success(
        `Connectivity Verified: ${providerId}`,
        `Response latency: ${res.latency_ms}ms · Schema validation passed.`
      );
    } catch (err: any) {
      toast.error(`Provider test failed: ${providerId}`, err.message);
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#1f2638] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5" />
            <span>Application Settings</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Environment Configuration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Platform Settings & Integrations
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-xl">
            Configure AI reasoning providers, epistemic fallback boundaries, secret redaction, and isolated execution limits.
          </p>
        </div>

        <div className="flex items-center rounded-lg bg-[#0e111a] p-1 border border-[#1e2537] text-xs">
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'providers' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Reasoning Providers</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Privacy</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="surface-card p-4 border-[#1f2638] bg-[#0c0e17] flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Epistemic Non-Negotiable: Deterministic Foundation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                DiffBeacon never requires a paid AI API key to function. The deterministic AST engine performs 100% of symbol extraction, dependency graph traversal, and contract diffs locally without external network requests.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Configured Model Providers</h2>
            
            <div className="grid grid-cols-1 gap-3 font-sans">
              {providerSettings?.providers?.map((p: any) => {
                const isSelected = selectedProvider === p.id;
                const result = testResults[p.id];
                const isTesting = testingProvider === p.id;

                return (
                  <div
                    key={p.id}
                    className={`surface-card p-5 border transition-all ${
                      isSelected ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/30' : 'border-[#1f2638]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{p.name}</h3>
                          {p.is_local ? (
                            <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                              Local / Offline
                            </span>
                          ) : (
                            <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                              Cloud Provider
                            </span>
                          )}
                          {p.id === 'mock' && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-[#141824] text-slate-300 border border-[#232b3e]">
                              Active Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTestProvider(p.id)}
                          disabled={isTesting}
                          className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#232b3e] text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isTesting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                              <span>Testing...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                              <span>Test Connectivity</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProvider(p.id);
                            toast.success(`Active Provider Changed`, `Set primary reasoning engine to ${p.name}`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'bg-[#10141f] text-slate-400 hover:text-white border border-[#1b202e]'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </div>
                    </div>

                    {result && (
                      <div className="mt-3 p-2.5 rounded-lg bg-[#07090e] border border-[#1b202e] flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{result.message}</span>
                        </span>
                        <span className="text-slate-400">Latency: {result.latency_ms}ms</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PRIVACY */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="surface-card p-6 border-[#1f2638] space-y-5 font-sans">
            <div>
              <h2 className="text-base font-bold text-white">Trust Boundaries & Data Protection</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                DiffBeacon operates locally inside your infrastructure. Your proprietary code is never transmitted externally by default.
              </p>
            </div>

            <div className="divide-y divide-[#1b202e] text-xs">
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">Secret & Credential Redaction</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Automatically scans and sanitizes API keys, JWT tokens, AWS credentials, and passwords before constructing any evidence package.
                  </div>
                </div>
                <button
                  onClick={() => setRedactionEnabled(!redactionEnabled)}
                  className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition-colors cursor-pointer ${
                    redactionEnabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-[#141824] text-slate-500 border border-[#232b3e]'
                  }`}
                >
                  {redactionEnabled ? 'Enforced' : 'Disabled'}
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">Zero Telemetry & Tracking</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    No analytics pings, no external telemetry beacons, no anonymous usage collection.
                  </div>
                </div>
                <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Air-Gapped Ready</span>
                </span>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">Path Traversal & Zip-Slip Protection</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Uploaded source archives are strictly sanitized against relative path jumps (<code>../</code>) and symlink exploits.
                  </div>
                </div>
                <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">Ephemeral Sandbox Test Execution</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Verification pytest runs occur in disposable sub-processes with resource caps and execution timeouts.
                  </div>
                </div>
                <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enforced</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
