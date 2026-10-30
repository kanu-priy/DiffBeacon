import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Compass, Search, Settings, Terminal, Activity } from 'lucide-react';

interface Props {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenCommandPalette }) => {
  const location = useLocation();

  const linkClass = (path: string) =>
    location.pathname === path
      ? 'text-[#e8f3d0] bg-[#19231c] border-[#354638]'
      : 'text-[#969f96] hover:text-white hover:bg-[#101410] border-transparent';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#202720] bg-[#090c09]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-[#d6fa64] flex items-center justify-center font-mono font-bold text-[#18211c] text-sm">
            Δ
          </div>
          <span className="font-semibold text-sm text-white tracking-tight">
            DiffBeacon
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#666] border border-[#333] rounded bg-[#111]">
            v2.0
          </span>
        </Link>

        {/* Search */}
        <button
          onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#273027] bg-[#101410] hover:border-[#3b493b] text-xs text-[#858f85] w-64 lg:w-72 cursor-pointer transition-colors"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Search files, symbols...</span>
          <kbd className="ml-auto font-mono text-[10px] text-[#555] bg-[#111] px-1.5 py-0.5 rounded border border-[#222]">
            ⌘K
          </kbd>
        </button>

        {/* Nav */}
        <div className="flex items-center gap-1.5">
          <nav className="flex items-center gap-1 text-xs font-medium">
            <Link to="/dashboard" className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${linkClass('/dashboard')}`}>
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Workspaces</span>
            </Link>
            <Link to="/demo" className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${linkClass('/demo')}`}>
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analyzer</span>
            </Link>
            <Link to="/languages" className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${linkClass('/languages')}`}>
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Languages</span>
            </Link>
            <Link to="/settings" className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${linkClass('/settings')}`}>
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-2 pl-2.5 ml-1.5 border-l border-[#222]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#666]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Engine ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
