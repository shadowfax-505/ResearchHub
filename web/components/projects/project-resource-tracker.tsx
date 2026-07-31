'use client';

import { Cpu, Database, HardDrive } from 'lucide-react';

interface ProjectResourceTrackerProps {
  projectTitle: string;
}

export function ProjectResourceTracker({ projectTitle }: ProjectResourceTrackerProps) {
  return (
    <div className="mt-3 p-3 rounded bg-slate-50 border border-slate-200 dark:bg-darkPanel dark:border-darkLine space-y-2 text-xs">
      <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1"><Cpu size={14} className="text-primary" /> Compute Allocation</span>
        <span className="font-mono text-primary">140 / 500 A100 GPU hrs</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-primary" style={{ width: '28%' }} />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span className="flex items-center gap-1"><Database size={12} /> Dataset Storage: 1.4 TB</span>
        <span className="flex items-center gap-1"><HardDrive size={12} /> Cluster Node: Stanford GPU-04</span>
      </div>
    </div>
  );
}
