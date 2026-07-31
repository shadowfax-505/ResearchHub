'use client';

import { Newspaper, ExternalLink } from 'lucide-react';

export function ScienceNewsTicker() {
  const news = [
    { outlet: 'Nature News', title: 'Stanford AI Model Benchmark Replaces Traditional Transformer Baseline', date: '2 hrs ago' },
    { outlet: 'MIT Tech Review', title: 'Quantum-Inspired Optimization Outperforms Classical Solvers in Trial', date: '5 hrs ago' },
    { outlet: 'Wired Science', title: 'Researchers Publish Open Multimodal Dataset on ResearchHub', date: '1 day ago' }
  ];

  return (
    <div className="mb-6 p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
      <div className="flex items-center gap-2 shrink-0">
        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-500 text-slate-950">
          Media Ticker
        </span>
        <span className="font-bold flex items-center gap-1">
          <Newspaper size={14} className="text-teal-400" /> Mainstream Science Coverage
        </span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto text-[11px] text-slate-300 w-full sm:w-auto">
        {news.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 shrink-0 hover:text-white cursor-pointer transition">
            <span className="font-bold text-teal-400">[{item.outlet}]</span>
            <span className="line-clamp-1">{item.title}</span>
            <ExternalLink size={10} className="text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
