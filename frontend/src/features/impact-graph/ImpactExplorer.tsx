import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ImpactGraphData, GraphNode as ApiGraphNode, GraphEdge as ApiGraphEdge } from '../../types';
import { api } from '../../lib/api';
import { CustomSymbolNode, SymbolNodeData } from './CustomNodes';
import {
  Layers,
  ArrowRight,
  Filter,
  FileCode,
  Info,
  Maximize2,
  RefreshCw,
  Search,
  Target,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface Props {
  analysisId: string;
  onInspectNode: (filePath: string, line: number) => void;
}

const nodeTypes = {
  symbolNode: CustomSymbolNode,
};

export const ImpactExplorer: React.FC<Props> = ({ analysisId, onInspectNode }) => {
  const [side, setSide] = useState<'head' | 'base'>('head');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [blastRadiusOnly, setBlastRadiusOnly] = useState(false);

  const { data: graphData, isLoading, refetch } = useQuery({
    queryKey: ['impact-graph', analysisId, side],
    queryFn: () => api.getImpactGraph(analysisId, side),
  });

  const rawNodes = graphData?.nodes || [];
  const rawEdges = graphData?.edges || [];

  // Categorize and position nodes in architectural layers
  const initialNodesAndEdges = useMemo(() => {
    if (!rawNodes.length) return { nodes: [], edges: [] };

    // Group nodes into architectural layers
    const layers: Record<string, ApiGraphNode[]> = {
      routes: [],
      views: [],
      serializers: [],
      services: [],
      models: [],
      tests: [],
      other: [],
    };

    rawNodes.forEach((n) => {
      if (n.type === 'route') layers.routes.push(n);
      else if (n.file_path.includes('tests') || n.type === 'test') layers.tests.push(n);
      else if (n.label.includes('View') || n.file_path.includes('views')) layers.views.push(n);
      else if (n.label.includes('Serializer') || n.file_path.includes('serializers')) layers.serializers.push(n);
      else if (n.type === 'class' && n.file_path.includes('models')) layers.models.push(n);
      else if (n.file_path.includes('services')) layers.services.push(n);
      else layers.other.push(n);
    });

    const layerYCoords: Record<string, number> = {
      routes: 50,
      views: 200,
      serializers: 360,
      services: 520,
      models: 680,
      tests: 840,
      other: 1000,
    };

    const flowNodes: Node[] = [];
    const nodeSpacingX = 300;

    Object.entries(layers).forEach(([layerKey, layerNodes]) => {
      const y = layerYCoords[layerKey] || 500;
      layerNodes.forEach((n, idx) => {
        flowNodes.push({
          id: n.id,
          type: 'symbolNode',
          position: { x: idx * nodeSpacingX + 80, y },
          data: {
            label: n.label,
            symbol_type: n.type,
            file_path: n.file_path,
            line_number: n.line_number,
            is_changed: n.is_changed,
            metadata: n.metadata,
          } as SymbolNodeData,
        });
      });
    });

    // Build flow edges with typing and markers
    const flowEdges: Edge[] = rawEdges.map((e) => {
      const isRouteEdge = e.type === 'routes_to';
      const isSerializerEdge = e.type === 'serializes';
      const isTestEdge = e.type === 'tests';

      let strokeColor = '#38bdf8'; // sky
      if (isRouteEdge) strokeColor = '#a855f7'; // purple
      else if (isSerializerEdge) strokeColor = '#22d3ee'; // cyan
      else if (isTestEdge) strokeColor = '#34d399'; // emerald

      return {
        id: `${e.source}->${e.target}[${e.type}]`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: isSerializerEdge || isRouteEdge,
        style: { stroke: strokeColor, strokeWidth: 1.8 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 14,
          height: 14,
        },
      };
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [rawNodes, rawEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesAndEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesAndEdges.edges);

  useEffect(() => {
    setNodes(initialNodesAndEdges.nodes);
    setEdges(initialNodesAndEdges.edges);
  }, [initialNodesAndEdges, setNodes, setEdges]);

  // Handle Blast Radius / Node Highlighting
  const activeHighlightedIds = useMemo(() => {
    if (!selectedNodeId && !searchQuery.trim() && !blastRadiusOnly) return null;

    const matched = new Set<string>();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rawNodes.forEach((n) => {
        if (n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)) {
          matched.add(n.id);
        }
      });
    } else if (blastRadiusOnly) {
      // Find all changed nodes and their 2-hop connected neighbors
      const changed = rawNodes.filter((n) => n.is_changed).map((n) => n.id);
      changed.forEach((cid) => matched.add(cid));

      rawEdges.forEach((e) => {
        if (matched.has(e.source) || matched.has(e.target)) {
          matched.add(e.source);
          matched.add(e.target);
        }
      });
    } else if (selectedNodeId) {
      matched.add(selectedNodeId);
      // Add 1-hop incoming and outgoing
      rawEdges.forEach((e) => {
        if (e.source === selectedNodeId) matched.add(e.target);
        if (e.target === selectedNodeId) matched.add(e.source);
      });
    }

    return matched;
  }, [selectedNodeId, searchQuery, blastRadiusOnly, rawNodes, rawEdges]);

  // Apply highlight/dim styles dynamically
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const isHighlighted = activeHighlightedIds ? activeHighlightedIds.has(n.id) : false;
        const isDimmed = activeHighlightedIds ? !activeHighlightedIds.has(n.id) : false;
        return {
          ...n,
          data: {
            ...n.data,
            is_highlighted: isHighlighted,
            is_dimmed: isDimmed,
          },
        };
      })
    );
  }, [activeHighlightedIds, setNodes]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedApiNode = useMemo(() => {
    return rawNodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, rawNodes]);

  const incomingEdges = useMemo(() => {
    if (!selectedNodeId) return [];
    return rawEdges.filter((e) => e.target === selectedNodeId);
  }, [selectedNodeId, rawEdges]);

  const outgoingEdges = useMemo(() => {
    if (!selectedNodeId) return [];
    return rawEdges.filter((e) => e.source === selectedNodeId);
  }, [selectedNodeId, rawEdges]);

  return (
    <div className="space-y-4 font-sans">
      {/* Top Toolbar */}
      <div className="surface-card p-4 border-[#1d2b22] flex flex-wrap items-center justify-between gap-4">
        {/* Left: Version Switcher & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg bg-[#080d0a] p-1 border border-[#1b281f]">
            <button
              onClick={() => {
                setSide('head');
                setSelectedNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                side === 'head'
                  ? 'bg-[#15241b] text-[#d6fa64] border border-[#2e4738] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Updated Version
            </button>
            <button
              onClick={() => {
                setSide('base');
                setSelectedNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                side === 'base'
                  ? 'bg-[#15241b] text-[#d6fa64] border border-[#2e4738] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Baseline Version
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter symbols in graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#080d0a] border border-[#1b281f] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#8fe6a9]/80 w-52 transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Focus Blast Radius */}
          <button
            onClick={() => {
              setBlastRadiusOnly(!blastRadiusOnly);
              setSelectedNodeId(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              blastRadiusOnly
                ? 'bg-amber-950/70 text-amber-300 border-amber-600'
                : 'bg-[#0c120e] text-slate-300 border-[#1d2b22] hover:border-[#2e4738]'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Focus Blast Radius</span>
          </button>
        </div>

        {/* Right Stats & Provenance Notice */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-300">{rawNodes.filter((n) => n.is_changed).length} Changed</span>
          </div>
          <span>•</span>
          <span>{rawNodes.length} Nodes</span>
          <span>•</span>
          <span>{rawEdges.length} Typed Edges</span>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded bg-[#0c120e] hover:bg-[#14231b] text-slate-300 border border-[#1d2b22] transition-colors cursor-pointer"
            title="Reload graph data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas with Side Drawer */}
      <div className="relative border border-[#1d2b22] rounded-2xl bg-[#060b09] overflow-hidden h-[680px] shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#1b281f" />
          <Controls className="!bg-[#0c120e] !border-[#1b281f] !text-slate-200" />
          <MiniMap
            nodeColor={(node: any) => (node.data?.is_changed ? '#f59e0b' : '#8fe6a9')}
            className="!bg-[#080d0a] !border-[#1b281f] !rounded-xl"
            maskColor="rgba(6, 11, 9, 0.85)"
          />
        </ReactFlow>

        {/* Floating Architectural Legend */}
        <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-[#080d0a]/90 border border-[#1d2b22] backdrop-blur-md text-[11px] font-mono text-slate-300 space-y-1 pointer-events-none select-none z-10 shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Topological Layers
          </div>
          <div className="flex items-center gap-1.5 text-violet-400">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span>Routes & Endpoints</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#d6fa64]">
            <span className="w-2 h-2 rounded-full bg-[#d6fa64]" />
            <span>DRF ViewSets & Serializers</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Business Logic & Services</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Models, Storage & Tests</span>
          </div>
        </div>

        {/* Selected Node Slide-Over Drawer */}
        {selectedApiNode && (
          <div className="absolute top-4 right-4 bottom-4 w-96 rounded-xl bg-[#0b110d]/95 border border-[#1d2b22] p-5 shadow-2xl backdrop-blur-md z-20 flex flex-col justify-between overflow-y-auto animate-fade-in font-mono text-xs">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1b2130]">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#13231a] text-[#8fe6a9] border border-[#213b2c]">
                    {selectedApiNode.type}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2 break-all">
                    {selectedApiNode.label}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#161c28] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="p-3 rounded-lg bg-[#090c13] border border-[#1b2130] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Change Intelligence
                </span>
                <span
                  className={`font-semibold text-xs block ${
                    selectedApiNode.is_changed ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  {selectedApiNode.is_changed
                    ? '⚡ Modified in this pull request'
                    : '✓ Untouched baseline code'}
                </span>
              </div>

              {/* Source Location */}
              <div className="p-3 rounded-lg bg-[#090c13] border border-[#1b2130] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Source Location
                </span>
                <span className="text-slate-200 block break-all text-[11px]">
                  {selectedApiNode.file_path}:{selectedApiNode.line_number}
                </span>
              </div>

              {/* Incoming Callers */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Incoming Callers ({incomingEdges.length})
                </span>
                {incomingEdges.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {incomingEdges.map((e, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#090c13] border border-[#1b2130] text-[11px] text-slate-300 truncate"
                        title={e.source}
                      >
                        <span className="text-[10px] font-bold text-[#8fe6a9] mr-1.5 uppercase">
                          ← {e.type}
                        </span>
                        {e.source.split('.').pop()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 block italic">No direct incoming edges</span>
                )}
              </div>

              {/* Outgoing Dependencies */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Outgoing Callees ({outgoingEdges.length})
                </span>
                {outgoingEdges.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {outgoingEdges.map((e, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#090c13] border border-[#1b2130] text-[11px] text-slate-300 truncate"
                        title={e.target}
                      >
                        <span className="text-[10px] font-bold text-[#8fe6a9] mr-1.5 uppercase">
                          ↳ {e.type}
                        </span>
                        {e.target.split('.').pop()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 block italic">No direct outgoing edges</span>
                )}
              </div>
            </div>

            {/* Jump to Source Button */}
            <div className="pt-4 border-t border-[#1b2130]">
              <button
                onClick={() =>
                  onInspectNode(selectedApiNode.file_path, selectedApiNode.line_number)
                }
                className="w-full py-2.5 rounded-xl bg-[#18281f] hover:bg-[#20362a] border border-[#2e4738] text-[#d6fa64] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Jump to Source Line in Viewer</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
