'use client';

import { CheckCircle, Star, Award, BookOpen, Users } from 'lucide-react';

interface ScholarBadgesProps {
  profile: {
    is_verified?: boolean;
    researcher_verified_at?: string | null;
    rg_score?: number;
    citations?: number;
    total_reads?: number;
    papers?: any[];
  };
}

export function ScholarBadges({ profile }: ScholarBadgesProps) {
  const isVerified = Boolean(profile.is_verified || profile.researcher_verified_at);
  const totalPapers = profile.papers?.length || 0;
  const totalCitations = profile.citations || 0;
  const totalReads = profile.total_reads || 0;
  const score = profile.rg_score || 0;

  const badges = [
    isVerified && {
      key: 'verified',
      label: 'Verified Scholar',
      icon: CheckCircle,
      bg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800'
    },
    totalPapers >= 1 && {
      key: 'author',
      label: 'Published Author',
      icon: BookOpen,
      bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800'
    },
    (score >= 10 || totalCitations >= 5) && {
      key: 'top_reviewer',
      label: 'Peer Reviewer',
      icon: Star,
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
    },
    (totalReads >= 100 || totalCitations >= 20) && {
      key: 'citations',
      label: totalCitations >= 50 ? '50+ Citations' : '100+ Reads Milestone',
      icon: Award,
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
    },
    totalPapers >= 2 && {
      key: 'coauthor',
      label: 'Co-Author Star',
      icon: Users,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
    }
  ].filter(Boolean) as Array<{ key: string; label: string; icon: any; bg: string }>;

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {badges.map(b => {
        const Icon = b.icon;
        return (
          <span
            key={b.key}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition ${b.bg}`}
          >
            <Icon size={13} />
            {b.label}
          </span>
        );
      })}
    </div>
  );
}
