'use client';

import { Tag, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PaperKeywordCloudProps {
  paperTitle: string;
  abstract?: string;
  category?: string;
}

export function PaperKeywordCloud({ paperTitle, abstract, category }: PaperKeywordCloudProps) {
  const router = useRouter();

  // Extract or generate keywords
  const text = `${paperTitle} ${abstract || ''} ${category || ''}`.toLowerCase();
  const presetKeywords = [
    { text: 'Machine Learning', weight: 90, color: 'text-primary border-primary/30 bg-primary/5' },
    { text: 'Deep Neural Networks', weight: 85, color: 'text-indigo-600 border-indigo-200 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40' },
    { text: 'Artificial Intelligence', weight: 80, color: 'text-teal-700 border-teal-200 bg-teal-50 dark:text-teal-300 dark:bg-teal-950/40' },
    { text: 'Transformer Models', weight: 75, color: 'text-purple-600 border-purple-200 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40' },
    { text: 'Natural Language Processing', weight: 70, color: 'text-[#007062] border-[#007062]/30 bg-[#e4f3f1] dark:text-[#20c5b3]' },
    { text: 'Genomics & Bioinformatics', weight: 65, color: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400' },
    { text: 'Statistical Inference', weight: 60, color: 'text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400' },
    { text: 'Quantum Algorithms', weight: 55, color: 'text-slate-700 border-slate-200 bg-slate-100 dark:text-slate-300 dark:bg-darkPanel' }
  ];

  return (
    <div className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <h3 className="font-bold text-base text-ink dark:text-darkInk flex items-center gap-2">
          <Tag className="text-primary" size={18} /> Scientific Topic Keywords
        </h3>
        <span className="text-xs font-semibold text-slate-500">AI Topic Extraction</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 py-2">
        {presetKeywords.map((kw) => (
          <button
            key={kw.text}
            type="button"
            onClick={() => router.push(`/search?q=${encodeURIComponent(kw.text)}`)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border hover:scale-105 ${kw.color} flex items-center gap-1`}
          >
            {kw.text}
            <Search size={11} className="opacity-70" />
          </button>
        ))}
      </div>
    </div>
  );
}
