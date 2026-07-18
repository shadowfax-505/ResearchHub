'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createFeedAction, followAuthor, followResearcher, recommendPaper, requestFullText, savePaper, submitReport, type PaperSummary } from '@/lib/api';
import { Button } from '@/components/ui/button';

function authorName(author: NonNullable<PaperSummary['authors']>[number]) {
  return author.full_name || author.name || 'Unknown author';
}

export function PaperCard({ paper, featured = false }: { paper: PaperSummary; featured?: boolean }) {
  const [status, setStatus] = useState('');
  const [isRecommended, setIsRecommended] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const authors = [...(paper.authors || [])].sort((a, b) => (a.author_order || 0) - (b.author_order || 0));
  const leadAuthor = authors[0];

  function flash(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(''), 3000);
  }

  async function handleSave() {
    try {
      await savePaper(paper.paper_id);
      flash('Saved to your research library');
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Sign in to save research');
    }
  }

  async function handleRecommend() {
    try {
      await recommendPaper(paper.paper_id);
      setIsRecommended(true);
      flash('Recommended successfully');
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Failed to recommend');
    }
  }

  async function handleRequestFullText() {
    try {
      await requestFullText(paper.paper_id);
      flash('Full-text request sent');
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Failed to request full-text');
    }
  }

  async function handleFollow() {
    if (!leadAuthor) {
      flash('This paper has no linked author record yet');
      return;
    }
    try {
      if (leadAuthor.claimed_user_id) {
        await followResearcher(leadAuthor.claimed_user_id);
        flash(`Following ${authorName(leadAuthor)}`);
      } else {
        await followAuthor(leadAuthor.author_id);
        flash(`Following author ${authorName(leadAuthor)}`);
      }
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Unable to follow author');
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/papers/${paper.paper_id}`);
      flash('Paper link copied');
    } catch {
      flash('Unable to copy paper link');
    }
  }

  async function handleReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await submitReport({
        target_type: 'paper',
        target_id: paper.paper_id,
        reason_code: String(form.get('reason_code') || 'other'),
        details: String(form.get('details') || '')
      });
      setShowReport(false);
      flash('Report submitted for review');
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Unable to submit report');
    }
  }

  async function handleNotInterested() {
    try {
      await createFeedAction(paper.paper_id, 'not_interested');
      flash('Paper removed from your feed');
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Sign in to personalize your feed');
    }
  }

  return (
    <article className="rounded-sm border border-line bg-white shadow-sm dark:border-darkLine dark:bg-darkCard">
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-darkMuted">
          <span className="rounded-sm bg-primarySoft px-2 py-1 text-primary dark:bg-primary/15">{paper.publication_type || (featured ? 'preprint' : 'article')}</span>
          <span>{paper.publication_date ? new Date(paper.publication_date).toLocaleDateString() : 'Date unavailable'}</span>
          <span>{paper.view_count || 0} reads</span>
          {paper.is_open_access ? <span className="text-emerald-600">Open access</span> : null}
        </div>

        {paper.cover_image_url && !imageFailed ? (
          <Link href={`/papers/${paper.paper_id}`} className="mt-4 block overflow-hidden rounded-lg border border-line bg-slate-100 dark:border-darkLine dark:bg-darkPanel">
            <img
              src={paper.cover_image_url}
              alt={`${paper.title} cover`}
              className="h-44 w-full object-cover transition duration-300 hover:scale-[1.01]"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </Link>
        ) : null}

        <h2 className="mt-3 text-xl font-bold leading-snug text-ink dark:text-darkInk">
          <Link href={`/papers/${paper.paper_id}`} className="transition hover:text-primary">{paper.title}</Link>
        </h2>

        {paper.abstract ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-darkMuted">{paper.abstract}</p> : null}
        {paper.journal_name ? <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{paper.journal_name}</p> : null}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          {authors.length ? authors.slice(0, 6).map((author, index) => (
            <span key={`${author.author_id}-${index}`} className="inline-flex items-center gap-1">
              {author.claimed_profile_slug ? (
                <Link href={`/researchers/${author.claimed_profile_slug}`} className="font-semibold hover:text-primary">{authorName(author)}</Link>
              ) : (
                <Link href={`/authors/${author.author_id}`} className="font-semibold hover:text-primary">{authorName(author)}</Link>
              )}
              {index < Math.min(authors.length, 6) - 1 ? <span className="text-slate-400">·</span> : null}
            </span>
          )) : <span className="text-slate-500">Author profile pending</span>}
          {authors.length > 6 ? <span className="text-slate-500">+{authors.length - 6} more</span> : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 dark:border-darkLine">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={handleRequestFullText} className="h-8 rounded-full border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5">Request full-text</Button>
            <Button variant="ghost" onClick={handleSave} className="h-8 rounded-full border border-line px-4 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary dark:border-darkLine dark:text-darkMuted">Save</Button>
          </div>
          <div className="flex flex-wrap gap-1">
            <Button variant="ghost" onClick={handleFollow} className="h-8 px-3 text-sm font-semibold text-slate-600 hover:text-primary dark:text-darkMuted">Follow author</Button>
            <Button variant="ghost" onClick={handleRecommend} className={`h-8 px-3 text-sm font-semibold ${isRecommended ? 'text-primary' : 'text-slate-600 hover:text-primary dark:text-darkMuted'}`}>Recommend</Button>
            <Button variant="ghost" onClick={handleShare} className="h-8 px-3 text-sm font-semibold text-slate-600 hover:text-primary dark:text-darkMuted">Share</Button>
            <Button variant="ghost" onClick={handleNotInterested} className="h-8 px-3 text-sm font-semibold text-slate-600 hover:text-primary dark:text-darkMuted">Not interested</Button>
            <Button variant="ghost" onClick={() => setShowReport(value => !value)} className="h-8 px-3 text-sm font-semibold text-slate-600 hover:text-primary dark:text-darkMuted">Report</Button>
          </div>
        </div>

        {showReport ? (
          <form onSubmit={handleReport} className="mt-3 grid gap-2 rounded-lg border border-line bg-slate-50 p-3 dark:border-darkLine dark:bg-darkPanel">
            <select name="reason_code" defaultValue="copyright" className="h-10 rounded border border-line bg-white px-2 text-sm dark:border-darkLine dark:bg-darkCard">
              <option value="copyright">Copyright concern</option><option value="spam">Spam or misleading</option><option value="harassment">Harassment</option><option value="other">Other</option>
            </select>
            <textarea name="details" required className="min-h-20 rounded border border-line bg-white p-2 text-sm dark:border-darkLine dark:bg-darkCard" placeholder="Tell the moderation team what is wrong" />
            <div className="flex justify-end"><Button type="submit" className="h-9 px-3 text-sm">Submit report</Button></div>
          </form>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-darkMuted">
          <span>{paper.citation_count || 0} citations</span>
          <span>{paper.download_count || 0} downloads</span>
          {paper.feed_reason ? <span className="capitalize">{paper.feed_reason.replaceAll('_', ' ')}</span> : null}
        </div>
        {status ? <p role="status" className="mt-3 text-sm font-bold text-primary">{status}</p> : null}
      </div>
    </article>
  );
}
