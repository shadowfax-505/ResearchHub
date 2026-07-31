'use client';

import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';

interface ReviewRigorRadarProps {
  paperTitle: string;
}

export function ReviewRigorRadar({ paperTitle }: ReviewRigorRadarProps) {
  const metrics = [
    { name: 'Methodological Rigor', score: 96, color: 'bg-emerald-500' },
    { name: 'Data Completeness', score: 92, color: 'bg-teal-500' },
    { name: 'Code Reproducibility', score: 88, color: 'bg-primary' },
    { name: 'Mathematical Proofs', score: 95, color: 'bg-indigo-500' },
    { name: 'Scientific Novelty', score: 94, color: 'bg-purple-500' }
  ];

  const overallScore = 93;

  return (
    <div className="my-6 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Peer Review Rigor & Quality Scorecard
          </h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <Award size={14} /> Overall Score: {overallScore} / 100
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map(m => (
          <div key={m.name} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{m.name}</span>
              <span className="font-mono font-bold">{m.score}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-darkPanel overflow-hidden">
              <div className={`h-full ${m.color} transition-all duration-500`} style={{ width: `${m.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
