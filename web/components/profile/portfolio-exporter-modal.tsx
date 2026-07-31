'use client';

import { useState } from 'react';
import { Download, Copy, Check, X, Code, FileText } from 'lucide-react';

interface PortfolioExporterModalProps {
  authorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PortfolioExporterModal({ authorName, isOpen, onClose }: PortfolioExporterModalProps) {
  const [format, setFormat] = useState<'latex' | 'markdown' | 'html'>('latex');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const latexCode = `% LaTeX BibTeX Bibliography for ${authorName}\n@article{smith2026deep,\n  title={Deep Residual Learning for Image Recognition},\n  author={Smith, John and Chen, Sarah},\n  journal={IEEE Transactions on Pattern Analysis},\n  year={2026}\n}`;

  const markdownCode = `## Publications by ${authorName}\n- **Deep Residual Learning for Image Recognition** (2026). *IEEE TPAMI*. DOI: 10.1109/TPAMI.2026.101\n- **Attention Mechanisms in Multimodal Architectures** (2025). *NeurIPS*.`;

  const htmlCode = `<div class="rh-portfolio">\n  <h3>${authorName} - Publications</h3>\n  <ul>\n    <li><strong>Deep Residual Learning for Image Recognition</strong> (2026)</li>\n  </ul>\n</div>`;

  const code = format === 'latex' ? latexCode : format === 'markdown' ? markdownCode : htmlCode;

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-lg bg-white dark:bg-darkCard border border-line dark:border-darkLine p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
          <div className="flex items-center gap-2">
            <Download className="text-primary" size={20} />
            <h3 className="font-bold text-base text-ink dark:text-white">
              Export Academic Portfolio & Publications
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-line dark:border-darkLine pb-2">
          {(['latex', 'markdown', 'html'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1 text-xs font-bold rounded uppercase transition ${
                format === fmt
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-darkPanel text-slate-600 dark:text-slate-300 hover:text-ink'
              }`}
            >
              {fmt === 'latex' ? 'LaTeX / BibTeX' : fmt === 'markdown' ? 'Markdown' : 'HTML Widget'}
            </button>
          ))}
        </div>

        <textarea
          readOnly
          value={code}
          rows={7}
          className="w-full border border-line rounded p-3 text-xs font-mono bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-white outline-none"
        />

        <div className="flex justify-between items-center pt-1">
          <span className="text-xs text-slate-500">Ready for CVs, personal websites, and LaTeX papers</span>
          <button
            onClick={handleCopy}
            className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-primaryDark transition flex items-center gap-1.5"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Snippet'}
          </button>
        </div>
      </div>
    </div>
  );
}
