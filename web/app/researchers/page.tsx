'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getResearchers, PublicResearcherProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Users, BookOpen } from 'lucide-react';

export default function ResearchersDirectory() {
  const [researchers, setResearchers] = useState<PublicResearcherProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResearchers(50, 0)
      .then(data => {
        setResearchers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg">
      {/* Header section */}
      <div className="bg-white border-b border-line shadow-sm dark:bg-darkCard dark:border-darkLine">
        <div className="max-w-[1000px] mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-ink dark:text-darkInk mb-3">Researchers Directory</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-[15px]">
            Discover and connect with researchers from around the world. Browse by field, institution, or search for specific experts in your domain.
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search researchers by name or institution..." 
                className="w-full h-10 pl-10 pr-4 border border-line rounded bg-slate-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-darkPanel dark:border-darkLine dark:text-darkInk"
              />
            </div>
            <Button className="bg-primary hover:bg-primaryDark text-white h-10 px-6 font-bold">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink dark:text-darkInk">Popular Researchers</h2>
          <span className="text-sm text-slate-500 font-medium">{researchers.length} results</span>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white border border-line p-6 rounded shadow-sm flex gap-4 animate-pulse dark:bg-darkCard dark:border-darkLine">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-700"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 dark:bg-slate-700"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3 dark:bg-slate-700"></div>
                  </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {researchers.map(researcher => (
              <div key={researcher.user_id} className="bg-white border border-line p-5 rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine flex flex-col hover:border-slate-300 transition">
                <div className="flex items-start gap-4 mb-4">
                  <Link href={`/profile/${researcher.slug}` as any} className="shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-500 overflow-hidden">
                      {(researcher as any).profile_picture_url ? (
                        <img src={(researcher as any).profile_picture_url} alt={researcher.full_name} className="h-full w-full object-cover" />
                      ) : (
                        (researcher.full_name || researcher.username || "?").charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${researcher.slug}` as any} className="text-[17px] font-bold text-ink hover:text-primary hover:underline truncate block dark:text-darkInk">
                      {researcher.full_name || researcher.username}
                    </Link>
                    <div className="text-[14px] text-slate-700 font-medium truncate dark:text-slate-300">
                      {researcher.affiliation || researcher.department || 'Independent Researcher'}
                    </div>
                    {researcher.headline && (
                      <div className="text-[13px] text-slate-500 truncate mt-0.5">
                        {researcher.headline}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                  <div className="flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5" title="Followers">
                      <Users size={14} className="text-slate-400" />
                      <span>{researcher.followers || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Total Reads">
                      <BookOpen size={14} className="text-slate-400" />
                      <span>{researcher.total_reads || 0}</span>
                    </div>
                    {(researcher.rg_score || 0) > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#007062] bg-[#e4f3f1] px-1.5 py-0.5 rounded font-bold">RI {researcher.rg_score}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="secondary" className="h-8 px-3 text-xs font-bold text-primary flex items-center gap-1.5 border-line">
                    <UserPlus size={14} /> Follow
                  </Button>
                </div>
              </div>
            ))}
            
            {researchers.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500">
                No researchers found in the directory.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
