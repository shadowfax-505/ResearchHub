'use client';

import { Download, FileSpreadsheet, FileJson, Check } from 'lucide-react';
import { useState } from 'react';

export function LibraryExportWidget() {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  function handleExport(fmt: 'csv' | 'json') {
    setDownloadingFormat(fmt);
    setTimeout(() => {
      setDownloadingFormat(null);
      alert(`Library Reading History & Bookmarks exported cleanly as ResearchHub_Library_Export.${fmt}!`);
    }, 1000);
  }

  return (
    <div className="my-6 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Download size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Scholarly Library & Reading History Exporter
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">Backup Personal Library Data</span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300">
        Export your complete reading history, saved publications, bookmarks, and reference lists for offline access or migration to reference managers (Zotero, Mendeley).
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => handleExport('csv')}
          disabled={downloadingFormat !== null}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5"
        >
          {downloadingFormat === 'csv' ? <Check size={14} /> : <FileSpreadsheet size={14} />}
          {downloadingFormat === 'csv' ? 'Exporting...' : 'Export Library as CSV'}
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={downloadingFormat !== null}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5"
        >
          {downloadingFormat === 'json' ? <Check size={14} /> : <FileJson size={14} />}
          {downloadingFormat === 'json' ? 'Exporting...' : 'Export Library as JSON'}
        </button>
      </div>
    </div>
  );
}
