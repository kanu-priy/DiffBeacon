import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Compass, Search, ShieldCheck, Terminal, Sparkles } from 'lucide-react';

interface Props {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenCommandPalette }) => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-white bg-[#1c2233] border-[#2d364f] shadow-sm'
      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121622] border-transparent';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1b202e] bg-[#08090d]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#141824] border border-[#262e42] text-indigo-400 font-mono font-bold text-sm group-hover:border-indigo-500/50 group-hover:text-indigo-300 transition-all shadow-inner">
            Δ
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white">DiffBeacon</span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 rounded">
                v1.4
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono leading-none">Code-Change Intelligence</span>
          </div>
        </Link>

        {/* Global Quick Search (Cmd+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e111a] hover:bg-[#131722] border border-[#1e2436] hover:border-[#2a334a] text-xs text-slate-400 transition-all w-64 lg:w-80 group cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0" />
          <span className="truncate text-slate-400 group-hover:text-slate-300">Quick jump symbols, diffs...</span>
          <kbd className="ml-auto font-mono text-[10px] text-slate-400 bg-[#161a26] px-1.5 py-0.5 rounded border border-[#232a3e]">
            ⌘K
          </kbd>
        </button>

        {/* Navigation & Live Status */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 text-xs font-medium">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${isActive('/dashboard') || isActive('/app/dashboard')}`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Workspaces</span>
            </Link>
            <Link
              to="/languages"
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${isActive('/languages') || isActive('/app/languages')}`}
            >
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>Languages</span>
            </Link>
            <Link
              to="/demo"
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${isActive('/demo')}`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Demo</span>
            </Link>
            <Link
              to="/settings"
              className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${isActive('/settings') || isActive('/app/settings')}`}
              title="Settings & AI Providers"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#1b202e] text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 bg-[#0e111a] px-2.5 py-1 rounded-md border border-[#1b202e]">
              <span className="live-dot" />
              <span className="text-slate-300">AST Engine Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
