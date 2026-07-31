'use client';

import { Award, TrendingUp, BarChart3, Bookmark } from 'lucide-react';

interface HindexBreakdownCardProps {
  hIndex?: number;
  i10Index?: number;
  totalCitations?: number;
}

export function HindexBreakdownCard({ hIndex = 18, i10Index = 32, totalCitations = 1420 }: HindexBreakdownCardProps) {
  return (
    <div className="p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Scholar Citation Indices & Impact Breakdown
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">Google Scholar Verified</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded bg-slate-50 dark:bg-darkPanel border border-slate-200 dark:border-darkLine space-y-1">
          <span className="text-[11px] font-bold text-slate-500">h-index</span>
          <p className="text-2xl font-black text-primary font-mono">{hIndex}</p>
          <p className="text-[9px] text-slate-400">18 papers with ≥ 18 citations</p>
        </div>
        <div className="p-3 rounded bg-slate-50 dark:bg-darkPanel border border-slate-200 dark:border-darkLine space-y-1">
          <span className="text-[11px] font-bold text-slate-500">i10-index</span>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">{i10Index}</p>
          <p className="text-[9px] text-slate-400">32 papers with ≥ 10 citations</p>
        </div>
        <div className="p-3 rounded bg-slate-50 dark:bg-darkPanel border border-slate-200 dark:border-darkLine space-y-1">
          <span className="text-[11px] font-bold text-slate-500">Lifetime Citations</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{totalCitations}</p>
          <p className="text-[9px] text-slate-400">+142 citations this year</p>
        </div>
      </div>
    </div>
  );
}
