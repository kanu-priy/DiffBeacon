import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImpactGraphData, GraphNode, GraphEdge } from '../../types';
import { api } from '../../lib/api';
import {
  Layers,
  ArrowRight,
  Filter,
  FileCode,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
  Cpu,
  Database,
  Network,
  PlayCircle,
} from 'lucide-react';

interface Props {
  analysisId: string;
  onInspectNode: (filePath: string, line: number) => void;
}

export const ImpactExplorer: React.FC<Props> = ({
  analysisId,
  onInspectNode,
}) => {
  const [side, setSide] = useState<'head' | 'base'>('head');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterChangedOnly, setFilterChangedOnly] = useState(false);

  const { data: graphData, isLoading, refetch } = useQuery({
    queryKey: ['impact-graph', analysisId, side],
    queryFn: () => api.getImpactGraph(analysisId, side),
  });

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const displayNodes = filterChangedOnly
    ? nodes.filter((n) => n.is_changed)
    : nodes;

  const displayNodeIds = new Set(displayNodes.map((n) => n.id));
  const displayEdges = edges.filter(
    (e) => displayNodeIds.has(e.source) && displayNodeIds.has(e.target)
  );

  const getNodeTypeBadge = (type: string) => {
    switch (type) {
      case 'route':
        return 'bg-violet-950/60 text-violet-300 border-violet-800';
      case 'class':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800';
      case 'method':
      case 'function':
        return 'bg-teal-950/60 text-teal-300 border-teal-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setSide('head')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                side === 'head'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Head Version (v1.1)
            </button>
            <button
              onClick={() => setSide('base')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                side === 'base'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Base Version (v1.0)
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterChangedOnly}
              onChange={(e) => setFilterChangedOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Show Changed Nodes Only</span>
          </label>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>
            <strong className="text-cyan-400">{displayNodes.length}</strong> Nodes
          </span>
          <span>•</span>
          <span>
            <strong className="text-teal-400">{displayEdges.length}</strong> Typed Edges
          </span>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh graph"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Graph Area and Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Node Explorer Canvas */}
        <div className="lg:col-span-2 border border-slate-800 rounded-xl bg-slate-950/80 p-5 min-h-[500px] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Typed Dependency Surface</span>
              <span className="text-[10px] text-slate-400">Click a node to inspect relationships</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {displayNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer font-mono text-xs ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/50'
                        : node.is_changed
                        ? 'bg-slate-900/90 border-amber-500/60 hover:border-amber-400'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getNodeTypeBadge(
                          node.type
                        )}`}
                      >
                        {node.type}
                      </span>
                      {node.is_changed && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-amber-950 text-amber-400 border border-amber-800/80 animate-pulse">
                          Changed
                        </span>
                      )}
                    </div>

                    <div className="font-semibold text-slate-100 truncate text-xs" title={node.label}>
                      {node.label}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate mt-1">
                      {node.file_path}:{node.line_number}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Changed Symbol</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>Connected Downstream / Upstream</span>
              </span>
            </div>
            <span>Provenance: AST Static & Framework Rules</span>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Node Provenance & Evidence</span>
            </h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Symbol Name
                </span>
                <span className="font-bold text-cyan-300 text-sm block break-all">
                  {selectedNode.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Type</span>
                  <span className="font-bold uppercase text-[11px]">{selectedNode.type}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span
                    className={`font-bold text-[11px] ${
                      selectedNode.is_changed ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {selectedNode.is_changed ? 'Modified in Diff' : 'Untouched'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Source Location</span>
                <span className="text-[11px] text-slate-300 block break-all">
                  {selectedNode.file_path}:{selectedNode.line_number}
                </span>
              </div>

              {/* Connected Relationships */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                  Verified Edges
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {edges
                    .filter(
                      (e) => e.source === selectedNode.id || e.target === selectedNode.id
                    )
                    .map((edge) => {
                      const isOutgoing = edge.source === selectedNode.id;
                      return (
                        <div
                          key={edge.id}
                          className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase">
                              {isOutgoing ? `↳ ${edge.type}` : `← ${edge.type}`}
                            </span>
                            <span className="text-[9px] text-slate-400 px-1 rounded bg-slate-900 border border-slate-800">
                              {edge.provenance}
                            </span>
                          </div>
                          <div className="text-slate-300 truncate" title={isOutgoing ? edge.target : edge.source}>
                            {isOutgoing ? edge.target : edge.source}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onInspectNode(selectedNode.file_path, selectedNode.line_number)}
                  className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Inspect in Source Viewer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Layers className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <span>Select any node on the left to inspect its proven dependencies and source lines.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
