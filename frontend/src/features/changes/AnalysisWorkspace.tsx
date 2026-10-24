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
} from 'lucide-react';

export const AnalysisWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'deltas' | 'contracts' | 'graph' | 'scenarios' | 'verification' | 'unknowns' | 'evidence' | 'history'
  >('scenarios');

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
    setActiveTab('evidence');
  };

  const handleInspectLine = (filePath: string, line: number) => {
    setInspectorFilePath(filePath);
    setInspectorLineRange([Math.max(1, line - 5), line + 15]);
    setActiveTab('evidence');
  };

  if (isAnalysisLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
        <h2 className="text-sm font-semibold text-slate-200">Assembling Change Story...</h2>
        <p className="text-xs text-slate-400">Loading verified AST symbols, typed edges, and contracts.</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-base font-semibold text-rose-400">Analysis Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded bg-slate-800 text-xs text-slate-200 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'scenarios', label: 'Scenario Studio', icon: <Split className="w-4 h-4 text-violet-400" />, badge: analysis.counts?.scenarios },
    { id: 'deltas', label: 'Behavior Ledger', icon: <Layers className="w-4 h-4 text-cyan-400" />, badge: deltas.length },
    { id: 'contracts', label: 'Contract Map', icon: <Cpu className="w-4 h-4 text-teal-400" />, badge: contracts.length },
    { id: 'graph', label: 'Impact Explorer', icon: <Network className="w-4 h-4 text-emerald-400" /> },
    { id: 'verification', label: 'Verification Matrix', icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />, badge: verificationCases.length },
    { id: 'unknowns', label: 'Unknowns Register', icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, badge: unknowns.length },
    { id: 'evidence', label: 'Source Evidence', icon: <FileCode className="w-4 h-4 text-slate-400" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span>/</span>
            <span className="font-mono text-cyan-300">Analysis {analysis.id.slice(0, 8)}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>{analysis.base_snapshot_label}</span>
            <span className="text-cyan-400">→</span>
            <span>{analysis.head_snapshot_label}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="px-2 py-0.5 rounded font-mono uppercase text-[10px] font-bold bg-teal-950 text-teal-400 border border-teal-800">
              {analysis.status}
            </span>
            <span>•</span>
            <span>Engine: v{analysis.engine_version}</span>
            <span>•</span>
            <span className="capitalize">AI Provider: {analysis.ai_provider_name}</span>
          </div>
        </div>

        {/* Epistemic Guardrail Indicator */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Strict Epistemic Provenance</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Statements are categorized as Statically Established, Framework Rules, Inferences, or Explicit Unknowns.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/80 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
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
      </div>
    </div>
  );
};
