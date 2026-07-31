'use client';

import { Star, CheckCircle, ThumbsUp } from 'lucide-react';

export function ReviewerScoringMatrix() {
  const metrics = [
    { label: 'Methodological Clarity', score: '4.9 / 5.0' },
    { label: 'Constructive Feedback', score: '4.8 / 5.0' },
    { label: 'Technical Accuracy', score: '5.0 / 5.0' }
  ];

  return (
    <div className="p-4 border border-line rounded bg-slate-50 dark:bg-darkPanel dark:border-darkLine space-y-3">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-2">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-amber-500 fill-amber-500" />
          <h4 className="font-bold text-xs text-ink dark:text-white">
            Peer Review Constructive Feedback & Rigor Quality Matrix
          </h4>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Editor Verified</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-2 rounded bg-white dark:bg-darkCard border border-line dark:border-darkLine space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 block truncate">{m.label}</span>
            <span className="text-sm font-black text-primary font-mono">{m.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
