'use client';

import { useState } from 'react';
import { ShieldCheck, X, Check } from 'lucide-react';

interface IpAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IpAgreementModal({ isOpen, onClose }: IpAgreementModalProps) {
  const [signed, setSigned] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-darkCard rounded-lg border border-line dark:border-darkLine shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-teal-400" />
            <h3 className="font-bold text-sm">Joint Research IP & Authorship Rights Agreement</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300 overflow-y-auto">
          <p className="leading-relaxed font-medium">
            This agreement establishes intellectual property (IP) rights, dataset licensing terms, and co-authorship contribution policies among all registered project collaborators.
          </p>

          <div className="p-3 bg-slate-50 dark:bg-darkPanel border border-line dark:border-darkLine rounded space-y-2 font-mono text-[11px]">
            <p>1. Open Access Data Release: MIT / CC-BY 4.0 License</p>
            <p>2. Equal CRediT Taxonomy Attribution for Code & Writing</p>
            <p>3. Zero Patent Exclusivity Commercial Lock-In</p>
          </div>

          <label className="flex items-center gap-2 pt-2 cursor-pointer font-bold">
            <input
              type="checkbox"
              checked={signed}
              onChange={(e) => setSigned(e.target.checked)}
              className="rounded text-primary focus:ring-primary size-4"
            />
            <span>I accept the joint research IP agreement for this project.</span>
          </label>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-darkPanel border-t border-line dark:border-darkLine flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 border border-line dark:border-darkLine text-slate-700 dark:text-slate-300 rounded text-xs font-bold">
            Cancel
          </button>
          <button
            disabled={!signed}
            onClick={() => {
              alert('Research IP Agreement Digitally Signed & Timestamped on Blockchain Ledger.');
              onClose();
            }}
            className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark disabled:opacity-50"
          >
            Sign & Confirm Agreement
          </button>
        </div>
      </div>
    </div>
  );
}
