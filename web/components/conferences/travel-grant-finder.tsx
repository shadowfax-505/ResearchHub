'use client';

import { Award, ExternalLink, DollarSign } from 'lucide-react';

export function TravelGrantFinder() {
  const grants = [
    { title: 'NeurIPS 2026 Student Travel Award', amount: '$1,500 USD', eligibility: 'Graduate Students & Early Career', deadline: 'May 20, 2026' },
    { title: 'ACM SIGKDD Inclusion & Diversity Stipend', amount: '$1,200 USD', eligibility: 'Underrepresented Researchers', deadline: 'Jun 10, 2026' }
  ];

  return (
    <div className="my-5 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Academic Conference Travel Grants & Student Bursary Directory
          </h3>
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">$2,700 Stipends Available</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {grants.map((g, idx) => (
          <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-1.5">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-xs text-ink dark:text-white line-clamp-1">{g.title}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono">
                {g.amount}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{g.eligibility}</p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-[10px] font-semibold text-slate-400 font-mono">Deadline: {g.deadline}</span>
              <button
                onClick={() => alert(`Redirecting to Travel Grant Application for ${g.title}`)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                Apply &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
