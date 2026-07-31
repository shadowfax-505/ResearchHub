'use client';

import { useState } from 'react';
import { Code, X, Copy, Check } from 'lucide-react';

interface LatexPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LatexPreviewModal({ isOpen, onClose }: LatexPreviewModalProps) {
  const [latex, setLatex] = useState('\\mathcal{L}_{loss} = \\mathbb{E}_{x \\sim p_{data}} [\\log D(x)] + \\mathbb{E}_{z \\sim p_z} [\\log (1 - D(G(z)))]');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  function copyCode() {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-lg border border-line dark:border-darkLine shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code size={18} className="text-teal-400" />
            <h3 className="font-bold text-sm">Interactive LaTeX Equation & Proof Previewer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter LaTeX Equation Syntax:
            </label>
            <textarea
              rows={4}
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className="w-full font-mono text-xs p-3 border border-line dark:border-darkLine rounded bg-slate-50 dark:bg-darkPanel dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Live Formatted Math Preview:
            </label>
            <div className="p-6 bg-slate-950 text-emerald-400 font-mono text-sm rounded border border-slate-800 flex items-center justify-center min-h-[100px] overflow-x-auto">
              <span className="text-base font-serif italic text-white leading-relaxed">{latex}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-darkPanel border-t border-line dark:border-darkLine flex justify-between items-center">
          <button
            onClick={copyCode}
            className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-xs font-bold hover:bg-slate-300 transition flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'Copied LaTeX' : 'Copy LaTeX Code'}
          </button>
          <button onClick={onClose} className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
