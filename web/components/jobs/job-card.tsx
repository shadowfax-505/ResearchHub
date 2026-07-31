import React from 'react';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';
import { JobApplicationModal } from './job-application-modal';

interface JobCardProps {
  id: string;
  title: string;
  institution: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: 'USD' | 'EUR' | 'GBP';
  isNew?: boolean;
  isEarlyApplicant?: boolean;
  logoUrl?: string;
  isBookmarked?: boolean;
  onBookmark?: (id: string, currentlyBookmarked: boolean) => Promise<boolean>;
}

export function JobCard({
  id,
  title,
  institution,
  location,
  salaryMin = 95000,
  salaryMax = 145000,
  currency = 'USD',
  isNew,
  isEarlyApplicant,
  logoUrl,
  isBookmarked,
  onBookmark
}: JobCardProps) {
  const [bookmarked, setBookmarked] = React.useState(Boolean(isBookmarked));
  const [hasApplied, setHasApplied] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);

  const rate = currency === 'EUR' ? 0.92 : currency === 'GBP' ? 0.79 : 1.0;
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const minSal = salaryMin ? Math.round((salaryMin * rate) / 1000) * 1000 : null;
  const maxSal = salaryMax ? Math.round((salaryMax * rate) / 1000) * 1000 : null;

  async function handleBookmark() {
    if (!onBookmark) return;
    try {
      const nextValue = await onBookmark(id, bookmarked);
      setBookmarked(nextValue);
      setStatus(nextValue ? 'Bookmarked' : 'Bookmark removed');
    } catch {
      setStatus('Unable to update bookmark');
    }
    window.setTimeout(() => setStatus(''), 2500);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col sm:flex-row justify-between hover:shadow-sm transition-shadow group mb-4">
      <div className="flex-grow pr-4">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
          <Link href={`/jobs/${id}`}>
            {title}
          </Link>
          {hasApplied && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ Application Submitted
            </span>
          )}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {minSal && maxSal ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              {symbol}{minSal.toLocaleString()} &ndash; {symbol}{maxSal.toLocaleString()} / yr
            </span>
          ) : null}
          {isEarlyApplicant && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              Be among the first to apply
            </span>
          )}
          {isNew && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              New
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-900 mb-1">
          {institution}
        </div>
        <div className="text-sm text-gray-500 mb-5">
          {location}
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href={`/jobs/${id}`}
            className="inline-flex items-center justify-center px-4 py-1.5 border border-primary text-sm font-medium rounded-full text-primary bg-white hover:bg-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className={`inline-flex items-center justify-center px-4 py-1.5 text-sm font-bold rounded-full transition-colors ${
              hasApplied ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-primary text-white hover:bg-primaryDark'
            }`}
          >
            {hasApplied ? 'Applied ✓' : 'Apply Now'}
          </button>
          <button type="button" onClick={handleBookmark} className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${bookmarked ? 'text-primary' : 'text-primary hover:text-primaryDark'}`}>
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>
        {status ? <p className="mt-2 text-xs font-semibold text-primary" role="status">{status}</p> : null}
      </div>
      
      {logoUrl && (
        <div className="hidden sm:block flex-shrink-0">
          <div className="w-16 h-16 border border-gray-100 flex items-center justify-center overflow-hidden bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoUrl} 
              alt={`${institution} logo`} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <JobApplicationModal
        jobId={Number(id) || 1}
        jobTitle={title}
        institution={institution}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmitted={() => setHasApplied(true)}
      />
    </div>
  );
}
