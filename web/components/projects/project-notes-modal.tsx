'use client';

import { useState } from 'react';
import { FileText, X, Save, Check } from 'lucide-react';

interface ProjectNotesModalProps {
  projectId: number;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectNotesModal({ projectId, projectTitle, isOpen, onClose }: ProjectNotesModalProps) {
  const [notes, setNotes] = useState(
    `# Research & Experiment Notes for ${projectTitle}\n\n## Objectives\n1. Validate neural attention convergence under noisy inputs.\n2. benchmark inference latency across 4 GPU node clusters.\n\n## Current Findings\n- Layer normalization step reduces gradient explosion by ~42%.\n- Batch size 64 provides optimal memory balance.`
  );
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-darkCard border border-line dark:border-darkLine p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            <h3 className="font-bold text-base text-ink dark:text-white">
              Collaborative Project Notes & Experiment Log
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Project: {projectTitle}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            className="w-full border border-line rounded p-3 text-xs font-mono bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-white outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">Auto-saved to team cloud notebook</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-primaryDark transition flex items-center gap-1.5"
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? 'Notes Saved!' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
