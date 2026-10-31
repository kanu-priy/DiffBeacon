import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  FileCode,
  Loader2,
  AlertCircle,
  Columns,
  List,
  Search,
  Eye,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Hash,
} from 'lucide-react';

interface Props {
  analysisId: string;
  initialFilePath?: string;
  initialLineRange?: [number, number];
}

const FALLBACK_FILES = [
  { path: 'serializers.py', label: 'serializers.py', change: 'modified', desc: 'EmployeeCreateSerializer schema changes' },
  { path: 'views.py', label: 'views.py', change: 'modified', desc: 'EmployeeCreateView validation & error handling' },
  { path: 'models.py', label: 'models.py', change: 'modified', desc: 'Employee model field constraints' },
  { path: 'services.py', label: 'services.py', change: 'modified', desc: 'Department resolver fallback logic' },
];

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'while', 'for', 'in',
  'try', 'except', 'finally', 'raise', 'with', 'as', 'lambda', 'pass', 'break', 'continue',
  'async', 'await', 'yield', 'None', 'True', 'False', 'and', 'or', 'not', 'is', 'self'
]);

/**
 * Lightweight regex-based syntax highlighter for Python code tokens.
 */
function highlightPythonLine(line: string): React.ReactNode {
  if (!line) return <span> </span>;

  // Split tokens preserving whitespace, strings, comments, identifiers
  const tokenRegex = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@\w+)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|(\s+|[^\s\w])/g;
  
  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    const text = match[0];
    const key = `${match.index}-${text}`;

    if (match[1]) {
      // Comment
      elements.push(<span key={key} className="text-slate-500 italic">{text}</span>);
    } else if (match[2]) {
      // String literal
      elements.push(<span key={key} className="text-emerald-300">{text}</span>);
    } else if (match[3]) {
      // Decorator
      elements.push(<span key={key} className="text-amber-400 font-semibold">{text}</span>);
    } else if (match[4]) {
      // Number
      elements.push(<span key={key} className="text-purple-300">{text}</span>);
    } else if (match[5]) {
      // Identifier / Keyword
      if (PYTHON_KEYWORDS.has(text)) {
        elements.push(<span key={key} className="text-cyan-400 font-semibold">{text}</span>);
      } else if (text === 'Serializer' || text === 'Model' || text === 'APIView' || text === 'ViewSet') {
        elements.push(<span key={key} className="text-teal-300 font-bold">{text}</span>);
      } else {
        elements.push(<span key={key} className="text-slate-200">{text}</span>);
      }
    } else {
      // Punctuation, operators, whitespace
      elements.push(<span key={key} className="text-slate-400">{text}</span>);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  return <>{elements}</>;
}

