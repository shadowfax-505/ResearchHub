'use client';

import { Trophy, Award, CheckCircle2 } from 'lucide-react';

export function QaLeaderboard() {
  const leaders = [
    { name: 'Dr. Sarah Chen', title: 'Stanford AI Lab', solutions: 48, score: 980 },
    { name: 'Prof. Michael Miller', title: 'MIT CSAIL', solutions: 42, score: 920 },
    { name: 'Dr. Elena Rostova', title: 'ETH Zürich', solutions: 39, score: 860 },
    { name: 'Kenji Yamamoto', title: 'University of Tokyo', solutions: 34, score: 790 },
    { name: 'Dr. Marcus Vance', title: 'Oxford Genomics', solutions: 31, score: 740 }
  ];

  return (
    <div className="mb-6 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Top Community Experts & Answerers of the Month
          </h3>
        </div>
        <span className="text-xs font-bold text-primary">Jul 2026 Rankings</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        {leaders.map((l, idx) => (
          <div key={l.name} className="p-3 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-1 relative">
            <span className={`absolute top-2 right-2 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center ${
              idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-600'
            }`}>
              #{idx + 1}
            </span>
            <p className="font-bold text-xs text-ink dark:text-white line-clamp-1 pr-6">{l.name}</p>
            <p className="text-[11px] text-slate-500 line-clamp-1">{l.title}</p>
            <div className="pt-2 flex items-center justify-between text-[11px] font-bold border-t border-slate-200 dark:border-slate-800">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 size={11} /> {l.solutions} Solved
              </span>
              <span className="text-primary font-mono">{l.score} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
