'use client';

import { useState } from 'react';
import { Download, X, Copy, Check, FileText } from 'lucide-react';

interface BatchCitationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BatchCitationExportModal({ isOpen, onClose }: BatchCitationExportModalProps) {
  const [format, setFormat] = useState<'bib' | 'ris' | 'txt'>('bib');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleBib = `@article{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, {\L}ukasz and Polosukhin, Illia},
  journal={Advances in neural information processing systems},
  volume={30},
  year={2017}
}

@article{devlin2018bert,
  title={BERT: Pre-training of deep bidirectional transformers for language understanding},
  author={Devlin, Jacob and Chang, Ming-Wei and Lee, Kenton and Toutanova, Kristina},
  journal={arXiv preprint arXiv:1810.04805},
  year={2018}
}`;

  function copyText() {
    navigator.clipboard.writeText(sampleBib);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadFile() {
    const element = document.createElement('a');
    const file = new Blob([sampleBib], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `researchhub_citations.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-lg border border-line dark:border-darkLine shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-teal-400" />
            <h3 className="font-bold text-sm">Multi-Paper Batch Bibliography Exporter</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Export Format:</label>
            <div className="flex gap-2">
              {(['bib', 'ris', 'txt'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-1 text-xs font-bold rounded uppercase transition ${format === f ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-darkPanel text-slate-700 dark:text-slate-300'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Formatted Bibliography Stream (2 Selected Papers):</label>
            <pre className="p-4 bg-slate-950 text-blue-100 font-mono text-xs rounded border border-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {sampleBib}
            </pre>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-darkPanel border-t border-line dark:border-darkLine flex justify-between items-center">
          <button
            onClick={copyText}
            className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-xs font-bold hover:bg-slate-300 transition flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={downloadFile}
            className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark flex items-center gap-1.5"
          >
            <Download size={14} /> Download .{format} File
          </button>
        </div>
      </div>
    </div>
  );
}