export const EvidenceInspector: React.FC<Props> = ({
  analysisId,
  initialFilePath = 'serializers.py',
  initialLineRange = [1, 35],
}) => {
  const [filePath, setFilePath] = useState(initialFilePath);
  const [highlightRange, setHighlightRange] = useState<[number, number]>(initialLineRange);
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'head_only' | 'base_only'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncScroll, setSyncScroll] = useState(true);

  const baseScrollRef = useRef<HTMLDivElement>(null);
  const headScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  useEffect(() => {
    if (initialFilePath) setFilePath(initialFilePath);
    if (initialLineRange) setHighlightRange(initialLineRange);
  }, [initialFilePath, initialLineRange]);

  // Binary extensions that should not be displayed in source code viewer
  const BINARY_EXTENSIONS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'pdf', 'zip', 'tar', 'gz', 'pyc', 'exe', 'bin', 'woff', 'woff2', 'ttf', 'eot', 'db', 'sqlite3'
  ]);

  // Fetch Base snapshot file content
  const { data: fileIndex } = useQuery({
    queryKey: ['analysis-files', analysisId],
    queryFn: () => api.getAnalysisFiles(analysisId),
    enabled: !!analysisId,
  });

  const switcherFiles = useMemo(() => {
    const raw = fileIndex?.files && fileIndex.files.length > 0 ? fileIndex.files : FALLBACK_FILES;
    return raw
      .filter((f) => {
        const ext = (f.path || '').split('.').pop()?.toLowerCase() || '';
        return !BINARY_EXTENSIONS.has(ext);
      })
      .slice(0, 30);
  }, [fileIndex]);

  // Automatically select first modified or available file when loaded
  useEffect(() => {
    if (switcherFiles.length > 0) {
      const exists = switcherFiles.some((f) => f.path === filePath);
      if (!exists) {
        const modified = switcherFiles.find((f) => f.change === 'modified');
        setFilePath(modified ? modified.path : switcherFiles[0].path);
      }
    }
  }, [switcherFiles, filePath]);

  const {
    data: baseFileData,
    isLoading: isBaseLoading,
    error: baseError,
  } = useQuery({
    queryKey: ['file-content', analysisId, 'base', filePath],
    queryFn: () => api.getFileContent(analysisId, 'base', filePath),
    enabled: !!filePath,
  });

  // Fetch Head snapshot file content
  const {
    data: headFileData,
    isLoading: isHeadLoading,
    error: headError,
  } = useQuery({
    queryKey: ['file-content', analysisId, 'head', filePath],
    queryFn: () => api.getFileContent(analysisId, 'head', filePath),
    enabled: !!filePath,
  });

  const baseLines = useMemo(() => (baseFileData?.content ? baseFileData.content.split('\n') : []), [baseFileData]);
  const headLines = useMemo(() => (headFileData?.content ? headFileData.content.split('\n') : []), [headFileData]);

  // Synchronize scrolling between Base and Head panels
  const handleScroll = (source: 'base' | 'head') => {
    if (!syncScroll || isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    if (source === 'base' && baseScrollRef.current && headScrollRef.current) {
      headScrollRef.current.scrollTop = baseScrollRef.current.scrollTop;
      headScrollRef.current.scrollLeft = baseScrollRef.current.scrollLeft;
    } else if (source === 'head' && baseScrollRef.current && headScrollRef.current) {
      baseScrollRef.current.scrollTop = headScrollRef.current.scrollTop;
      baseScrollRef.current.scrollLeft = headScrollRef.current.scrollLeft;
    }

    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const jumpToCitation = () => {
    if (headScrollRef.current) {
      const targetLine = highlightRange[0];
      const approxLineHeight = 22;
      headScrollRef.current.scrollTop = Math.max(0, (targetLine - 5) * approxLineHeight);
    }
    if (baseScrollRef.current) {
      const targetLine = highlightRange[0];
      const approxLineHeight = 22;
      baseScrollRef.current.scrollTop = Math.max(0, (targetLine - 5) * approxLineHeight);
    }
  };

  // Compute simple diff summary
  const diffStats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    const baseSet = new Set(baseLines.map((l) => l.trim()));
    const headSet = new Set(headLines.map((l) => l.trim()));

    headLines.forEach((line) => {
      if (line.trim() && !baseSet.has(line.trim())) additions++;
    });
    baseLines.forEach((line) => {
      if (line.trim() && !headSet.has(line.trim())) deletions++;
    });

    return { additions, deletions };
  }, [baseLines, headLines]);

  return (
    <div className="space-y-4">
      {/* File Quick Switcher Bar */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Files:</span>
          </span>
          {(switcherFiles.length > 0 ? switcherFiles : FALLBACK_FILES).map((f: any) => {
            const isCurrent = filePath.endsWith(f.path) || f.path.endsWith(filePath);
            const label = f.label || f.path.split('/').pop() || f.path;
            return (
              <button
                key={f.path}
                onClick={() => {
                  setFilePath(f.path);
                  setHighlightRange([1, 35]);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/50'
                }`}
                title={f.desc || f.path}
              >
                <span>{label}</span>
                {f.change === 'modified' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* View Mode & Synchronized Scroll Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium cursor-pointer transition-colors ${
                viewMode === 'split' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Side-by-side comparison"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split Diff</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium cursor-pointer transition-colors ${
                viewMode === 'unified' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Unified vertical view"
            >
              <List className="w-3.5 h-3.5" />
              <span>Unified</span>
            </button>
            <button
              onClick={() => setViewMode('head_only')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                viewMode === 'head_only' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show updated version only"
            >
              Updated Only
            </button>
            <button
              onClick={() => setViewMode('base_only')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                viewMode === 'base_only' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show baseline version only"
            >
              Baseline Only
            </button>
          </div>
        </div>
      </div>

      {/* Control Banner: Active Citation & In-File Search */}
      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
            <span className="text-slate-400 text-[11px]">Selected:</span>
            <span className="text-cyan-300 font-bold">{filePath}</span>
          </div>

          <button
            onClick={jumpToCitation}
            className="flex items-center gap-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs"
            title="Scroll directly to the highlighted code citation"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Citation: Lines L{highlightRange[0]}–L{highlightRange[1]}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
            <span className="text-emerald-400 font-mono font-bold">+{diffStats.additions}</span>
            <span className="text-rose-400 font-mono font-bold">-{diffStats.deletions}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'split' && (
            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
              />
              <span>Sync Scroll</span>
            </label>
          )}

          {/* Quick Search in File */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter lines..."
              className="pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 w-36 sm:w-48 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Diff Code Display */}
      {isBaseLoading || isHeadLoading ? (
        <div className="p-20 text-center text-slate-400 space-y-3 border border-slate-800 rounded-xl bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <span className="text-xs">Loading verified source snapshots...</span>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl bg-slate-950 overflow-hidden font-mono text-xs shadow-2xl">
          {/* Split Mode */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {/* Left Column: Baseline */}
              <div className="flex flex-col h-[600px]">
                <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="font-semibold text-slate-300">Baseline Version</span>
                    <span className="text-slate-500 text-[11px] font-mono">({baseLines.length} lines)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Read-Only AST</span>
                </div>

                <div
                  ref={baseScrollRef}
                  onScroll={() => handleScroll('base')}
                  className="flex-1 overflow-auto bg-[#0b0f19] text-xs leading-5"
                >
                  {baseError ? (
                    <div className="p-8 text-center text-amber-400 text-xs">
                      File does not exist in Base snapshot (New file added in Head).
                    </div>
                  ) : (
                    <table className="w-full border-collapse">
                      <tbody>
                        {baseLines.map((line, idx) => {
                          const lineNum = idx + 1;
                          const isHighlighted =
                            lineNum >= highlightRange[0] && lineNum <= highlightRange[1];
                          const matchesSearch =
                            searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());

                          return (
                            <tr
                              key={lineNum}
                              className={`transition-colors ${
                                isHighlighted
                                  ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                                  : matchesSearch
                                  ? 'bg-yellow-950/40 border-l-4 border-yellow-400'
                                  : 'hover:bg-slate-900/50 border-l-4 border-transparent'
                              }`}
                            >
                              <td className="w-12 px-2.5 py-0.5 text-right select-none text-slate-600 border-r border-slate-800/80 text-[11px]">
                                {lineNum}
                              </td>
                              <td className="px-3 py-0.5 whitespace-pre overflow-x-hidden text-slate-300">
                                {highlightPythonLine(line)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Right Column: Updated */}
              <div className="flex flex-col h-[600px]">
                <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-semibold text-cyan-200">Updated Version</span>
                    <span className="text-slate-500 text-[11px] font-mono">({headLines.length} lines)</span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">Verified Citations</span>
                </div>

                <div
                  ref={headScrollRef}
                  onScroll={() => handleScroll('head')}
                  className="flex-1 overflow-auto bg-[#0b0f19] text-xs leading-5"
                >
                  {headError ? (
                    <div className="p-8 text-center text-rose-400 text-xs">
                      File was deleted in Head snapshot.
                    </div>
                  ) : (
                    <table className="w-full border-collapse">
                      <tbody>
                        {headLines.map((line, idx) => {
                          const lineNum = idx + 1;
                          const isHighlighted =
                            lineNum >= highlightRange[0] && lineNum <= highlightRange[1];
                          const matchesSearch =
                            searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());

                          return (
                            <tr
                              key={lineNum}
                              className={`transition-colors ${
                                isHighlighted
                                  ? 'bg-cyan-950/50 border-l-4 border-cyan-400 shadow-sm shadow-cyan-900/40'
                                  : matchesSearch
                                  ? 'bg-yellow-950/40 border-l-4 border-yellow-400'
                                  : 'hover:bg-slate-900/50 border-l-4 border-transparent'
                              }`}
                            >
                              <td className="w-12 px-2.5 py-0.5 text-right select-none text-slate-600 border-r border-slate-800/80 text-[11px]">
                                {lineNum}
                              </td>
                              <td className="px-3 py-0.5 whitespace-pre overflow-x-hidden text-slate-300">
                                {highlightPythonLine(line)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Unified Mode or Single Version */}
          {viewMode !== 'split' && (
            <div className="h-[600px] overflow-auto bg-[#0b0f19] text-xs leading-5">
              <table className="w-full border-collapse">
                <tbody>
                  {(viewMode === 'base_only' ? baseLines : headLines).map((line, idx) => {
                    const lineNum = idx + 1;
                    const isHighlighted =
                      lineNum >= highlightRange[0] && lineNum <= highlightRange[1];
                    const matchesSearch =
                      searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());

                    return (
                      <tr
                        key={lineNum}
                        className={`transition-colors ${
                          isHighlighted
                            ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                            : matchesSearch
                            ? 'bg-yellow-950/40 border-l-4 border-yellow-400'
                            : 'hover:bg-slate-900/50 border-l-4 border-transparent'
                        }`}
                      >
                        <td className="w-14 px-3 py-0.5 text-right select-none text-slate-600 border-r border-slate-800/80 text-[11px]">
                          {lineNum}
                        </td>
                        <td className="px-4 py-0.5 whitespace-pre text-slate-300">
                          {highlightPythonLine(line)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
