import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { BehaviorLedger } from './BehaviorLedger';
import { ContractMap } from '../contracts/ContractMap';
import { ImpactExplorer } from '../impact-graph/ImpactExplorer';
import { ScenarioStudio } from '../scenarios/ScenarioStudio';
import { VerificationMatrix } from '../verification/VerificationMatrix';
import { UnknownsRegister } from '../unknowns/UnknownsRegister';
import { EvidenceInspector } from '../evidence/EvidenceInspector';
import { HistoryView } from '../history/HistoryView';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import {
  Layers,
  Split,
  Network,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  History,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  GitBranch,
} from 'lucide-react';

export const AnalysisWorkspace: React.FC = () => {
  const { id, subtab } = useParams<{ id: string; subtab?: string }>();
  const navigate = useNavigate();

  type TabType =
    | 'deltas'
    | 'contracts'
    | 'graph'
    | 'scenarios'
    | 'verification'
    | 'unknowns'
    | 'evidence'
    | 'history';

  const normalizeSubtab = (tab?: string): TabType => {
    if (!tab) return 'scenarios';
    const clean = tab.toLowerCase();
    if (clean === 'story' || clean === 'deltas' || clean === 'behavior') return 'deltas';
    if (clean === 'contracts' || clean === 'contract') return 'contracts';
    if (clean === 'impact' || clean === 'graph') return 'graph';
    if (clean === 'scenarios' || clean === 'scenario') return 'scenarios';
    if (clean === 'verification' || clean === 'tests') return 'verification';
    if (clean === 'unknowns' || clean === 'blindspots') return 'unknowns';
    if (clean === 'evidence' || clean === 'source') return 'evidence';
    if (clean === 'history') return 'history';
    return 'scenarios';
  };

  const [activeTab, setActiveTab] = useState<TabType>(() => normalizeSubtab(subtab));

  React.useEffect(() => {
    if (subtab) {
      setActiveTab(normalizeSubtab(subtab));
    }
  }, [subtab]);

  const handleTabChange = (target: TabType) => {
    setActiveTab(target);
    if (id) {
      navigate(`/app/analyses/${id}/${target}`, { replace: true });
    }
  };

  // Evidence inspector target state
  const [inspectorFilePath, setInspectorFilePath] = useState('serializers.py');
  const [inspectorLineRange, setInspectorLineRange] = useState<[number, number]>([1, 40]);

  const {
    data: analysis,
    isLoading: isAnalysisLoading,
  } = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => (id ? api.getAnalysis(id) : Promise.reject('No ID')),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'running' || status === 'queued' ? 1500 : false;
    },
  });

  const { data: deltas = [] } = useQuery({
    queryKey: ['deltas', id],
    queryFn: () => (id ? api.getBehaviorDeltas(id) : []),
    enabled: !!id,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts', id],
    queryFn: () => (id ? api.getContractDeltas(id) : []),
    enabled: !!id,
  });

  const { data: verificationCases = [] } = useQuery({
    queryKey: ['verification', id],
    queryFn: () => (id ? api.getVerificationCases(id) : []),
    enabled: !!id,
  });

  const { data: unknowns = [] } = useQuery({
    queryKey: ['unknowns', id],
    queryFn: () => (id ? api.getUnknowns(id) : []),
    enabled: !!id,
  });

  const handleInspectEvidence = (filePath: string, lineRange: [number, number]) => {
    setInspectorFilePath(filePath);
    setInspectorLineRange(lineRange);
    handleTabChange('evidence');
  };

  const handleInspectLine = (filePath: string, line: number) => {
    setInspectorFilePath(filePath);
    setInspectorLineRange([Math.max(1, line - 5), line + 15]);
    handleTabChange('evidence');
  };

  if (isAnalysisLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 font-mono text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
        <h2 className="text-sm font-semibold text-white">Assembling Change Intelligence Story...</h2>
        <p className="text-slate-400">Auditing snapshot AST symbols, typed edges, and API contracts.</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-base font-semibold text-rose-400">Analysis Snapshot Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-lg bg-[#141824] border border-[#232b3e] text-xs text-slate-200 cursor-pointer hover:bg-[#1a2030]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'scenarios', label: 'Scenario Studio', icon: <Split className="w-4 h-4 text-indigo-400" />, badge: analysis.counts?.scenarios },
    { id: 'deltas', label: 'Behavioral Deltas', icon: <Layers className="w-4 h-4 text-amber-400" />, badge: deltas.length },
    { id: 'contracts', label: 'Contract Map', icon: <Cpu className="w-4 h-4 text-indigo-300" />, badge: contracts.length },
    { id: 'graph', label: 'Impact Explorer', icon: <Network className="w-4 h-4 text-indigo-400" /> },
    { id: 'verification', label: 'Verification Matrix', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, badge: verificationCases.length },
    { id: 'unknowns', label: 'Analysis Boundaries', icon: <AlertTriangle className="w-4 h-4 text-slate-400" />, badge: unknowns.length },
    { id: 'evidence', label: 'Source Evidence', icon: <FileCode className="w-4 h-4 text-slate-400" /> },
    { id: 'history', label: 'Run History', icon: <History className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="surface-card p-5 border-[#1f2638] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspaces</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Snapshot ID: {analysis.id.slice(0, 8)}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>{analysis.base_snapshot_label}</span>
            <span className="text-indigo-400">→</span>
            <span>{analysis.head_snapshot_label}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
            <span className="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
              {analysis.status}
            </span>
            <span>•</span>
            <span>Engine: v{analysis.engine_version}</span>
            <span>•</span>
            <span className="capitalize">Provider: {analysis.ai_provider_name}</span>
          </div>
        </div>

        {/* Verification Status Notice */}
        <div className="p-3 rounded-lg bg-[#0a0d14] border border-[#1b202e] text-xs space-y-1 font-sans">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>AST Evidence Anchored</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs">
            All conclusions derived from read-only Python AST symbol tables and framework contracts.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#1b202e] pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-950/70 text-white border border-indigo-700/60 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#121622] border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-indigo-600 text-white font-bold' : 'bg-[#141824] text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        <ErrorBoundary fallbackTitle="Workspace Tab Incident Detected">
          {activeTab === 'scenarios' && (
            <ScenarioStudio
              analysisId={analysis.id}
              onInspectLine={handleInspectLine}
            />
          )}

          {activeTab === 'deltas' && (
            <BehaviorLedger
              deltas={deltas}
              analysisId={analysis.id}
              onInspectEvidence={handleInspectEvidence}
              onNavigateToGraph={() => setActiveTab('graph')}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractMap
              contracts={contracts}
              onInspectEvidence={handleInspectEvidence}
            />
          )}

          {activeTab === 'graph' && (
            <ImpactExplorer
              analysisId={analysis.id}
              onInspectNode={handleInspectLine}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationMatrix cases={verificationCases} />
          )}

          {activeTab === 'unknowns' && (
            <UnknownsRegister
              unknowns={unknowns}
              onInspectLine={handleInspectLine}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceInspector
              analysisId={analysis.id}
              initialFilePath={inspectorFilePath}
              initialLineRange={inspectorLineRange}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              workspaceId={analysis.workspace}
              currentAnalysisId={analysis.id}
            />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};
