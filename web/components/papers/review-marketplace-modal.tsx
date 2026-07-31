'use client';

import { useState } from 'react';
import { Users, Award, Check, X, ShieldAlert } from 'lucide-react';

interface ReviewMarketplaceModalProps {
  paperTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewMarketplaceModal({ paperTitle, isOpen, onClose }: ReviewMarketplaceModalProps) {
  const [bounty, setBounty] = useState('100');
  const [requested, setRequested] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRequested(true);
    setTimeout(() => {
      onClose();
      setRequested(false);
      alert('Peer Review Request published to Verified Reviewers Marketplace!');
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-lg bg-white dark:bg-darkCard border border-line dark:border-darkLine p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
          <div className="flex items-center gap-2">
            <Users className="text-primary" size={20} />
            <h3 className="font-bold text-base text-ink dark:text-white">
              Request Expert Peer Review
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Manuscript</label>
            <input
              type="text"
              readOnly
              value={paperTitle}
              className="w-full p-2.5 rounded border border-line bg-slate-100 dark:bg-darkPanel dark:border-darkLine dark:text-white font-semibold outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Peer Review Credit Bounty</label>
            <select
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
              className="w-full p-2.5 rounded border border-line bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-white outline-none"
            >
              <option value="50">50 Review Credits (Standard - 14 Days)</option>
              <option value="100">100 Review Credits (Expedited - 7 Days)</option>
              <option value="250">250 Review Credits (Priority Double-Blind - 72 Hours)</option>
            </select>
          </div>

          <div className="p-3 rounded bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>Reviews are conducted by double-blind verified faculty members with relevant citation history.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line dark:border-darkLine">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requested}
              className="px-4 py-1.5 bg-primary text-white font-bold rounded-md hover:bg-primaryDark transition flex items-center gap-1.5"
            >
              {requested ? <Check size={14} /> : <Award size={14} />}
              {requested ? 'Publishing...' : 'Publish Bounty Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
