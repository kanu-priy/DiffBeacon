import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Command,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  analysisId?: string;
  onSelectTab?: (tab: string) => void;
  onInspectSymbol?: (filePath: string, line: number) => void;
}

interface PaletteItem {
  id: string;
  category: 'Tabs' | 'Changed Symbols' | 'Predefined Scenarios' | 'Quick Actions';
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

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const goToTabOrPage = (tabName: string) => {
    onClose();
    if (onSelectTab) {
      onSelectTab(tabName);
    } else {
      // If outside analysis workspace, navigate to demo workspace
      navigate('/demo');
    }
  };

  const jumpToCode = (filePath: string, line: number) => {
    onClose();
    if (onInspectSymbol) {
      onInspectSymbol(filePath, line);
    } else if (onSelectTab) {
      onSelectTab('evidence');
    } else {
      navigate('/demo');
    }
  };

  const allItems: PaletteItem[] = [
    // Change Story Views
    {
      id: 'tab-scenarios',
      category: 'Tabs',
      title: 'Scenario Studio',
      subtitle: 'Side-by-side execution trace simulator & divergence detector',
      icon: <Split className="w-4 h-4 text-violet-400" />,
      action: () => goToTabOrPage('scenarios'),
    },
    {
      id: 'tab-deltas',
      category: 'Tabs',
      title: 'Behavior Delta Ledger',
      subtitle: '8 categorized behavioral changes between Base and Head',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      action: () => goToTabOrPage('deltas'),
    },
    {
      id: 'tab-contracts',
      category: 'Tabs',
      title: 'Contract Surface Map',
      subtitle: 'DRF serializers, URL routes, and database models',
      icon: <Cpu className="w-4 h-4 text-teal-400" />,
      action: () => goToTabOrPage('contracts'),
    },
    {
      id: 'tab-graph',
      category: 'Tabs',
      title: 'Evidence-backed Impact Explorer',
      subtitle: 'Interactive dependency graph canvas with blast-radius focus',
      icon: <Network className="w-4 h-4 text-emerald-400" />,
      action: () => goToTabOrPage('graph'),
    },
    {
      id: 'tab-verification',
      category: 'Tabs',
      title: 'Verification Matrix',
      subtitle: 'Test recommendations and sandbox execution plans',
      icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
      action: () => goToTabOrPage('verification'),
    },
    {
      id: 'tab-unknowns',
      category: 'Tabs',
      title: 'Unknowns Register',
      subtitle: 'Explicit catalog of dynamic calls, missing config & runtime state',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      action: () => goToTabOrPage('unknowns'),
    },
    {
      id: 'tab-evidence',
      category: 'Tabs',
      title: 'Source Code & Split Diff Inspector',
      subtitle: 'Read-only verified snapshots with Python syntax highlighting',
      icon: <FileCode className="w-4 h-4 text-slate-400" />,
      action: () => goToTabOrPage('evidence'),
    },

    // Changed Symbols
    {
      id: 'sym-serializer',
      category: 'Changed Symbols',
      title: 'EmployeeCreateSerializer',
      subtitle: 'serializers.py:12 — department_id made optional with fallback',
      icon: <Code2 className="w-4 h-4 text-cyan-400" />,
      action: () => jumpToCode('serializers.py', 12),
    },
    {
      id: 'sym-view',
      category: 'Changed Symbols',
      title: 'EmployeeCreateView',
      subtitle: 'views.py:15 — Raised salary minimum threshold from $30k to $45k',
      icon: <Code2 className="w-4 h-4 text-cyan-400" />,
      action: () => jumpToCode('views.py', 15),
    },
    {
      id: 'sym-model',
      category: 'Changed Symbols',
      title: 'Employee.status Field Default',
      subtitle: 'models.py:20 — Changed default status from probation to active',
      icon: <Code2 className="w-4 h-4 text-cyan-400" />,
      action: () => jumpToCode('models.py', 20),
    },
    {
      id: 'sym-payroll',
      category: 'Changed Symbols',
      title: 'PayrollService.calculate_payroll',
      subtitle: 'services/payroll.py:18 — Tax deduction rate increased from 15% to 20%',
      icon: <Code2 className="w-4 h-4 text-cyan-400" />,
      action: () => jumpToCode('services/payroll.py', 18),
    },
    {
      id: 'sym-ssn',
      category: 'Changed Symbols',
      title: 'legacy_format_ssn [Broken Reference]',
      subtitle: 'services/reporting.py:14 — Function deleted in Head, caller raises NameError',
      icon: <Code2 className="w-4 h-4 text-rose-400" />,
      action: () => jumpToCode('services/reporting.py', 14),
    },
    {
      id: 'sym-notify',
      category: 'Changed Symbols',
      title: 'send_notification (Dynamic Dispatch)',
      subtitle: 'services/notifications.py:10 — Dynamic getattr calls require runtime inspection',
      icon: <Code2 className="w-4 h-4 text-amber-400" />,
      action: () => jumpToCode('services/notifications.py', 10),
    },

    // Predefined Scenarios
    {
      id: 'scen-dept',
      category: 'Predefined Scenarios',
      title: 'What happens if a request omits department_id now?',
      subtitle: 'Traces execution branch from 400 Bad Request to unassigned fallback',
      icon: <HelpCircle className="w-4 h-4 text-violet-400" />,
      action: () => goToTabOrPage('scenarios'),
    },
    {
      id: 'scen-salary',
      category: 'Predefined Scenarios',
      title: 'What happens if an employee salary is under $45,000?',
      subtitle: 'Traces validation rejection in Head that previously succeeded in Base',
      icon: <HelpCircle className="w-4 h-4 text-violet-400" />,
      action: () => goToTabOrPage('scenarios'),
    },
    {
      id: 'scen-event',
      category: 'Predefined Scenarios',
      title: 'What happens when an event notification triggers unknown handler?',
      subtitle: 'Evaluates dynamic getattr dispatch failure and fallback logic',
      icon: <HelpCircle className="w-4 h-4 text-violet-400" />,
      action: () => goToTabOrPage('scenarios'),
    },

    // Quick Actions
    {
      id: 'act-demo',
      category: 'Quick Actions',
      title: 'Open BeaconWorks API Demo',
      subtitle: 'Launch full interactive walkthrough with pre-seeded Django REST data',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onClose();
        navigate('/demo');
      },
    },
    {
      id: 'act-dash',
      category: 'Quick Actions',
      title: 'Go to Workspaces Dashboard',
      subtitle: 'Manage snapshot archives and view recent analyses',
      icon: <Layers className="w-4 h-4 text-slate-400" />,
      action: () => {
        onClose();
        navigate('/dashboard');
      },
    },
  ];

  // Filter items based on query
  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#0e1320] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/60 gap-3">
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
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[420px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching symbols or commands found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/70 border border-cyan-800/80 shadow-sm'
                      : 'hover:bg-slate-900/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-200' : 'text-slate-200'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">esc</kbd>
              <span>to close</span>
            </span>
          </div>

          <span className="font-mono text-cyan-400/80 text-[10px]">DiffBeacon Navigator</span>
        </div>
      </div>
    </div>
  );
};
