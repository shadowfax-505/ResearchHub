'use client';

import { useState, useEffect } from 'react';
import { getNetworkRecommendations, followResearcher } from '@/lib/api';
import { UserPlus, Users, MapPin, Building } from 'lucide-react';
import Link from 'next/link';

export function NetworkView() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [deptFilter, setDeptFilter] = useState('All Recommendations');

  const loadNetwork = () => {
    getNetworkRecommendations().then(res => setRecommendations(res.data || []));
  };

  useEffect(() => {
    loadNetwork();
  }, []);

  const handleFollow = async (userId: number) => {
    try {
      await followResearcher(userId);
      // Remove from recommendations locally for a snappy UI
      setRecommendations(prev => prev.filter(r => r.user_id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRecommendations = recommendations.filter(r => {
    if (deptFilter === 'All Recommendations') return true;
    const text = `${r.department || ''} ${r.affiliation || ''} ${r.position_title || ''}`.toLowerCase();
    return text.includes(deptFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Discover Researchers</h2>
          <p className="mt-1 text-sm text-muted dark:text-darkMuted">Expand your network to discover new publications and projects.</p>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All Recommendations', 'Computer Science', 'Engineering', 'Medicine'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setDeptFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                deptFilter === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-primary dark:bg-darkCard dark:border-darkLine dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecommendations.length ? filteredRecommendations.map(rec => (
          <div key={rec.user_id} className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">
                {(rec.full_name || rec.username).charAt(0).toUpperCase()}
              </span>
            </div>
            <Link href={`/researchers/${rec.slug || rec.username}` as any} className="font-black text-lg hover:text-primary transition">
              {rec.full_name || rec.username}
            </Link>
            <p className="text-sm font-bold text-muted mt-1">{rec.position_title || 'Researcher'}</p>
            {rec.affiliation && (
              <p className="text-xs text-muted dark:text-darkMuted flex items-center gap-1 mt-2">
                <Building size={12} /> {rec.affiliation}
              </p>
            )}
            <div className="mt-4 flex w-full justify-center gap-4 text-xs font-bold text-muted">
              <span>{rec.followers || 0} Followers</span>
              <span>{rec.following || 0} Following</span>
            </div>
            <button
              onClick={() => handleFollow(rec.user_id)}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white transition"
            >
              <UserPlus size={16} /> Follow
            </button>
          </div>
        )) : (
          <div className="col-span-full rounded-soft border border-line bg-paper p-10 text-center shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <Users className="mx-auto text-muted mb-4" size={48} />
            <h3 className="text-lg font-bold">You're all caught up!</h3>
            <p className="text-sm text-muted">Check back later for more recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
