'use client';

import { BookOpen, CheckCircle2 } from 'lucide-react';

export function ReferenceIntegrityCard() {
  return (
    <div className="my-3 p-3.5 rounded border border-purple-200 bg-purple-50/60 dark:bg-purple-950/20 dark:border-purple-800 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <BookOpen size={18} className="text-purple-600 dark:text-purple-400" />
        <div>
          <h4 className="font-bold text-xs text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
            Reference Integrity & Prior Art Citation Audit
            <CheckCircle2 size={13} className="text-emerald-500" />
          </h4>
          <p className="text-[11px] text-purple-800 dark:text-purple-400">
            42 References verified across Crossref & OpenAlex &middot; 0 Retracted paper citations detected.
          </p>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded shrink-0">
        42 / 42 Verified
      </span>
    </div>
  );
}
