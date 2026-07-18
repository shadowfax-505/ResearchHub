'use client';

import { useState } from 'react';
import { FileText, PlusCircle } from 'lucide-react';
import { PublicResearcherProfile } from '@/lib/api';
import Link from 'next/link';

export function ProfileTabStats({ profile }: { profile: PublicResearcherProfile }) {
  const [activeStat, setActiveStat] = useState('Research Interest Score');

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
         <Link href="/analytics" className="text-sm font-bold text-primary hover:underline">View your latest weekly report &gt;</Link>
      </div>

      {/* Main Stats Summary Card */}
      <section className="rounded-soft border border-line bg-paper shadow-stitch dark:border-darkLine dark:bg-darkCard">
         <div className="border-b border-line p-6 dark:border-darkLine">
            <h2 className="text-xl font-black">Overall publications stats</h2>
         </div>
         <div className="flex border-b border-line dark:border-darkLine">
            {[
              { label: 'Research Interest Score', value: '- -', active: activeStat === 'Research Interest Score' },
              { label: 'Reads', value: '0', active: activeStat === 'Reads' },
              { label: 'Citations', value: '0', active: activeStat === 'Citations' },
              { label: 'Recommendations', value: '0', active: activeStat === 'Recommendations' },
            ].map((stat) => (
               <button 
                 key={stat.label}
                 onClick={() => setActiveStat(stat.label)}
                 className={`flex-1 border-r border-line p-6 text-left last:border-r-0 dark:border-darkLine ${stat.active ? 'bg-slate-50 shadow-[inset_0_-3px_0_0_currentColor] text-primary dark:bg-darkPanel' : 'hover:bg-slate-50 dark:hover:bg-darkPanel'}`}
               >
                 <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{stat.label}</p>
                 <p className="mt-2 text-3xl font-black text-ink dark:text-darkInk">{stat.value}</p>
                 <p className="mt-1 text-xs font-bold text-muted dark:text-darkMuted">→ ---</p>
               </button>
            ))}
         </div>

         {/* Sub-Card Content */}
         <div className="grid divide-x divide-line dark:divide-darkLine lg:grid-cols-2">
            <div className="p-6">
               <h3 className="font-bold">Score breakdown</h3>
               <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                 <li className="flex justify-between"><span>0 Citations (excl. self-citations)</span></li>
                 <li className="flex justify-between"><span>0 Recommendations</span></li>
                 <li className="flex justify-between"><span>0 Full-text reads*</span></li>
                 <li className="flex justify-between"><span>0 Other reads*</span></li>
               </ul>
               <p className="mt-4 text-xs text-muted">*Reads by ResearchHub members</p>
               <div className="mt-6 flex justify-end">
                 <Link href="/analytics" className="text-sm font-bold text-primary hover:underline">Learn more about the Research Interest Score</Link>
               </div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 text-center">
               <div className="relative">
                  <FileText size={40} className="text-slate-300 dark:text-slate-600" />
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-white text-primary dark:bg-darkPanel"><PlusCircle size={16} /></div>
               </div>
               <h3 className="mt-4 font-black">Add research to start seeing a score</h3>
               <p className="mt-2 text-sm text-muted dark:text-darkMuted">When people start interacting with your work you&apos;ll be able to compare yourself to your peers here.</p>
               <Link href="/submit" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Add research</Link>
            </div>
         </div>
         <div className="border-t border-line bg-slate-50 p-3 text-center dark:border-darkLine dark:bg-darkPanel">
            <Link href="/analytics" className="text-sm font-bold text-primary hover:underline">View individual publication stats</Link>
         </div>
      </section>

      {/* Stats history */}
      <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Stats history</h2>
            <select className="rounded border border-line px-2 py-1 text-sm font-bold dark:border-darkLine dark:bg-darkPanel">
               <option>Time: Weekly</option>
               <option>Time: Monthly</option>
            </select>
         </div>
         
         <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold">
            <label className="flex items-center gap-2 text-slate-400">
               <input type="checkbox" disabled className="rounded text-primary" /> Research Interest Score
            </label>
            <label className="flex items-center gap-2 text-orange-600">
               <input type="checkbox" defaultChecked className="rounded accent-orange-600" /> Citations
            </label>
            <label className="flex items-center gap-2 text-purple-600">
               <input type="checkbox" defaultChecked className="rounded accent-purple-600" /> Recommendations
            </label>
            <label className="flex items-center gap-2 text-amber-700">
               <input type="checkbox" defaultChecked className="rounded accent-amber-700" /> Reads
            </label>
            <label className="flex items-center gap-2 text-blue-600">
               <input type="checkbox" defaultChecked className="rounded accent-blue-600" /> Full-text reads
            </label>
         </div>

         {/* Chart Placeholder */}
         <div className="mt-8 flex h-64 items-center justify-center border-b-2 border-l-2 border-line dark:border-darkLine">
            <p className="text-sm text-muted">No data available for the selected period.</p>
         </div>
      </section>
      
      <div className="text-center">
         <Link href="/analytics" className="text-sm font-bold text-primary hover:underline">View your latest weekly report</Link>
      </div>
    </div>
  );
}
