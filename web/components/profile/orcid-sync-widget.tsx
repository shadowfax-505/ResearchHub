'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, Globe } from 'lucide-react';

export function OrcidSyncWidget() {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('Today at 10:45 AM');

  function handleSync() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSynced('Just now');
      alert('ORCID & Scopus External Publications Sync Complete! Imported 4 new indexed works.');
    }, 1200);
  }

  return (
    <div className="p-4 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-black text-xs font-mono">
          iD
        </div>
        <div>
          <h4 className="font-bold text-xs text-ink dark:text-white flex items-center gap-1.5">
            ORCID & Scopus Author Profile Synchronizer
            <span className="text-[10px] text-emerald-600 font-normal">● Connected</span>
          </h4>
          <p className="text-[11px] text-slate-500">ORCID iD: 0000-0002-1825-0097 &middot; Last synced: {lastSynced}</p>
        </div>
      </div>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-3 py-1.5 bg-slate-100 dark:bg-darkPanel text-slate-800 dark:text-slate-200 border border-line dark:border-darkLine rounded text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5 disabled:opacity-50"
      >
        <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
        {syncing ? 'Syncing...' : 'Sync Publications'}
      </button>
    </div>
  );
}
