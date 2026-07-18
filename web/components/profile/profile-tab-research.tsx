import { Button } from '@/components/ui/button';
import { FileText, List, MessageCircleQuestion, MessageSquare, UserPlus, FileLock2, PlusCircle } from 'lucide-react';
import { PublicResearcherProfile, getAuthorPapers } from '@/lib/api';
import { PaperCard } from '@/components/papers/paper-card';
import { useState, useEffect } from 'react';

export function ProfileTabResearch({ profile }: { profile: PublicResearcherProfile }) {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.user_id) return;
    getAuthorPapers(profile.user_id).then(res => {
      if (res?.data) {
        setPapers(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profile?.user_id]);
  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      {/* Left Sidebar Filters */}
      <aside className="space-y-6">
        <h2 className="text-xl font-bold">Research</h2>
        <nav className="space-y-1">
          <button className="flex w-full items-center justify-between rounded-lg bg-primarySoft px-3 py-2 text-sm font-bold text-primary dark:bg-primary/15">
            <div className="flex items-center gap-3"><List size={18} /> Research items</div>
          </button>
          
          <div className="ml-7 mt-2 space-y-1">
            {['Article', 'Conference Paper', 'Data', 'Research', 'Presentation', 'Poster', 'Preprint'].map(item => (
               <button key={item} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-darkPanel dark:hover:text-slate-300">
                 {item} <span className="text-xs text-muted">{item === 'Article' ? papers.length : 0}</span>
               </button>
            ))}
          </div>

          <div className="mt-4 space-y-1 border-t border-line pt-4 dark:border-darkLine">
             <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
               <div className="flex items-center gap-3"><MessageCircleQuestion size={18} className="text-slate-400" /> Questions</div>
               <span className="text-xs text-muted">0</span>
             </button>
             <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
               <div className="flex items-center gap-3"><MessageSquare size={18} className="text-slate-400" /> Answers</div>
               <span className="text-xs text-muted">0</span>
             </button>
             <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
               <div className="flex items-center gap-3"><UserPlus size={18} className="text-slate-400" /> Confirm your authorship</div>
             </button>
             <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
               <div className="flex items-center gap-3"><FileLock2 size={18} className="text-slate-400" /> Manage file visibility</div>
             </button>
          </div>
        </nav>
      </aside>

      {/* Right Content Area */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500">Loading publications...</div>
        ) : papers.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-xl font-black mb-4">Your publications</h3>
            {papers.map(paper => (
              <PaperCard key={paper.paper_id} paper={paper} />
            ))}
            <div className="flex justify-center mt-6">
               <Button variant="secondary">Add a publication</Button>
            </div>
          </div>
        ) : (
          <section className="flex flex-col items-center justify-center rounded-soft border-2 border-dashed border-line bg-slate-50 py-16 text-center dark:border-darkLine dark:bg-darkPanel">
             <div className="relative">
                <FileText size={48} className="text-slate-300 dark:text-slate-600" />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-white text-primary dark:bg-darkPanel"><PlusCircle size={20} /></div>
             </div>
             <h3 className="mt-4 text-xl font-black">Your publications</h3>
             <p className="mt-2 max-w-md text-sm text-muted dark:text-darkMuted">Add your publications to increase the visibility of your research. Once you&apos;ve added them, your publications will be listed here.</p>
             <Button className="mt-6">Add a publication</Button>
          </section>
        )}
      </div>
    </div>
  );
}
