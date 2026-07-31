'use client';

import { BookOpen, Star, TrendingUp } from 'lucide-react';

export function JournalImpactDirectory() {
  const journals = [
    { name: 'Nature Machine Intelligence', impactFactor: '25.8', quartile: 'Q1 Top 1%', acceptanceRate: '8.4%', publisher: 'Nature Publishing Group' },
    { name: 'IEEE Transactions on Pattern Analysis (TPAMI)', impactFactor: '23.6', quartile: 'Q1 Top 2%', acceptanceRate: '14.2%', publisher: 'IEEE CS' },
    { name: 'Journal of Machine Learning Research (JMLR)', impactFactor: '11.4', quartile: 'Q1 Top 5%', acceptanceRate: '18.0%', publisher: 'Microtome Publishing' },
    { name: 'Nucleic Acids Research (NAR)', impactFactor: '19.1', quartile: 'Q1 Top 2%', acceptanceRate: '16.5%', publisher: 'Oxford University Press' }
  ];

  return (
    <div className="my-6 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Academic Journal Impact Factor & Quartile Directory
          </h3>
        </div>
        <span className="text-xs font-bold text-primary">JCR 2026 Ratings</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {journals.map((j, idx) => (
          <div key={idx} className="p-3.5 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
              {j.quartile}
            </span>
            <h4 className="font-bold text-xs text-ink dark:text-white line-clamp-1">{j.name}</h4>
            <p className="text-[11px] text-slate-500">{j.publisher}</p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-black text-primary font-mono">IF: {j.impactFactor}</span>
              <span className="text-[11px] font-semibold text-slate-500">Acceptance: {j.acceptanceRate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
