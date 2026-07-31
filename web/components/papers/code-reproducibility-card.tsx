'use client';

import { Terminal, CheckCircle2, Play } from 'lucide-react';

export function CodeReproducibilityCard() {
  return (
    <div className="my-3 p-3.5 rounded border border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-800 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Terminal size={18} className="text-blue-600 dark:text-blue-400" />
        <div>
          <h4 className="font-bold text-xs text-blue-950 dark:text-blue-300 flex items-center gap-1.5">
            Code & Artifact Reproducibility Audit Passed
            <CheckCircle2 size={13} className="text-emerald-500" />
          </h4>
          <p className="text-[11px] text-blue-800 dark:text-blue-400">
            Containerized Docker image executed successfully &middot; Verified on PyTorch 2.4 GPU cluster.
          </p>
        </div>
      </div>
      <button
        onClick={() => alert('Launching Containerized Interactive Jupyter Notebook in Cloud Sandbox...')}
        className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1 shrink-0"
      >
        <Play size={12} /> Run Code Sandbox
      </button>
    </div>
  );
}
