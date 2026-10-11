'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { PublicResearcherProfile } from '@/lib/api';
import { PaperCard } from '@/components/papers/paper-card';

export function ProfileTabResearch({ profile }: { profile: PublicResearcherProfile }) {
  const [filter, setFilter] = useState('all');
  const papers = profile.papers || [];
  const types = [...new Set(papers.map(paper => paper.publication_type || 'article'))];
  const shown = filter === 'all' ? papers : papers.filter(paper => (paper.publication_type || 'article') === filter);
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-2xl font-serif">Your publications</h2><Link className="text-sm font-semibold text-primary underline underline-offset-4" href="/submit">Add a publication ↗</Link></div>
    <nav aria-label="Publication types" className="flex flex-wrap gap-2">{['all', ...types].map(type => <button key={type} className="rounded-full border border-line px-4 py-2 text-xs capitalize aria-pressed:bg-primary aria-pressed:text-white" aria-pressed={filter === type} onClick={() => setFilter(type)}>{type} · {type === 'all' ? papers.length : papers.filter(paper => (paper.publication_type || 'article') === type).length}</button>)}</nav>
    <div className="space-y-4">{shown.map(paper => <PaperCard key={paper.paper_id} paper={paper} />)}</div>
    {!shown.length ? <div className="rh-empty"><FileText size={30} /><h3>A place for your next finding.</h3><p>{papers.length ? 'No publications of this type yet.' : 'Your publication records will appear here when you share your work.'}</p><Link href="/submit">Share your research ↗</Link></div> : null}
  </section>;
}
