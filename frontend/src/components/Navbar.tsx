import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Compass, Search, ShieldCheck, Terminal, Sparkles, Activity } from 'lucide-react';

interface Props {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenCommandPalette }) => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-cyan-300 bg-cyan-950/70 border-cyan-500/50 shadow-[0_0_15px_-3px_rgba(6,182,212,0.35)] font-semibold'
      : 'text-slate-300 hover:text-white hover:bg-[#0c1635] border-transparent';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#040817]/85 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 font-mono font-black text-base shadow-[0_0_20px_-3px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-transform">
            <span className="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Δ</span>
            <div className="absolute inset-0 rounded-xl bg-cyan-400 blur-sm opacity-40 group-hover:opacity-75 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                DiffBeacon
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold">
                v1.4
              </span>
            </div>
            <span className="text-[10px] text-cyan-400/80 font-mono leading-none tracking-tight">
              Behavioral Impact Intelligence
            </span>
          </div>
        </Link>

        {/* Global Quick Search (Cmd+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#091129]/80 hover:bg-[#0f1b40] border border-cyan-500/20 hover:border-cyan-400/50 text-xs text-slate-300 transition-all w-64 lg:w-80 group cursor-pointer shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all shrink-0" />
          <span className="truncate text-slate-400 group-hover:text-slate-200">Search symbols, diffs, AST...</span>
          <kbd className="ml-auto font-mono text-[10px] text-cyan-300 bg-[#060c20] px-2 py-0.5 rounded-lg border border-cyan-500/30 shadow-inner">
            ⌘K
          </kbd>
        </button>

        {/* Navigation & Live Status */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 text-xs">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${isActive('/dashboard') || isActive('/app/dashboard')}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Workspaces</span>
            </Link>
            <Link
              to="/languages"
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${isActive('/languages') || isActive('/app/languages')}`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Languages</span>
            </Link>
            <Link
              to="/demo"
              className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${isActive('/demo')}`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent font-bold">
                Live Demo
              </span>
            </Link>
            <Link
              to="/settings"
              className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${isActive('/settings') || isActive('/app/settings')}`}
              title="Settings & AI Providers"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-cyan-500/20 text-[11px] font-mono">
            <div className="flex items-center gap-2 bg-[#081028] px-3 py-1.5 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_-4px_rgba(6,182,212,0.3)]">
              <span className="live-dot" />
              <span className="text-cyan-200 font-semibold tracking-tight">AST Engine Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
