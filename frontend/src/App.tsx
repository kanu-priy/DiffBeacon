import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { ToastProvider } from './components/Toast';
import { LandingPage } from './features/dashboard/LandingPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { DemoWorkspace } from './features/dashboard/DemoWorkspace';
import { AnalysisWorkspace } from './features/changes/AnalysisWorkspace';
import { LanguageRegistryView } from './features/languages/LanguageRegistryView';
import { SettingsView } from './features/settings/SettingsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthPage } from './features/auth/AuthPage';
import { api, type AuthTokens } from './lib/api';

const AUTH_TOKEN_KEY = 'diffbeacon-auth-token';
const AUTH_USER_KEY = 'diffbeacon-auth-user';

const getStoredUser = () => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const App: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [authUser, setAuthUser] = useState(() => getStoredUser());

  useEffect(() => {
    if (authToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      api.getCurrentUser().catch(() => {
        setAuthToken(null);
        setAuthUser(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      });
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [authToken]);

  const handleAuthSuccess = (payload: AuthTokens) => {
    setAuthToken(payload.access);
    setAuthUser(payload.user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    authToken ? <>{children}</> : <Navigate to="/auth" replace />;

  const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    !authToken ? <>{children}</> : <Navigate to="/dashboard" replace />;

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
        <div className="app-shell min-h-screen flex flex-col text-slate-100">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />

          <Navbar
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            isAuthenticated={Boolean(authToken)}
            user={authUser}
            onLogout={handleLogout}
          />

          <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

          <main className="flex-1 relative z-10">
            <ErrorBoundary fallbackTitle="Page View Incident Detected">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<PublicOnlyRoute><AuthPage onAuthSuccess={handleAuthSuccess} /></PublicOnlyRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/app/workspaces" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/demo" element={<DemoWorkspace />} />
                <Route path="/languages" element={<ProtectedRoute><LanguageRegistryView /></ProtectedRoute>} />
                <Route path="/app/languages" element={<ProtectedRoute><LanguageRegistryView /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
                <Route path="/app/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
                <Route path="/app/settings/providers" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
                <Route path="/app/settings/security" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
                <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisWorkspace /></ProtectedRoute>} />
                <Route path="/analysis/:id/:subtab" element={<ProtectedRoute><AnalysisWorkspace /></ProtectedRoute>} />
                <Route path="/app/analyses/:id" element={<ProtectedRoute><AnalysisWorkspace /></ProtectedRoute>} />
                <Route path="/app/analyses/:id/:subtab" element={<ProtectedRoute><AnalysisWorkspace /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="footer-shell border-t border-white/10 py-6 text-center text-xs text-slate-500 relative z-10">
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
