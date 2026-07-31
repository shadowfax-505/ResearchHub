'use client';

import { Users, GraduationCap, Award } from 'lucide-react';

export function LabMembersCard() {
  const members = [
    { name: 'Alex Rivera', role: 'Senior Post-Doc Researcher', focus: 'Multimodal Attention & Vision Transformers' },
    { name: 'Samantha Vance', role: 'Ph.D. Candidate (Year 3)', focus: 'Graph Neural Networks for Drug Discovery' },
    { name: 'David Zhang', role: 'Lab Alumni (Now Asst. Prof at Carnegie Mellon)', focus: 'Quantized LLM Inference' }
  ];

  return (
    <div className="p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Research Group & Laboratory Team Roster
          </h3>
        </div>
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">3 Active Members</span>
      </div>

      <div className="space-y-3">
        {members.map((m, idx) => (
          <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <h4 className="font-bold text-xs text-ink dark:text-white truncate">{m.name}</h4>
              <p className="text-[11px] font-semibold text-primary">{m.role}</p>
              <p className="text-[10px] text-slate-500 truncate">Focus: {m.focus}</p>
            </div>
            <button
              onClick={() => alert(`Viewing scholar profile for ${m.name}`)}
              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-bold hover:bg-slate-300 transition shrink-0"
            >
              Profile &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
