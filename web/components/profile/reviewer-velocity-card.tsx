'use client';

import { Clock, CheckCircle2, Star } from 'lucide-react';

export function ReviewerVelocityCard() {
  return (
    <div className="p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Peer Reviewer Turnaround Velocity & Quality Scorecard
          </h3>
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verified Peer Reviewer</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded bg-slate-50 dark:bg-darkPanel border border-slate-200 dark:border-darkLine space-y-1">
          <span className="text-[11px] font-bold text-slate-500">Avg Turnaround</span>
          <p className="text-xl font-black text-primary font-mono">11.4 Days</p>
          <p className="text-[9px] text-slate-400">Top 5% Review Speed</p>
        </div>
        <div className="p-3 rounded bg-slate-50 dark:bg-darkPanel border border-slate-200 dark:border-darkLine space-y-1">
          <span className="text-[11px] font-bold text-slate-500">Reviews Completed</span>
          <p className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono">24</p>
          <p className="text-[9px] text-slate-400">Double-Blind Verified</p>
        </div>
        <div className="p-3 rounded bg-slate-50 dark:bg-darkPanel border border-slate-200 dark:border-darkLine space-y-1">
          <span className="text-[11px] font-bold text-slate-500">Editor Quality Rating</span>
          <p className="text-xl font-black text-amber-500 font-mono">4.9 / 5.0</p>
          <p className="text-[9px] text-slate-400">High Rigor Score</p>
        </div>
      </div>
    </div>
  );
}
