'use client';

import { Tv, Play, MessageSquare, ExternalLink } from 'lucide-react';

export function VirtualPosterHub() {
  const sessions = [
    { title: 'Poster #A-12: Zero-Shot Multimodal Alignment in Clinical Imaging', presenter: 'Dr. Sarah Chen (Stanford)', status: 'Live Now &middot; Q&A Open', attendees: 142 },
    { title: 'Poster #B-04: Quantum-Inspired Graph Solvers for Drug Discovery', presenter: 'Prof. Michael Miller (MIT)', status: 'Starting in 15 mins', attendees: 89 }
  ];

  return (
    <div className="mb-6 p-4 border border-primary/20 bg-gradient-to-r from-teal-50/50 via-slate-50 to-slate-100 rounded-md dark:from-darkPanel dark:to-darkCard dark:border-primary/30 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-2">
        <div className="flex items-center gap-2">
          <Tv size={18} className="text-primary animate-pulse" />
          <h3 className="font-bold text-xs text-ink dark:text-white uppercase tracking-wider">
            Virtual Academic Poster Session & Live Video Stream Hub
          </h3>
        </div>
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
          ● 2 Live Rooms Open
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sessions.map((s, idx) => (
          <div key={idx} className="p-3 rounded bg-white dark:bg-darkCard border border-line dark:border-darkLine flex justify-between items-center gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="font-bold text-xs text-ink dark:text-white line-clamp-1">{s.title}</h4>
              <p className="text-[11px] text-slate-500">{s.presenter}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{s.status}</p>
            </div>
            <button
              onClick={() => alert(`Entering Virtual Poster Presentation Room: ${s.title}`)}
              className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark transition shrink-0 flex items-center gap-1"
            >
              <Play size={12} /> Enter Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
