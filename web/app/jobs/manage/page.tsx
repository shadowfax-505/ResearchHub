'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBookmarkedJobs, type JobSummary } from '@/lib/api';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [status, setStatus] = useState('Loading saved jobs...');

  useEffect(() => {
    getBookmarkedJobs().then(result => {
      setJobs(result.data || []);
      setStatus('');
    }).catch(error => setStatus(error instanceof Error ? error.message : 'Unable to load saved jobs'));
  }, []);

  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-ink dark:bg-darkCanvas dark:text-darkInk md:px-8"><div className="mx-auto max-w-3xl"><Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={16} /> Back to jobs</Link><section className="mt-6 rounded-soft border border-line bg-paper p-7 shadow-stitch dark:border-darkLine dark:bg-darkCard"><h1 className="text-3xl font-black">Your saved jobs</h1>{status ? <p className="mt-5 text-sm text-muted dark:text-darkMuted">{status}</p> : jobs.length ? <div className="mt-6 space-y-3">{jobs.map(job => <Link key={job.job_id || job.JOB_ID} href={`/jobs/${job.job_id || job.JOB_ID}`} className="block rounded-lg border border-line p-4 hover:border-primary dark:border-darkLine"><h2 className="font-black">{job.title || job.TITLE}</h2><p className="mt-1 text-sm text-muted dark:text-darkMuted">{job.employer || job.institution_name || 'Research opportunity'}</p></Link>)}</div> : <p className="mt-5 text-sm text-muted dark:text-darkMuted">You have no saved jobs yet.</p>}</section></div></main>;
}
