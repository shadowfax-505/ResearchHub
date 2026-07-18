'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createJob } from '@/lib/api';

export default function PostJobPage() {
  const [status, setStatus] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createJob({
        employer: String(form.get('employer') || ''),
        title: String(form.get('title') || ''),
        location: String(form.get('location') || ''),
        description: String(form.get('description') || ''),
        requirements: String(form.get('requirements') || ''),
        salary_range: String(form.get('salary_range') || ''),
        employment_type: String(form.get('employment_type') || 'Full-time')
      });
      setStatus('Job submitted for approval.');
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to post this job');
    }
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-ink dark:bg-darkCanvas dark:text-darkInk md:px-8"><div className="mx-auto max-w-3xl"><Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={16} /> Back to jobs</Link><section className="mt-6 rounded-soft border border-line bg-paper p-7 shadow-stitch dark:border-darkLine dark:bg-darkCard"><h1 className="text-3xl font-black">Post a research job</h1><p className="mt-2 text-muted dark:text-darkMuted">New opportunities are reviewed before they appear in the jobs feed.</p><form onSubmit={handleSubmit} className="mt-6 grid gap-4"><input required name="employer" className="h-12 rounded-lg border border-line bg-slate-50 px-3 dark:border-darkLine dark:bg-darkPanel" placeholder="Institution or employer" /><input required name="title" className="h-12 rounded-lg border border-line bg-slate-50 px-3 dark:border-darkLine dark:bg-darkPanel" placeholder="Job title" /><input required name="location" className="h-12 rounded-lg border border-line bg-slate-50 px-3 dark:border-darkLine dark:bg-darkPanel" placeholder="Location" /><select name="employment_type" className="h-12 rounded-lg border border-line bg-slate-50 px-3 dark:border-darkLine dark:bg-darkPanel"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Fellowship</option></select><input name="salary_range" className="h-12 rounded-lg border border-line bg-slate-50 px-3 dark:border-darkLine dark:bg-darkPanel" placeholder="Salary range (optional)" /><textarea required name="description" className="min-h-32 rounded-lg border border-line bg-slate-50 p-3 dark:border-darkLine dark:bg-darkPanel" placeholder="Describe the opportunity" /><textarea name="requirements" className="min-h-24 rounded-lg border border-line bg-slate-50 p-3 dark:border-darkLine dark:bg-darkPanel" placeholder="Requirements (optional)" /><button type="submit" className="rounded-lg bg-primary px-4 py-3 font-bold text-white">Submit for review</button></form>{status ? <p className="mt-4 text-sm font-bold text-primary" role="status">{status}</p> : null}</section></div></main>;
}
