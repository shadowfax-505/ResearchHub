'use client';

import { Calendar, Users, ExternalLink } from 'lucide-react';

export function WorkshopDirectory() {
  const workshops = [
    { title: 'NeurIPS 2026 AI for Science & Molecular Discovery Workshop', organizer: 'Stanford Bio-AI Lab', date: 'Dec 12, 2026', cfpDeadline: 'Sep 15, 2026' },
    { title: 'ICML 2026 Workshop on Foundation Models & Efficiency', organizer: 'MIT CSAIL', date: 'Jul 18, 2026', cfpDeadline: 'May 01, 2026' }
  ];

  return (
    <div className="my-5 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Academic Conference Satellite Workshops & Call for Papers
          </h3>
        </div>
        <span className="text-xs font-bold text-primary">Co-located Sessions</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {workshops.map((w, idx) => (
          <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-1.5">
            <h4 className="font-bold text-xs text-ink dark:text-white line-clamp-1">{w.title}</h4>
            <p className="text-[11px] text-slate-500">{w.organizer}</p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-[10px] font-mono text-slate-500">CFP: {w.cfpDeadline}</span>
              <button
                onClick={() => alert(`Redirecting to Workshop Submission Page for ${w.title}`)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Submit Workshop Paper &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
