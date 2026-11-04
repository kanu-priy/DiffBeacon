import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Search, Settings, Terminal, Scale, Play } from 'lucide-react';

interface Props {
  onOpenCommandPalette?: () => void;
  isAuthenticated?: boolean;
  user?: { username?: string; email?: string } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenCommandPalette, isAuthenticated, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const linkClass = (path: string) =>
    location.pathname === path
      ? 'text-[#e8f3d0] bg-[#19231c] border-[#354638]'
      : 'text-[#969f96] hover:text-white hover:bg-[#101410] border-transparent';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#202720] bg-[#090c09]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 shrink-0 group">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#d6fa64] flex items-center justify-center font-mono font-bold text-[#18211c] text-sm">
              Δ
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">DiffBeacon</span>
          </Link>
          <div className="hidden sm:block text-[10px] uppercase tracking-[0.18em] text-[#7e8c7d] font-mono">
            Behavioral Change Intelligence
          </div>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#273027] bg-[#101410] hover:border-[#3b493b] text-xs text-[#858f85] w-64 lg:w-72 cursor-pointer transition-colors"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Search symbols, scenarios, diffs...</span>
          <kbd className="ml-auto font-mono text-[10px] text-[#555] bg-[#111] px-1.5 py-0.5 rounded border border-[#222]">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1.5">
          <nav className="flex items-center gap-1 text-xs font-medium">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${linkClass('/dashboard')}`}>
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Workspaces</span>
            </Link>
            <Link to="/benchmarks" className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${linkClass('/benchmarks')}`}>
              <Scale className="w-3.5 h-3.5 text-[#d6fa64]" />
              <span className="hidden sm:inline">Benchmarks</span>
            </Link>
            <Link to={isAuthenticated ? '/languages' : '/auth'} className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${linkClass('/languages')}`}>
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Languages</span>
            </Link>
            <Link to={isAuthenticated ? '/settings' : '/auth'} className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${linkClass('/settings')}`}>
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </nav>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2.5 ml-1.5 border-l border-[#222]">
              <span className="hidden sm:inline text-[11px] font-mono text-[#cfe7c9]">{user?.username || 'Workspace'}</span>
              <button
                onClick={() => {
                  onLogout?.();
                  navigate('/auth');
                }}
                className="rounded-md border border-[#2f3d35] bg-[#111a14] px-2 py-1 text-[11px] text-[#dfead3] hover:border-[#4d6754]"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="rounded-md border border-[#2f3d35] bg-[#111a14] px-2.5 py-1.5 text-[11px] text-[#dfead3] hover:border-[#4d6754]"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
