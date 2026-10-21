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
      bg: 'bg-teal-950/40',
      text: 'text-teal-400',
      border: 'border-teal-700/60',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    framework_rule: {
      label: 'Framework Rule',
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-400',
      border: 'border-cyan-700/60',
      icon: <Cpu className="w-3 h-3" />,
    },
    inferred: {
      label: 'Inferred',
      bg: 'bg-violet-950/40',
      text: 'text-violet-400',
      border: 'border-violet-700/60',
      icon: <Sparkles className="w-3 h-3" />,
    },
    unresolved: {
      label: 'Unresolved / Unknown',
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      border: 'border-amber-700/60',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    runtime_verified: {
      label: 'Runtime Verified',
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-700/60',
      icon: <PlayCircle className="w-3 h-3" />,
    },
  };

  const current = configs[norm] || {
    label: provenance,
    bg: 'bg-slate-900',
    text: 'text-slate-400',
    border: 'border-slate-800',
    icon: null,
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
      title={`Epistemic Classification: ${current.label}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
