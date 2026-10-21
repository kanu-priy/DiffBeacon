import React from 'react';
import { UnknownEntry } from '../../types';
import { AlertTriangle, Wrench, FileCode, CheckCircle } from 'lucide-react';

interface Props {
  unknowns: UnknownEntry[];
  onInspectLine?: (filePath: string, line: number) => void;
}

export const UnknownsRegister: React.FC<Props> = ({ unknowns, onInspectLine }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">The Unknowns Register</h3>
          <p className="text-xs text-slate-400">
            First-class tracking of static analysis boundaries. DiffBeacon exposes what cannot be established deterministically instead of manufacturing hallucinations.
          </p>
        </div>
        <div className="text-xs font-mono text-amber-400 bg-amber-950/40 px-3 py-1 rounded border border-amber-800/60">
          <strong>{unknowns.length}</strong> Explicit Uncertainties
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {unknowns.map((entry) => (
          <div
            key={entry.id}
            className="p-5 rounded-xl bg-slate-900/80 border border-amber-900/40 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 font-sans">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <h4 className="text-sm font-bold text-slate-100">{entry.title}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-950/60 text-amber-400 border border-amber-800 font-mono">
                {entry.reason.replace('_', ' ')}
              </span>
            </div>

            {/* Code snippet if present */}
            {entry.code_snippet && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Static AST Observation:
                </span>
                <code>{entry.code_snippet}</code>
              </div>
            )}

            <div className="font-sans text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="font-semibold text-slate-200">Analysis Limit: </span>
              {entry.explanation}
            </div>

            <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-900/30 text-teal-200 font-sans text-xs flex items-start gap-2">
              <Wrench className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-300 block mb-0.5">Recommended Resolution Strategy:</span>
                <span>{entry.resolution_strategy}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
              <span>
                File: {entry.file_path} {entry.line_number ? `:${entry.line_number}` : ''}
              </span>
              {entry.line_number && onInspectLine && (
                <button
                  onClick={() => onInspectLine(entry.file_path, entry.line_number!)}
                  className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1 font-sans"
                >
                  <FileCode className="w-3 h-3" />
                  <span>Inspect in Source</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
