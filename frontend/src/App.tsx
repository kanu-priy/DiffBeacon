import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './features/dashboard/LandingPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { DemoWorkspace } from './features/dashboard/DemoWorkspace';
import { AnalysisWorkspace } from './features/changes/AnalysisWorkspace';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/demo" element={<DemoWorkspace />} />
            <Route path="/analysis/:id" element={<AnalysisWorkspace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>DiffBeacon — See what a change touches.</span>
            <span>Zero-Fabrication Code-Change Intelligence & Impact Analysis</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};
