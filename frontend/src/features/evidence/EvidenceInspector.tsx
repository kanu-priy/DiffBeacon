import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { FileCode, Loader2, AlertCircle, Eye, GitCompare } from 'lucide-react';

interface Props {
  analysisId: string;
  initialFilePath?: string;
  initialLineRange?: [number, number];
}

export const EvidenceInspector: React.FC<Props> = ({
  analysisId,
  initialFilePath = 'serializers.py',
  initialLineRange = [1, 30],
}) => {
  const [side, setSide] = useState<'head' | 'base'>('head');
  const [filePath, setFilePath] = useState(initialFilePath);
  const [highlightRange, setHighlightRange] = useState<[number, number]>(initialLineRange);

  useEffect(() => {
    if (initialFilePath) setFilePath(initialFilePath);
    if (initialLineRange) setHighlightRange(initialLineRange);
  }, [initialFilePath, initialLineRange]);

  const { data: fileData, isLoading, error } = useQuery({
    queryKey: ['file-content', analysisId, side, filePath],
    queryFn: () => api.getFileContent(analysisId, side, filePath),
    enabled: !!filePath,
  });

  const lines = fileData?.content ? fileData.content.split('\n') : [];

  return (
    <div className="space-y-4">
      {/* Top Header & Navigation */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 font-sans">
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

          <div className="flex items-center gap-2 text-slate-200 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">{fileData?.file_path || filePath}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-sans text-xs text-slate-400">
          <span>
            Highlighting Lines: <strong className="text-cyan-400 font-mono">L{highlightRange[0]} - L{highlightRange[1]}</strong>
          </span>
          <span>•</span>
          <span>Total Lines: {lines.length}</span>
        </div>
      </div>

      {/* Source Viewer with Line Highlights */}
      <div className="border border-slate-800 rounded-xl bg-slate-950 overflow-hidden font-mono text-xs shadow-2xl">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            <span className="text-xs">Loading verified source excerpt...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <span>{(error as any)?.message || 'File not found in this snapshot.'}</span>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted =
                    lineNum >= highlightRange[0] && lineNum <= highlightRange[1];

                  return (
                    <tr
                      key={lineNum}
                      className={`transition-colors ${
                        isHighlighted
                          ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                          : 'hover:bg-slate-900/60 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Line Number */}
                      <td className="w-12 px-3 py-0.5 text-right select-none text-slate-600 border-r border-slate-800/80 text-[11px]">
                        {lineNum}
                      </td>

                      {/* Code Content */}
                      <td className="px-4 py-0.5 text-slate-300 whitespace-pre text-[12px] leading-5">
                        <span
                          className={
                            isHighlighted ? 'text-cyan-100 font-semibold' : ''
                          }
                        >
                          {line || ' '}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
