'use client';

import { useState } from 'react';
import { FileText, X, Sparkles, Check } from 'lucide-react';

interface GrantProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GrantProposalModal({ isOpen, onClose }: GrantProposalModalProps) {
  const [agency, setAgency] = useState('NSF (National Science Foundation)');
  const [title, setTitle] = useState('Scalable Multimodal Deep Learning for Genomic Sequencing');
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState('');

  if (!isOpen) return null;

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setProposal(`1. PROJECT SUMMARY & INTELLECTUAL MERIT
This proposal targets scalable multimodal representation learning for genomic variants using low-rank transformer adaptation.

2. SPECIFIC AIMS
- Aim 1: Develop sub-quadratic attention kernels for 1M+ token genomic sequences.
- Aim 2: Validate variant pathogenicity predictions against ClinVar benchmark datasets.
- Aim 3: Deploy open-source pre-trained model weights on ResearchHub repository.

3. BROADER IMPACTS
Advances precision medicine research by enabling real-time variant prioritization across underrepresented populations.`);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-lg border border-line dark:border-darkLine shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-teal-400" />
            <h3 className="font-bold text-sm">AI Academic Grant Proposal Outline Assistant</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Funding Agency</label>
              <select
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full text-xs p-2.5 border border-line dark:border-darkLine rounded bg-slate-50 dark:bg-darkPanel dark:text-white outline-none focus:border-primary"
              >
                <option value="NSF (National Science Foundation)">NSF (National Science Foundation)</option>
                <option value="NIH (National Institutes of Health)">NIH (National Institutes of Health)</option>
                <option value="Horizon Europe Research Grant">Horizon Europe Research Grant</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 border border-line dark:border-darkLine rounded bg-slate-50 dark:bg-darkPanel dark:text-white outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full py-2 bg-gradient-to-r from-primary to-teal-600 text-white font-bold text-xs rounded shadow hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            {generating ? 'Generating Proposal Outline...' : 'Generate Proposal Outline'}
          </button>

          {proposal && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Drafted Proposal Outline:</label>
              <pre className="p-4 bg-slate-950 text-blue-100 font-mono text-xs rounded border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {proposal}
              </pre>
            </div>
          )}
        </form>

        <div className="p-4 bg-slate-50 dark:bg-darkPanel border-t border-line dark:border-darkLine flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
