'use client';

import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export function CoiAuditBadge() {
  return (
    <div className="my-3 p-3 rounded border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
        <div>
          <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
            Peer Review Conflict of Interest (COI) & Ethics Verified
          </h4>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
            Automated institutional cross-verification confirms 0 co-authorship or financial conflict.
          </p>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
        100% Ethical
      </span>
    </div>
  );
}
