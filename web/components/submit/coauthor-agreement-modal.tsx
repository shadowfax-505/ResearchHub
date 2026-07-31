'use client';

import { useState } from 'react';
import { ShieldCheck, Check, X, FileText, UserCheck } from 'lucide-react';

interface CoauthorAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CoauthorAgreementModal({ isOpen, onClose, onConfirm }: CoauthorAgreementModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-lg bg-white dark:bg-darkCard border border-line dark:border-darkLine p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="text-primary" size={22} />
            <h3 className="font-bold text-base text-ink dark:text-white">
              CRediT Co-Author Contribution & Submission Checklist
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            Please confirm the following authoring guidelines before broadcasting your manuscript:
          </p>
          <ul className="space-y-2 pl-4 list-disc">
            <li><strong>Author Roles (CRediT Taxonomy):</strong> All listed co-authors contributed substantially to conceptualization, methodology, or drafting.</li>
            <li><strong>ORCID Verification:</strong> All author ORCIDs and institutional email addresses are accurate.</li>
            <li><strong>Plagiarism & Novelty Statement:</strong> Manuscript is original and free of uncredited copyrighted material.</li>
          </ul>

          <label className="flex items-center gap-2 p-3 rounded bg-slate-50 border border-slate-200 dark:bg-darkPanel dark:border-darkLine cursor-pointer pt-3 mt-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="accent-primary size-4"
            />
            <span className="font-bold text-ink dark:text-white">
              I verify that all co-authors have approved this manuscript for indexing.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-line dark:border-darkLine">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            disabled={!agreed}
            onClick={onConfirm}
            className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-primaryDark transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Check size={14} /> Confirm & Publish Manuscript
          </button>
        </div>
      </div>
    </div>
  );
}
