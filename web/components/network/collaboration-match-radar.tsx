'use client';

import { Users, Sparkles, UserPlus } from 'lucide-react';

export function CollaborationMatchRadar() {
  const matches = [
    { name: 'Dr. Elena Rostova', institution: 'Oxford University', overlap: '94% Match', expertise: 'Graph Neural Networks & Drug Discovery' },
    { name: 'Prof. David Kim', institution: 'UC Berkeley', overlap: '88% Match', expertise: 'Efficient Transformer Quantization' }
  ];

  return (
    <div className="mb-6 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            AI Scholar Collaboration Matchmaker Suggestions
          </h3>
        </div>
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Co-Authorship Overlap Model</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((m, idx) => (
          <div key={idx} className="p-3.5 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-xs text-ink dark:text-white">{m.name}</h4>
                <p className="text-[11px] text-slate-500">{m.institution}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                {m.overlap}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Domain: {m.expertise}</p>
            <button
              onClick={() => alert(`Sent collaboration invitation to ${m.name}`)}
              className="mt-2 w-full py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark transition flex items-center justify-center gap-1.5"
            >
              <UserPlus size={13} /> Invite to Collaborate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
