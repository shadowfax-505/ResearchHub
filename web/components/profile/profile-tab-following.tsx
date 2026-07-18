import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { PublicResearcherProfile } from '@/lib/api';
import { getResearcherFollowingList } from '@/lib/api';

export function ProfileTabFollowing({ profile }: { profile: PublicResearcherProfile }) {
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile.user_id) {
      getResearcherFollowingList(profile.user_id).then(res => {
        setFollowing(res.data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [profile.user_id]);

  return (
    <div className="space-y-6 animate-in fade-in">
        <h2 className="mb-4 text-xl font-black text-ink dark:text-darkInk">Following ({following.length})</h2>
        <div className="flex items-center gap-3 border-b border-line pb-4 dark:border-darkLine">
           <button className="rounded-full bg-slate-900 px-4 py-1.5 font-bold text-white dark:bg-white dark:text-slate-900">Researchers</button>
        </div>

        <div className="mt-4 grid gap-4">
           {loading ? (
             <div className="py-8 text-center text-muted">Loading...</div>
           ) : following.length > 0 ? following.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 rounded-lg border border-line p-4 dark:border-darkLine">
                 <div className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-200 font-bold dark:bg-slate-800">
                   {(item.full_name || 'U').charAt(0).toUpperCase()}
                 </div>
                 <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-primary hover:underline">{item.full_name}</h3>
                    <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">{item.headline || item.position_title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.affiliation}</p>
                 </div>
                 <Button variant="secondary" className="shrink-0 gap-2 font-bold px-3 py-1 h-auto text-sm">
                    <Check size={16} /> Following
                 </Button>
              </div>
           )) : (
              <div className="py-8 text-center text-muted">Not following anyone yet.</div>
           )}
        </div>
    </div>
  );
}
