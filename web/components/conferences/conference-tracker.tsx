'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Bookmark, Send } from 'lucide-react';
import { ConferenceSubmissionModal } from './conference-submission-modal';
import { ConferenceScheduleCalendar } from './conference-schedule-calendar';

export function ConferenceTracker() {
  const [submittingConf, setSubmittingConf] = useState<string | null>(null);

  const conferences = [
    { title: 'NeurIPS 2026', location: 'Vancouver, Canada', date: 'Dec 6-12, 2026', deadline: 'May 18, 2026', status: 'Submissions Open', category: 'AI & ML' },
    { title: 'ICML 2026', location: 'Honolulu, USA', date: 'Jul 12-18, 2026', deadline: 'Jan 28, 2026', status: 'Reviewing', category: 'Machine Learning' },
    { title: 'CVPR 2026', location: 'Seattle, USA', date: 'Jun 14-19, 2026', deadline: 'Nov 14, 2025', status: 'Registration Open', category: 'Computer Vision' },
    { title: 'ACL 2026', location: 'Bangkok, Thailand', date: 'Aug 2-7, 2026', deadline: 'Feb 15, 2026', status: 'Submissions Open', category: 'NLP & Speech' }
  ];

  return (
    <div className="my-6 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-line dark:border-darkLine pb-3">
        <h3 className="font-bold text-sm text-ink dark:text-darkInk flex items-center gap-2">
          <Calendar size={18} className="text-primary" /> Global Academic Conference & Submission Tracker
        </h3>
        <span className="text-xs font-semibold text-primary hover:underline cursor-pointer">
          View All Conferences &rarr;
        </span>
      </div>

      <ConferenceScheduleCalendar />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {conferences.map((conf, idx) => (
          <div key={idx} className="p-4 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-2 relative flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {conf.category}
              </span>
              <h4 className="font-bold text-sm text-ink dark:text-white line-clamp-1">{conf.title}</h4>
              <div className="text-xs text-slate-500 space-y-1">
                <p className="flex items-center gap-1"><MapPin size={12} /> {conf.location}</p>
                <p className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400">
                  <Clock size={12} /> Deadline: {conf.deadline}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">{conf.status}</span>
                <button
                  type="button"
                  onClick={() => alert(`Redirecting to ${conf.title} Virtual Stream Room...`)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500 text-slate-950 hover:bg-teal-400 transition"
                >
                  Join Live Stream
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSubmittingConf(conf.title)}
                className="w-full py-1 bg-primary text-white rounded text-[11px] font-bold hover:bg-primaryDark transition flex items-center justify-center gap-1"
              >
                <Send size={11} /> Submit Paper
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConferenceSubmissionModal
        confTitle={submittingConf || ''}
        isOpen={submittingConf !== null}
        onClose={() => setSubmittingConf(null)}
      />
    </div>
  );
}
