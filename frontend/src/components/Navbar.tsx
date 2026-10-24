import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Compass, Search, ShieldCheck, GitBranch } from 'lucide-react';

interface Props {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenCommandPalette }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-white bg-slate-800/80 border border-slate-700/80 shadow-sm'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-[#0a0d14]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono font-bold text-sm group-hover:border-blue-400 transition-colors">
            Δ
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-slate-100">
                DiffBeacon
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono tracking-wider font-semibold bg-slate-800 text-slate-300 border border-slate-700 rounded">
                v1.2
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5 font-sans">
              Behavioral Change Intelligence
            </span>
          </div>
        </Link>

        {/* Global Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-xs text-slate-400 transition-all w-72 lg:w-96 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-slate-400">Search symbols, scenarios, diffs...</span>
          <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            <span>⌘K</span>
          </span>
        </button>

        {/* Navigation & Status */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 text-xs font-medium">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${isActive('/dashboard')}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Workspaces</span>
            </Link>
            <Link
              to="/demo"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${isActive('/demo')}`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 ml-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AST Verification Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
