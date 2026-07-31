'use client';

import { Share2, Users } from 'lucide-react';

interface CoauthorGraphProps {
  authorName: string;
}

export function CoauthorGraph({ authorName }: CoauthorGraphProps) {
  const coauthors = [
    { name: 'Dr. Sarah Chen', title: 'Stanford AI Lab', papers: 14, color: 'bg-primary' },
    { name: 'Prof. Michael Miller', title: 'MIT CSAIL', papers: 9, color: 'bg-teal-500' },
    { name: 'Dr. Elena Rostova', title: 'ETH Zürich', papers: 6, color: 'bg-emerald-500' },
    { name: 'Kenji Yamamoto', title: 'Univ of Tokyo', papers: 4, color: 'bg-indigo-500' }
  ];

  return (
    <div className="mt-6 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Share2 size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Co-Authorship & Collaborative Network Graph
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">4 Top Collaborators</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {coauthors.map((c) => (
          <div key={c.name} className="p-3 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${c.color} shrink-0`} />
              <p className="font-bold text-xs text-ink dark:text-white line-clamp-1">{c.name}</p>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{c.title}</p>
            <p className="text-[10px] font-mono text-primary font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
              {c.papers} Joint Publications
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
