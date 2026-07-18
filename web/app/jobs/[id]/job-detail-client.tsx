'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark, MapPin } from 'lucide-react';
import { getJob, toggleJobBookmark, type JobSummary } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function JobDetailClient({ id }: { id: string }) {
  const [job, setJob] = useState<JobSummary | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getJob(id).then(result => {
      setJob(result.data || null);
      setBookmarked(Boolean(result.data?.is_bookmarked || result.data?.IS_BOOKMARKED));
    }).catch(() => setStatus('This opportunity is not available.'));
  }, [id]);

  async function handleBookmark() {
    try {
      const result = await toggleJobBookmark(id);
      setBookmarked(result.data?.saved ?? !bookmarked);
      setStatus(result.data?.saved ? 'Job saved' : 'Job removed from saved jobs');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save this job');
    }
  }

  if (!job) return <main className="mx-auto max-w-3xl p-8 text-muted">{status || 'Loading opportunity...'}</main>;
  const title = job.title || job.TITLE || 'Research opportunity';
  const institution = job.institution_name || job.INSTITUTION_NAME || job.employer || job.EMPLOYER || 'ResearchHub institution';
  const location = [job.city || job.CITY, job.country || job.COUNTRY, job.location].filter(Boolean).join(', ');
  const description = job.description || job.DESCRIPTION || 'No description provided.';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-ink dark:bg-darkCanvas dark:text-darkInk md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={16} /> Back to jobs</Link>
        <article className="mt-6 rounded-soft border border-line bg-paper p-7 shadow-stitch dark:border-darkLine dark:bg-darkCard">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-primary">{institution}</p>
              <h1 className="mt-2 text-3xl font-black">{title}</h1>
              {location ? <p className="mt-3 flex items-center gap-2 text-muted dark:text-darkMuted"><MapPin size={16} /> {location}</p> : null}
            </div>
            <Button type="button" variant="secondary" onClick={handleBookmark}><Bookmark size={16} className={bookmarked ? 'fill-current' : ''} /> {bookmarked ? 'Saved' : 'Save job'}</Button>
          </div>
          <div className="mt-8 whitespace-pre-wrap border-t border-line pt-6 leading-7 text-muted dark:border-darkLine dark:text-darkMuted">{description}</div>
          {status ? <p className="mt-4 text-sm font-bold text-primary" role="status">{status}</p> : null}
        </article>
      </div>
    </main>
  );
}
