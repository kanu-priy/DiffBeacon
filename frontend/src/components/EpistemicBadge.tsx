import React from 'react';
import { EpistemicProvenance } from '../types';
import { CheckCircle2, Cpu, Sparkles, AlertCircle, PlayCircle } from 'lucide-react';

interface Props {
  provenance: EpistemicProvenance | string;
  size?: 'sm' | 'md';
}

export const EpistemicBadge: React.FC<Props> = ({ provenance, size = 'sm' }) => {
  const norm = provenance.toLowerCase().replace(/ /g, '_');

  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    statically_established: {
      label: 'Statically Established',
      bg: 'bg-slate-900',
      text: 'text-slate-200',
      border: 'border-slate-700',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
    },
    framework_rule: {
      label: 'Framework Rule',
      bg: 'bg-blue-950/40',
      text: 'text-blue-300',
      border: 'border-blue-800/60',
      icon: <Cpu className="w-3 h-3 text-blue-400" />,
    },
    inferred: {
      label: 'Inferred',
      bg: 'bg-indigo-950/40',
      text: 'text-indigo-300',
      border: 'border-indigo-800/60',
      icon: <Sparkles className="w-3 h-3 text-indigo-400" />,
    },
    unresolved: {
      label: 'Unresolved / Unknown',
      bg: 'bg-amber-950/30',
      text: 'text-amber-300',
      border: 'border-amber-800/60',
      icon: <AlertCircle className="w-3 h-3 text-amber-400" />,
    },
    runtime_verified: {
      label: 'Runtime Verified',
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-300',
      border: 'border-emerald-700/80',
      icon: <PlayCircle className="w-3 h-3 text-emerald-400" />,
    },
  };

  const current = configs[norm] || {
    label: provenance,
    bg: 'bg-slate-900',
    text: 'text-slate-400',
    border: 'border-slate-800',
    icon: null,
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border font-mono ${current.bg} ${current.text} ${current.border} ${sizeClasses} shadow-sm`}
      title={`Analysis Classification: ${current.label}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
