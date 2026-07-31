'use client';

import { TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';

interface CitationForecasterProps {
  paperTitle: string;
}

export function CitationForecaster({ paperTitle }: CitationForecasterProps) {
  const predictions = [
    { year: '2026', count: 12 },
    { year: '2027', count: 48 },
    { year: '2028', count: 140 },
    { year: '2029', count: 310 },
    { year: '2030', count: 620 }
  ];

  return (
    <div className="my-6 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            AI 5-Year Citation Growth & Impact Predictor
          </h3>
        </div>
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
          <TrendingUp size={12} /> High Impact Trajectory
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center">
        {predictions.map((p) => (
          <div key={p.year} className="p-3 rounded bg-slate-50 dark:bg-darkPanel border border-slate-200 dark:border-darkLine space-y-1">
            <span className="text-[11px] font-bold text-slate-500">{p.year}</span>
            <p className="text-base font-black text-primary font-mono">{p.count}</p>
            <p className="text-[9px] text-slate-400">Est. Citations</p>
          </div>
        ))}
      </div>
    </div>
  );
}
