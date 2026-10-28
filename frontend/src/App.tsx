import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { ToastProvider } from './components/Toast';
import { LandingPage } from './features/dashboard/LandingPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { DemoWorkspace } from './features/dashboard/DemoWorkspace';
import { AnalysisWorkspace } from './features/changes/AnalysisWorkspace';

export const App: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen flex flex-col text-slate-100">
          <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
          />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/demo" element={<DemoWorkspace />} />
              <Route path="/analysis/:id" element={<AnalysisWorkspace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>DiffBeacon — See what a change touches.</span>
              <span>Live pipeline · zero fabricated citations</span>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
};
