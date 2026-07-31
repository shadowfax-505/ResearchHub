'use client';

import { DollarSign, Calendar, ExternalLink, Award, Search } from 'lucide-react';
import { useState } from 'react';

export function GrantFundingFinder() {
  const [query, setQuery] = useState('');

  const grants = [
    { title: 'NSF AI & Multimodal Intelligence Grant', agency: 'National Science Foundation (NSF)', amount: '$750,000', deadline: 'Sep 15, 2026', category: 'Artificial Intelligence' },
    { title: 'NIH Genomic Data Infrastructure Initiative', agency: 'National Institutes of Health (NIH)', amount: '$1,200,000', deadline: 'Oct 01, 2026', category: 'Genomics & Bioinformatics' },
    { title: 'Horizon Europe Quantum Algorithms Fellowship', agency: 'European Research Council (ERC)', amount: '€850,000', deadline: 'Nov 12, 2026', category: 'Quantum Computing' }
  ];

  const filtered = grants.filter(g => !query.trim() || `${g.title} ${g.agency} ${g.category}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="my-6 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Active Research Funding & Grant Opportunity Directory
          </h3>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search grants or agencies..."
            className="w-full pl-8 pr-2.5 py-1 text-xs border border-line rounded bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-white outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((g, idx) => (
          <div key={idx} className="p-4 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
              {g.category}
            </span>
            <h4 className="font-bold text-sm text-ink dark:text-white line-clamp-2">{g.title}</h4>
            <p className="text-xs text-slate-500">{g.agency}</p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">{g.amount}</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1"><Calendar size={12} /> {g.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
