import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Split,
  Layers,
  Cpu,
  Network,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ArrowRight,
  Code2,
  HelpCircle,
  Compass,
  X,
} from 'lucide-react';
import { api } from '../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  analysisId?: string;
  onSelectTab?: (tab: string) => void;
  onInspectSymbol?: (filePath: string, line: number) => void;
}

interface PaletteItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  analysisId,
  onSelectTab,
  onInspectSymbol,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const analysisFromRoute = location.pathname.match(/\/analysis\/([^/]+)/)?.[1];
  const liveAnalysisId = analysisId || analysisFromRoute;

  const { data: navigator } = useQuery({
    queryKey: ['navigator', liveAnalysisId],
    queryFn: () => api.getNavigator(liveAnalysisId!),
    enabled: isOpen && !!liveAnalysisId,
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const goToTabOrPage = (tabName: string) => {
    onClose();
    if (onSelectTab) onSelectTab(tabName);
    else if (liveAnalysisId) navigate(`/analysis/${liveAnalysisId}`);
    else navigate('/dashboard');
  };

  const jumpToCode = (filePath: string, line: number) => {
    onClose();
    if (onInspectSymbol) onInspectSymbol(filePath, line);
    else if (liveAnalysisId) navigate(`/analysis/${liveAnalysisId}`);
    else navigate('/dashboard');
  };

  const allItems: PaletteItem[] = useMemo(() => {
    const items: PaletteItem[] = [
      {
        id: 'tab-scenarios',
        category: 'Tabs',
        title: 'Scenario Studio',
        subtitle: 'Side-by-side execution trace simulator',
        icon: <Split className="w-4 h-4 text-violet-400" />,
        action: () => goToTabOrPage('scenarios'),
      },
      {
        id: 'tab-deltas',
        category: 'Tabs',
        title: 'Behavior Delta Ledger',
        subtitle: navigator ? `${navigator.counts.deltas} live deltas` : 'Behavioral changes between snapshots',
        icon: <Layers className="w-4 h-4 text-cyan-400" />,
        action: () => goToTabOrPage('deltas'),
      },
      {
        id: 'tab-contracts',
        category: 'Tabs',
        title: 'Contract Surface Map',
        subtitle: navigator ? `${navigator.counts.contracts} contract diffs` : 'Serializers, routes, models',
        icon: <Cpu className="w-4 h-4 text-teal-400" />,
        action: () => goToTabOrPage('contracts'),
      },
      {
        id: 'tab-graph',
        category: 'Tabs',
        title: 'Impact Explorer',
        subtitle: 'Dependency graph from the current analysis',
        icon: <Network className="w-4 h-4 text-emerald-400" />,
        action: () => goToTabOrPage('graph'),
      },
      {
        id: 'tab-verification',
        category: 'Tabs',
        title: 'Verification Matrix',
        subtitle: 'Sandbox execution against persisted cases',
        icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
        action: () => goToTabOrPage('verification'),
      },
      {
        id: 'tab-unknowns',
        category: 'Tabs',
        title: 'Unknowns Register',
        subtitle: 'Dynamic calls and runtime gaps',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        action: () => goToTabOrPage('unknowns'),
      },
      {
        id: 'tab-evidence',
        category: 'Tabs',
        title: 'Source Evidence',
        subtitle: 'Live snapshot file contents',
        icon: <FileCode className="w-4 h-4 text-slate-400" />,
        action: () => goToTabOrPage('evidence'),
      },
    ];

    const liveDeltas = navigator?.deltas || [];
    if (liveDeltas.length) {
      liveDeltas.forEach((delta) => {
        items.push({
          id: `delta-${delta.id}`,
          category: 'Changed Symbols',
          title: delta.symbol.split('.').pop() || delta.title,
          subtitle: `${delta.file_path}:${delta.line} — ${delta.title}`,
          icon: <Code2 className="w-4 h-4 text-cyan-400" />,
          action: () => jumpToCode(delta.file_path, delta.line),
        });
      });
    } else {
      items.push({
        id: 'sym-serializer',
        category: 'Changed Symbols',
        title: 'EmployeeCreateSerializer',
        subtitle: 'serializers.py:12 — department_id made optional with fallback',
        icon: <Code2 className="w-4 h-4 text-cyan-400" />,
        action: () => jumpToCode('serializers.py', 12),
      });
    }

    (navigator?.scenarios || []).forEach((scenario) => {
      items.push({
        id: `scen-${scenario.id}`,
        category: 'Live Scenarios',
        title: scenario.question,
        subtitle: scenario.target_symbol || scenario.status,
        icon: <HelpCircle className="w-4 h-4 text-violet-400" />,
        action: () => goToTabOrPage('scenarios'),
      });
    });

    items.push({
      id: 'act-dash',
      category: 'Quick Actions',
      title: 'Open workspaces dashboard',
      subtitle: 'Manage your own snapshots and analyses',
      icon: <Layers className="w-4 h-4 text-slate-400" />,
      action: () => {
        onClose();
        navigate('/dashboard');
      },
    });

    return items;
  }, [navigator, liveAnalysisId]);

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filteredItems[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0c1220] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-slate-900/60 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a symbol, scenario, or view (e.g. 'serializer', 'salary', 'graph')..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No matching symbols or commands found for "{query}".</div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-cyan-950/70 border border-cyan-800/80' : 'hover:bg-slate-900/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-slate-950 border border-white/10 shrink-0">{item.icon}</div>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-200' : 'text-slate-200'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
