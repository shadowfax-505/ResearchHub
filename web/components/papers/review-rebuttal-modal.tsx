'use client';

import { useState } from 'react';
import { MessageSquare, Send, Check, X } from 'lucide-react';

interface ReviewRebuttalModalProps {
  reviewerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewRebuttalModal({ reviewerName, isOpen, onClose }: ReviewRebuttalModalProps) {
  const [rebuttalText, setRebuttalText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rebuttalText.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      onClose();
      setSubmitting(false);
      setRebuttalText('');
      alert(`Author Rebuttal submitted to ${reviewerName}! Response logged in review history.`);
    }, 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-lg bg-white dark:bg-darkCard border border-line dark:border-darkLine p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-primary" size={20} />
            <h3 className="font-bold text-base text-ink dark:text-white">
              Author Rebuttal & Point-by-Point Response
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Reviewer</label>
            <div className="p-2 rounded bg-slate-100 dark:bg-darkPanel font-bold text-ink dark:text-white">
              {reviewerName}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Author Rebuttal Response</label>
            <textarea
              rows={5}
              required
              value={rebuttalText}
              onChange={(e) => setRebuttalText(e.target.value)}
              placeholder="Provide a constructive, technical response addressing the reviewer's specific comments..."
              className="w-full p-3 rounded border border-line bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-white outline-none focus:border-primary"
            />
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
              disabled={submitting}
              className="px-4 py-1.5 bg-primary text-white font-bold rounded-md hover:bg-primaryDark transition flex items-center gap-1.5"
            >
              {submitting ? <Check size={14} /> : <Send size={14} />}
              {submitting ? 'Submitting...' : 'Submit Rebuttal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
