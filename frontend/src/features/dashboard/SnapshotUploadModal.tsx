import React, { useState } from 'react';
import { X, Upload, FileArchive, AlertTriangle, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [headFile, setHeadFile] = useState<File | null>(null);
  const [baseLabel, setBaseLabel] = useState('v1.0-base');
  const [headLabel, setHeadLabel] = useState('v1.1-head');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseFile || !headFile) {
      setError('Please provide both a Base ZIP and a Head ZIP archive.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Upload Base
      setUploadStage('Sanitizing and extracting Base snapshot...');
      const baseFormData = new FormData();
      baseFormData.append('archive', baseFile);
      baseFormData.append('label', baseLabel || baseFile.name);
      const baseSnap = await api.uploadSnapshot(workspaceId, baseFormData);

      // Upload Head
      setUploadStage('Sanitizing and extracting Head snapshot...');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Upload Source Snapshots</h2>
              <p className="text-xs text-slate-400">Analyze changes between two repository versions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Base Snapshot File */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileArchive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Base Version (v1.0)</span>
                </span>
                {baseFile && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
              </div>

              <input
                type="text"
                placeholder="Label (e.g. main-v1.0)"
                value={baseLabel}
                onChange={(e) => setBaseLabel(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />

              <label className="block border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 rounded-lg p-4 text-center cursor-pointer transition-colors bg-slate-900/40">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setBaseFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <span className="text-xs text-slate-300 block truncate">
                  {baseFile ? baseFile.name : 'Select Base .ZIP Archive'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Up to 25 MB compressed</span>
              </label>
            </div>

            {/* Head Snapshot File */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <FileArchive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Head Version (v1.1)</span>
                </span>
                {headFile && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
              </div>

              <input
                type="text"
                placeholder="Label (e.g. PR-102-head)"
                value={headLabel}
                onChange={(e) => setHeadLabel(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />

              <label className="block border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 rounded-lg p-4 text-center cursor-pointer transition-colors bg-slate-900/40">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setHeadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <span className="text-xs text-slate-300 block truncate">
                  {headFile ? headFile.name : 'Select Head .ZIP Archive'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Up to 25 MB compressed</span>
              </label>
            </div>
          </div>

          {/* Security & Boundary Notice */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Zero-Trust Ingestion Boundaries</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              • Automatic ZipSlip path-traversal & zip-bomb protection. <br />
              • Zero code execution: DiffBeacon parses syntax purely via read-only Python AST. <br />
              • Uploaded code is never used to train public foundation models.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !baseFile || !headFile}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadStage || 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Evidence Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
