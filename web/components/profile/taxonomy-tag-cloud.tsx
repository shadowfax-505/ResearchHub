'use client';

import { Sparkles } from 'lucide-react';

export function TaxonomyTagCloud() {
  const domains = [
    { name: 'Deep Learning & Attention', weight: '42%', color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800' },
    { name: 'Natural Language Processing', weight: '28%', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800' },
    { name: 'Bioinformatics & Genomics', weight: '18%', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' },
    { name: 'Reinforcement Learning', weight: '12%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' }
  ];

  return (
    <div className="p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Scholar Research Taxonomy & Domain Concentration
          </h3>
        </div>
        <span className="text-xs text-slate-500">AI Topic Modeling</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {domains.map((d, idx) => (
          <span
            key={idx}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${d.color}`}
          >
            <span>{d.name}</span>
            <span className="opacity-75 font-mono text-[10px]">({d.weight})</span>
          </span>
        ))}
      </div>
    </div>
  );
}
