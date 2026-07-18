import { useState, useEffect } from 'react';
import { PublicResearcherProfile, getSavedPapers } from '@/lib/api';
import { PaperCard } from '@/components/papers/paper-card';

export function ProfileTabSaved({ profile: _profile }: { profile?: PublicResearcherProfile }) {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedPapers()
      .then(res => {
        setPapers(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="mb-4 text-xl font-black text-ink dark:text-darkInk">Saved Papers ({papers.length})</h2>
      
      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="py-8 text-center text-muted">Loading saved papers...</div>
        ) : papers.length > 0 ? (
          papers.map(paper => (
            <PaperCard key={paper.paper_id || paper.saved_id} paper={paper} />
          ))
        ) : (
          <div className="py-8 text-center text-muted">No saved papers yet.</div>
        )}
      </div>
    </div>
  );
}
