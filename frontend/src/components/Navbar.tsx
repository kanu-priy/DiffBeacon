import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Radio, Layers, Compass, Search, ShieldCheck } from 'lucide-react';

interface Props {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenCommandPalette }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/60'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-all duration-300">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 rounded-lg bg-cyan-400/10 blur group-hover:bg-cyan-400/20 transition-all" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                DiffBeacon
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                MVP
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5">
              See what a change touches.
            </span>
          </div>
        </Link>

        {/* Global Command Palette Trigger Bar */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-400 transition-all w-72 lg:w-96 cursor-pointer shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Search symbols, scenarios, diffs...</span>
          <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            <span>⌘K</span>
          </span>
        </button>

        {/* Navigation & Status */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${isActive('/dashboard')}`}
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/demo"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${isActive('/demo')}`}
            >
              <Compass className="w-4 h-4" />
              <span>Demo Workspace</span>
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 ml-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Zero-Fabrication</span>
          </div>
        </div>
      </div>
    </header>
  );
};
