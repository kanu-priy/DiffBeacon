import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home, Copy, Check, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // In production, log to telemetry
    console.error('ErrorBoundary caught exception:', error, errorInfo);
  }

  private handleCopyDiagnostic = () => {
    const { error, errorInfo } = this.state;
    const diagnostic = `[DiffBeacon Incident Report]
Timestamp: ${new Date().toISOString()}
Error: ${error?.name}: ${error?.message}
Stack:
${error?.stack || 'No stack trace'}
Component Stack:
${errorInfo?.componentStack || 'No component stack'}
`;
    navigator.clipboard.writeText(diagnostic);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] p-6 surface-card border-rose-900/60 bg-[#0d0910] rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-2xl my-4">
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <h2 className="text-base font-bold text-white">
              {this.props.fallbackTitle || 'Component Incident Detected'}
            </h2>
            <p className="text-xs text-slate-400">
              An unexpected runtime error occurred while rendering this view. Your analysis data and repository state remain completely safe.
            </p>
          </div>

          {this.state.error && (
            <div className="w-full max-w-xl text-left bg-black/60 border border-rose-950 p-3 rounded-lg font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
              <span className="font-bold text-rose-400 block mb-1">
                {this.state.error.name}: {this.state.error.message}
              </span>
              <pre className="text-[10px] text-slate-500 whitespace-pre-wrap leading-tight">
                {this.state.error.stack?.split('\n').slice(1, 4).join('\n')}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Component</span>
            </button>

            <button
              onClick={this.handleCopyDiagnostic}
              className="px-3.5 py-2 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#232b3e] text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {this.state.copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Diagnostic</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Diagnostic</span>
                </>
              )}
            </button>

            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="px-3.5 py-2 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#232b3e] text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
