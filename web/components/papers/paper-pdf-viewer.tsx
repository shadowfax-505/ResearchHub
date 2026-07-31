'use client';

import { useState } from 'react';
import { X, ExternalLink, Download, ZoomIn, ZoomOut, FileText } from 'lucide-react';

interface PaperPdfViewerProps {
  paperTitle: string;
  pdfUrl?: string;
  onClose: () => void;
}

export function PaperPdfViewer({ paperTitle, pdfUrl, onClose }: PaperPdfViewerProps) {
  const [zoom, setZoom] = useState(100);

  const displayUrl = pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-5xl h-[85vh] bg-white dark:bg-darkCard rounded-lg shadow-2xl overflow-hidden border border-line dark:border-darkLine">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="text-primary shrink-0" size={22} />
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate max-w-xl">{paperTitle}</h3>
              <p className="text-xs text-slate-400">In-App Scientific PDF Document Reader</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 rounded px-2 py-1 border border-slate-700 text-xs font-mono">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(70, z - 15))}
                className="p-1 hover:text-primary transition"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="px-1.5">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(150, z + 15))}
                className="p-1 hover:text-primary transition"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
              title="Open External PDF"
            >
              <ExternalLink size={16} />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded transition"
              title="Close Viewer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Frame Area */}
        <div className="flex-1 bg-slate-100 dark:bg-darkPanel relative overflow-hidden flex items-center justify-center">
          <iframe
            src={displayUrl}
            title={paperTitle}
            className="w-full h-full border-none transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          />
        </div>
      </div>
    </div>
  );
}
