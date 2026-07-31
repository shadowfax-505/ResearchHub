'use client';

import { useState } from 'react';
import { Building2, X, Trophy, Users, BookOpen, Quote, TrendingUp } from 'lucide-react';

interface InstitutionalComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstitutionalComparison({ isOpen, onClose }: InstitutionalComparisonProps) {
  const [inst1, setInst1] = useState('Stanford University');
  const [inst2, setInst2] = useState('Massachusetts Institute of Technology');

  if (!isOpen) return null;

  const data: Record<string, any> = {
    'Stanford University': { country: 'United States', rank: '#1 Global', researchers: '3,840', publications: '14,200', citations: '480,000+', growth: '+18.4%' },
    'Massachusetts Institute of Technology': { country: 'United States', rank: '#2 Global', researchers: '3,620', publications: '13,900', citations: '465,000+', growth: '+17.9%' },
    'University of Oxford': { country: 'United Kingdom', rank: '#3 Global', researchers: '3,210', publications: '11,800', citations: '390,000+', growth: '+15.2%' },
    'ETH Zürich': { country: 'Switzerland', rank: '#4 Global', researchers: '2,450', publications: '9,400', citations: '310,000+', growth: '+14.8%' },
  };

  const d1 = data[inst1] || data['Stanford University'];
  const d2 = data[inst2] || data['Massachusetts Institute of Technology'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-lg bg-white dark:bg-darkCard border border-line dark:border-darkLine p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="text-primary" size={24} />
            <h2 className="text-lg font-black text-ink dark:text-darkInk">
              Institutional Head-to-Head Comparison Scoreboard
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Institution 1 */}
          <div className="space-y-4 border border-line dark:border-darkLine rounded-md p-4 bg-slate-50 dark:bg-darkPanel">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Institution 1</label>
            <select
              value={inst1}
              onChange={(e) => setInst1(e.target.value)}
              className="w-full border border-line rounded px-3 py-1.5 text-sm font-bold bg-white dark:bg-darkCard dark:border-darkLine dark:text-white outline-none focus:border-primary"
            >
              {Object.keys(data).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">World Rank</span>
                <span className="font-bold text-primary flex items-center gap-1"><Trophy size={14} /> {d1.rank}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Active Researchers</span>
                <span className="font-bold text-ink dark:text-white flex items-center gap-1"><Users size={14} /> {d1.researchers}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Publication Output</span>
                <span className="font-bold text-ink dark:text-white flex items-center gap-1"><BookOpen size={14} /> {d1.publications}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Citation Volume</span>
                <span className="font-bold text-ink dark:text-white flex items-center gap-1"><Quote size={14} /> {d1.citations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Annual Growth Rate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><TrendingUp size={14} /> {d1.growth}</span>
              </div>
            </div>
          </div>

          {/* Institution 2 */}
          <div className="space-y-4 border border-line dark:border-darkLine rounded-md p-4 bg-slate-50 dark:bg-darkPanel">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Institution 2</label>
            <select
              value={inst2}
              onChange={(e) => setInst2(e.target.value)}
              className="w-full border border-line rounded px-3 py-1.5 text-sm font-bold bg-white dark:bg-darkCard dark:border-darkLine dark:text-white outline-none focus:border-primary"
            >
              {Object.keys(data).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">World Rank</span>
                <span className="font-bold text-primary flex items-center gap-1"><Trophy size={14} /> {d2.rank}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Active Researchers</span>
                <span className="font-bold text-ink dark:text-white flex items-center gap-1"><Users size={14} /> {d2.researchers}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Publication Output</span>
                <span className="font-bold text-ink dark:text-white flex items-center gap-1"><BookOpen size={14} /> {d2.publications}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="text-slate-500">Citation Volume</span>
                <span className="font-bold text-ink dark:text-white flex items-center gap-1"><Quote size={14} /> {d2.citations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Annual Growth Rate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><TrendingUp size={14} /> {d2.growth}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-md hover:bg-primaryDark transition"
          >
            Close Scoreboard
          </button>
        </div>
      </div>
    </div>
  );
}
