import React, { useState } from 'react';
import {
  X,
  Upload,
  FileArchive,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Download,
  Sparkles,
  ArrowRight,
  GitPullRequest,
  Key,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api';

interface Props {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onAnalysisCreated: (analysisId: string) => void;
}

export const SnapshotUploadModal: React.FC<Props> = ({
  workspaceId,
  isOpen,
  onClose,
  onAnalysisCreated,
}) => {
  const [ingestMode, setIngestMode] = useState<'zip' | 'github'>('zip');

  // ZIP Mode State
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [headFile, setHeadFile] = useState<File | null>(null);
  const [baseLabel, setBaseLabel] = useState('v1.0-base');
  const [headLabel, setHeadLabel] = useState('v1.1-head');
  const [isFetchingSamples, setIsFetchingSamples] = useState(false);

  // GitHub Mode State
  const [prReference, setPrReference] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Common Progress & Error State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickFillSample = async () => {
    setIsFetchingSamples(true);
    setError(null);
    try {
      const [baseRes, headRes] = await Promise.all([
        fetch('/api/v1/demo/sample-archive/?version=base'),
        fetch('/api/v1/demo/sample-archive/?version=head'),
      ]);

      if (!baseRes.ok || !headRes.ok) {
        throw new Error('Could not fetch sample archives from server.');
      }

      const baseBlob = await baseRes.blob();
      const headBlob = await headRes.blob();

      const sampleBaseFile = new File([baseBlob], 'beaconworks-base-v1.0.zip', {
        type: 'application/zip',
      });
      const sampleHeadFile = new File([headBlob], 'beaconworks-head-v1.1.zip', {
        type: 'application/zip',
      });

      setBaseFile(sampleBaseFile);
      setHeadFile(sampleHeadFile);
      setBaseLabel('beaconworks-v1.0');
      setHeadLabel('beaconworks-v1.1');
    } catch (err: any) {
      setError(err.message || 'Failed to load sample archives.');
    } finally {
      setIsFetchingSamples(false);
    }
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseFile || !headFile) {
      setError('Please provide both a Base ZIP and a Head ZIP archive.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Upload Base
      setUploadStage('Extracting and verifying Base snapshot...');
      const baseFormData = new FormData();
      baseFormData.append('archive', baseFile);
      baseFormData.append('label', baseLabel || baseFile.name);
      const baseSnap = await api.uploadSnapshot(workspaceId, baseFormData);

      // Upload Head
      setUploadStage('Extracting and verifying Head snapshot...');
      const headFormData = new FormData();
      headFormData.append('archive', headFile);
      headFormData.append('label', headLabel || headFile.name);
      const headSnap = await api.uploadSnapshot(workspaceId, headFormData);

      // Trigger Analysis
      setUploadStage('Executing 12-stage analysis pipeline...');
      const analysis = await api.triggerAnalysis({
        workspace: workspaceId,
        base_snapshot: baseSnap.id,
        head_snapshot: headSnap.id,
      });

      setIsUploading(false);
      onClose();
      onAnalysisCreated(analysis.id);
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || 'Failed to upload and analyze snapshots.');
    }
  };

  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prReference.trim()) {
      setError('Please enter a GitHub Pull Request URL or reference (e.g. owner/repo#123).');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadStage('Connecting to GitHub REST API...');

      const analysis = await api.analyzeGitHubPR({
        workspace_id: workspaceId,
        pr_reference: prReference.trim(),
        token: githubToken.trim() || undefined,
      });

      setIsUploading(false);
      onClose();
      onAnalysisCreated(analysis.id);
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || 'Failed to ingest and analyze GitHub Pull Request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-[#0c0f17] border border-[#1e2537] rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1b2130]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ingest Repository Changes</h2>
              <p className="text-xs text-slate-400">
                Analyze changes via ZIP archive snapshots or live GitHub Pull Requests.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#161c28] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ingest Mode Tabs */}
        <div className="flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => {
              setIngestMode('zip');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              ingestMode === 'zip'
                ? 'bg-indigo-950/70 text-indigo-200 border-indigo-700/60 font-semibold shadow-sm'
                : 'bg-[#101420] text-slate-400 border-[#1f2638] hover:text-white'
            }`}
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>Local ZIP Archives</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIngestMode('github');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              ingestMode === 'github'
                ? 'bg-indigo-950/70 text-indigo-200 border-indigo-700/60 font-semibold shadow-sm'
                : 'bg-[#101420] text-slate-400 border-[#1f2638] hover:text-white'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>GitHub Pull Request API</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: ZIP ARCHIVES */}
        {ingestMode === 'zip' && (
          <>
            {/* Quick Sample Helper Banner */}
            <div className="mt-4 p-3 rounded-xl bg-[#111624] border border-[#212b40] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Testing without ZIP files?</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Load our pre-packaged BeaconWorks API baseline and head change archives.
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickFillSample}
                disabled={isFetchingSamples || isUploading}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isFetchingSamples ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading…</span>
                  </>
                ) : (
                  <>
                    <span>Quick-Fill Sample ZIPs</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleZipSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Base Snapshot File */}
                <div className="p-4 rounded-xl border border-[#1e2537] bg-[#090c13] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                      <FileArchive className="w-3.5 h-3.5 text-slate-400" />
                      <span>Base Version (v1.0)</span>
                    </span>
                    {baseFile && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <input
                    type="text"
                    placeholder="Label (e.g. main-v1.0)"
                    value={baseLabel}
                    onChange={(e) => setBaseLabel(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[#0e121c] border border-[#232b3e] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />

                  <label className="block border-2 border-dashed border-[#232b3e] hover:border-indigo-500/60 rounded-lg p-4 text-center cursor-pointer transition-colors bg-[#0e121c]/50">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => setBaseFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <span className="text-xs text-slate-300 block truncate font-mono">
                      {baseFile ? baseFile.name : 'Select Base .ZIP Archive'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {baseFile
                        ? `${(baseFile.size / 1024).toFixed(1)} KB`
                        : 'Up to 25 MB compressed'}
                    </span>
                  </label>

                  <div className="text-right">
                    <a
                      href="/api/v1/demo/sample-archive/?version=base"
                      download="beaconworks-base-v1.0.zip"
                      className="text-[11px] text-slate-500 hover:text-indigo-400 font-mono inline-flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download sample Base ZIP</span>
                    </a>
                  </div>
                </div>

                {/* Head Snapshot File */}
                <div className="p-4 rounded-xl border border-[#1e2537] bg-[#090c13] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 font-mono">
                      <FileArchive className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Head Version (v1.1)</span>
                    </span>
                    {headFile && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <input
                    type="text"
                    placeholder="Label (e.g. PR-102-head)"
                    value={headLabel}
                    onChange={(e) => setHeadLabel(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[#0e121c] border border-[#232b3e] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />

                  <label className="block border-2 border-dashed border-[#232b3e] hover:border-indigo-500/60 rounded-lg p-4 text-center cursor-pointer transition-colors bg-[#0e121c]/50">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => setHeadFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <span className="text-xs text-slate-300 block truncate font-mono">
                      {headFile ? headFile.name : 'Select Head .ZIP Archive'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {headFile
                        ? `${(headFile.size / 1024).toFixed(1)} KB`
                        : 'Up to 25 MB compressed'}
                    </span>
                  </label>

                  <div className="text-right">
                    <a
                      href="/api/v1/demo/sample-archive/?version=head"
                      download="beaconworks-head-v1.1.zip"
                      className="text-[11px] text-slate-500 hover:text-indigo-400 font-mono inline-flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download sample Head ZIP</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Security & Ingestion Guarantees */}
              <div className="p-3.5 rounded-xl bg-[#090c13] border border-[#1b2130] text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Trust Ingestion Boundaries</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  • Automatic ZipSlip path-traversal & zip-bomb protection. <br />
                  • Zero arbitrary code execution: DiffBeacon parses syntax via read-only ASTs.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2130]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#161c28] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !baseFile || !headFile}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{uploadStage || 'Analyzing…'}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Run Analysis Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* TAB 2: GITHUB PULL REQUEST */}
        {ingestMode === 'github' && (
          <form onSubmit={handleGitHubSubmit} className="mt-4 space-y-4">
            <div className="p-4 rounded-xl border border-[#1e2537] bg-[#090c13] space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                GitHub Pull Request URL or Reference
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="https://github.com/owner/repo/pull/123 or owner/repo#123"
                  value={prReference}
                  onChange={(e) => setPrReference(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#0e121c] border border-[#232b3e] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Supports public and private repositories.</span>
                <button
                  type="button"
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>{showTokenInput ? 'Hide Token' : 'Add Personal Access Token'}</span>
                </button>
              </div>

              {showTokenInput && (
                <div className="pt-2 border-t border-[#1e2537] space-y-1.5 animate-fade-in">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (optional for public repos)"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0e121c] border border-[#232b3e] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Only requires `repo:read` scope. DiffBeacon processes tokens ephemerally in-memory and never logs or stores credentials.
                  </p>
                </div>
              )}
            </div>

            {/* Ingestion Pipeline Reassurance */}
            <div className="p-3.5 rounded-xl bg-[#090c13] border border-[#1b2130] text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Automated PR Ingestion & Diff Extraction</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                • Pulls base and head trees directly via authenticated GitHub API.<br />
                • Extracts AST symbols, serializer schemas, and dependencies without cloning the entire repository.<br />
                • Assembles the Change Story, Blast Radius Graph, and Verification Matrix.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2130]">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#161c28] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !prReference.trim()}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadStage || 'Analyzing PR…'}</span>
                  </>
                ) : (
                  <>
                    <GitPullRequest className="w-4 h-4" />
                    <span>Analyze Pull Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
