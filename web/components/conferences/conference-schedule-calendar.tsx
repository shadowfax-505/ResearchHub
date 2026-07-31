'use client';

import { Calendar, Clock, AlertCircle } from 'lucide-react';

export function ConferenceScheduleCalendar() {
  const events = [
    { conf: 'NeurIPS 2026', milestone: 'Abstract Submission Deadline', date: 'May 14, 2026', daysLeft: '14 Days Left', urgent: true },
    { conf: 'ICML 2026', milestone: 'Camera-Ready Paper Due', date: 'June 01, 2026', daysLeft: '32 Days Left', urgent: false },
    { conf: 'ACL 2026', milestone: 'Author Rebuttal Period Open', date: 'June 18, 2026', daysLeft: '49 Days Left', urgent: false }
  ];

  return (
    <div className="my-5 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Academic Conference Key Deadlines & Milestone Calendar
          </h3>
        </div>
        <span className="text-xs font-bold text-primary">Live Countdown</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {events.map((e, idx) => (
          <div
            key={idx}
            className={`p-3 rounded border space-y-1.5 ${
              e.urgent
                ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800'
                : 'bg-slate-50 border-slate-200 dark:bg-darkPanel dark:border-darkLine'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-xs text-ink dark:text-white">{e.conf}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${e.urgent ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                {e.daysLeft}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{e.milestone}</p>
            <p className="text-[10px] text-slate-500 font-mono">{e.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
