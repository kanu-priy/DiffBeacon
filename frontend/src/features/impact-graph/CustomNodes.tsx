import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Network,
  Cpu,
  Layers,
  FileCode,
  Database,
  PlayCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export interface SymbolNodeData extends Record<string, unknown> {
  label: string;
  symbol_type: string;
  file_path: string;
  line_number: number;
  is_changed: boolean;
  metadata?: Record<string, any>;
  is_highlighted?: boolean;
  is_dimmed?: boolean;
  [key: string]: unknown;
}

const getNodeConfig = (type: string, isChanged: boolean) => {
  if (isChanged) {
    return {
      border: 'border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      bg: 'bg-gradient-to-b from-slate-900 to-amber-950/20',
      tagBg: 'bg-amber-950 text-amber-300 border border-amber-700/80',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />,
      glowColor: '#f59e0b',
    };
  }

  switch (type) {
    case 'route':
      return {
        border: 'border-violet-700/60 hover:border-violet-500',
        bg: 'bg-slate-900/95',
        tagBg: 'bg-violet-950/70 text-violet-300 border border-violet-800/80',
        icon: <Network className="w-3.5 h-3.5 text-violet-400" />,
        glowColor: '#8b5cf6',
      };
    case 'class':
      return {
        border: 'border-cyan-700/60 hover:border-cyan-500',
        bg: 'bg-slate-900/95',
        tagBg: 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80',
        icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />,
        glowColor: '#06b6d4',
      };
    case 'method':
    case 'function':
      return {
        border: 'border-teal-700/60 hover:border-teal-500',
        bg: 'bg-slate-900/95',
        tagBg: 'bg-teal-950/70 text-teal-300 border border-teal-800/80',
        icon: <Layers className="w-3.5 h-3.5 text-teal-400" />,
        glowColor: '#14b8a6',
      };
    case 'model':
      return {
        border: 'border-emerald-700/60 hover:border-emerald-500',
        bg: 'bg-slate-900/95',
        tagBg: 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80',
        icon: <Database className="w-3.5 h-3.5 text-emerald-400" />,
        glowColor: '#10b981',
      };
    case 'test':
      return {
        border: 'border-emerald-600/60 hover:border-emerald-400',
        bg: 'bg-slate-900/95',
        tagBg: 'bg-emerald-950 text-emerald-300 border border-emerald-700',
        icon: <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />,
        glowColor: '#10b981',
      };
    default:
      return {
        border: 'border-slate-800 hover:border-slate-700',
        bg: 'bg-slate-900/95',
        tagBg: 'bg-slate-800 text-slate-300 border border-slate-700',
        icon: <FileCode className="w-3.5 h-3.5 text-slate-400" />,
        glowColor: '#64748b',
      };
  }
};

export const CustomSymbolNode = memo(({ data }: NodeProps<any>) => {
  const nodeData = data as SymbolNodeData;
  const config = getNodeConfig(nodeData.symbol_type, nodeData.is_changed);

  const opacityClass = nodeData.is_dimmed ? 'opacity-25 scale-95' : 'opacity-100 scale-100';
  const highlightClass = nodeData.is_highlighted
    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105'
    : '';

  return (
    <div
      className={`relative rounded-xl border p-3 min-w-[220px] max-w-[280px] transition-all duration-200 select-none ${config.border} ${config.bg} ${opacityClass} ${highlightClass} shadow-xl backdrop-blur-md`}
    >
      {/* Target input handle (incoming callers) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-950 !-top-1.5 transition-transform hover:scale-125"
      />

      {/* Header Tag & Change Status */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-slate-950/80 border border-slate-800">
            {config.icon}
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${config.tagBg}`}>
            {nodeData.symbol_type}
          </span>
        </div>

        {nodeData.is_changed && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Changed</span>
          </span>
        )}
      </div>

      {/* Symbol Name */}
      <div className="font-mono text-xs font-bold text-slate-100 truncate mb-1" title={nodeData.label}>
        {nodeData.label}
      </div>

      {/* File & Line Location */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5 mt-1.5">
        <span className="truncate max-w-[140px]" title={nodeData.file_path}>
          {nodeData.file_path.split('/').pop()}
        </span>
        <span className="text-cyan-400/90 font-semibold">
          :{nodeData.line_number}
        </span>
      </div>

      {/* Source output handle (outgoing calls) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-teal-400 !border-2 !border-slate-950 !-bottom-1.5 transition-transform hover:scale-125"
      />
    </div>
  );
});

CustomSymbolNode.displayName = 'CustomSymbolNode';
