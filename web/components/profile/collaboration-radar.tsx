'use client';

import { useState } from 'react';
import { Sparkles, UserPlus, Check, Building, BookOpen } from 'lucide-react';

interface SuggestedResearcher {
  id: number;
  name: string;
  headline: string;
  institution: string;
  matchScore: number;
  matchReason: string;
  avatarSeed: string;
}

export function CollaborationRadar({
  currentAffiliation = 'Stanford University',
  currentDepartment = 'Computer Science'
}: {
  currentAffiliation?: string;
  currentDepartment?: string;
}) {
  const [suggestions, setSuggestions] = useState<SuggestedResearcher[]>([
    {
      id: 101,
      name: 'Dr. Elena Rostova',
      headline: 'Associate Professor of AI & Genomics',
      institution: currentAffiliation || 'Stanford University',
      matchScore: 96,
      matchReason: 'Same Institution · Shared AI & Genomics Field',
      avatarSeed: 'Elena'
    },
    {
      id: 102,
      name: 'Prof. Marcus Chen',
      headline: 'Director of Distributed Systems Lab',
      institution: 'MIT',
      matchScore: 91,
      matchReason: 'High Citation Co-Author Network Match',
      avatarSeed: 'Marcus'
    },
    {
      id: 103,
      name: 'Dr. Sophia Thorne',
      headline: 'Senior Quantum Computing Researcher',
      institution: currentAffiliation || 'Stanford University',
      matchScore: 88,
      matchReason: `Same Department (${currentDepartment || 'Computer Science'})`,
      avatarSeed: 'Sophia'
    }
  ]);

  const [connectedIds, setConnectedIds] = useState<number[]>([]);

  const handleConnect = (id: number) => {
    setConnectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  return (
    <div className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line dark:border-darkLine pb-4">
        <div>
          <h3 className="text-xl font-black text-ink dark:text-darkInk flex items-center gap-2">
            <Sparkles className="text-primary" size={20} /> Co-Author Collaboration Radar
          </h3>
          <p className="text-xs text-muted dark:text-darkMuted mt-1">
            Recommended potential co-authors based on institutional proximity and field overlap.
          </p>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold">
          AI Radar Active
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {suggestions.map(researcher => {
          const isConnected = connectedIds.includes(researcher.id);
          return (
            <div
              key={researcher.id}
              className="flex flex-col justify-between rounded-lg border border-line p-4 dark:border-darkLine bg-white dark:bg-darkPanel transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-900 to-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {researcher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                    {researcher.matchScore}% Match
                  </span>
                </div>

                <h4 className="font-bold text-ink dark:text-darkInk text-sm hover:text-primary transition cursor-pointer">
                  {researcher.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                  {researcher.headline}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Building size={12} /> {researcher.institution}
                </p>

                <p className="mt-3 text-[10px] font-semibold text-primary bg-primarySoft dark:bg-primary/10 p-2 rounded border border-primary/20">
                  {researcher.matchReason}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleConnect(researcher.id)}
                className={`mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition border ${
                  isConnected
                    ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-darkCard dark:text-slate-300 dark:border-darkLine'
                    : 'bg-primary text-white border-primary hover:bg-primaryDark'
                }`}
              >
                {isConnected ? (
                  <>
                    <Check size={14} /> Request Sent
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Invite to Collaborate
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
