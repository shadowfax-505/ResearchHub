'use client';

import { useState } from 'react';
import { Code, X, Sparkles, Check, Copy } from 'lucide-react';

interface BibtexNormalizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BibtexNormalizerModal({ isOpen, onClose }: BibtexNormalizerModalProps) {
  const [dirty, setDirty] = useState(`@article{1, title={Attention is all you need}, author={vaswani, ashish and shazeer, noam}, year={2017}}`);
  const [clean, setClean] = useState('');
  const [cleaning, setCleaning] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  function handleClean(e: React.FormEvent) {
    e.preventDefault();
    setCleaning(true);
    setTimeout(() => {
      setCleaning(false);
      setClean(`@article{vaswani2017attention,
  title     = {Attention Is All You Need},
  author    = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob},
  journal   = {Advances in Neural Information Processing Systems (NeurIPS)},
  volume    = {30},
  year      = {2017},
  publisher = {Curran Associates, Inc.}
}`);
    }, 800);
  }

  function copyCode() {
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-lg border border-line dark:border-darkLine shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code size={18} className="text-teal-400" />
            <h3 className="font-bold text-sm">AI BibTeX Syntax Cleaner & Key Normalizer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleClean} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Paste Raw / Messy BibTeX Code:</label>
            <textarea
              rows={3}
              value={dirty}
              onChange={(e) => setDirty(e.target.value)}
              className="w-full font-mono text-xs p-3 border border-line dark:border-darkLine rounded bg-slate-50 dark:bg-darkPanel dark:text-white outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={cleaning}
            className="w-full py-2 bg-gradient-to-r from-primary to-teal-600 text-white font-bold text-xs rounded shadow hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            {cleaning ? 'Normalizing Citation Syntax...' : 'Clean & Standardize BibTeX'}
          </button>

          {clean && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Normalized Standardized BibTeX Output:</label>
              <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {clean}
              </pre>
            </div>
          )}
        </form>

        <div className="p-4 bg-slate-50 dark:bg-darkPanel border-t border-line dark:border-darkLine flex justify-between items-center">
          {clean ? (
            <button
              onClick={copyCode}
              className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-xs font-bold hover:bg-slate-300 transition flex items-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copied Clean BibTeX' : 'Copy Clean BibTeX'}
            </button>
          ) : <div />}
          <button onClick={onClose} className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
