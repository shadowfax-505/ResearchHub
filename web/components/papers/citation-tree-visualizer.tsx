'use client';

import { useState } from 'react';
import { GitCommit, ArrowUpRight, Share2, Layers } from 'lucide-react';

interface CitationTreeVisualizerProps {
  paperTitle: string;
}

export function CitationTreeVisualizer({ paperTitle }: CitationTreeVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const parentCitations = [
    { title: 'Attention Is All You Need', authors: 'Vaswani et al., 2017', citations: '110,400+' },
    { title: 'Deep Residual Learning for Image Recognition', authors: 'He et al., 2016', citations: '198,000+' }
  ];

  const downstreamCitations = [
    { title: 'Scalable Multimodal Pre-training Architectures', authors: 'Chen et al., 2026', citations: '42' },
    { title: 'Efficient Zero-Shot Task Transfer in Neural Nets', authors: 'Kowalski et al., 2026', citations: '19' },
    { title: 'Quantum-Inspired Transformer Optimization', authors: 'Yamamoto et al., 2026', citations: '8' }
  ];

  return (
    <div className="my-6 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-line dark:border-darkLine pb-3">
        <h3 className="font-bold text-sm text-ink dark:text-darkInk flex items-center gap-2">
          <GitCommit size={18} className="text-primary" /> Interactive Citation Lineage Graph
        </h3>
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Layers size={14} /> 5 Connected Node Lineages
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-center text-xs">
        {/* Parent Nodes */}
        <div className="space-y-3">
          <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Foundation Papers (Inputs)</p>
          {parentCitations.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedNode(item.title)}
              className={`p-3 rounded border cursor-pointer transition ${
                selectedNode === item.title
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 bg-slate-50 hover:border-primary/50 dark:border-darkLine dark:bg-darkPanel dark:text-slate-300'
              }`}
            >
              <p className="font-bold line-clamp-1">{item.title}</p>
              <p className="text-[11px] text-slate-500 mt-1">{item.authors} &middot; {item.citations} citations</p>
            </div>
          ))}
        </div>

        {/* Current Node */}
        <div className="p-4 rounded-md border-2 border-primary bg-primarySoft/30 dark:bg-darkPanel text-center space-y-2 shadow-sm">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-white">
            Current Publication
          </span>
          <p className="font-black text-sm text-ink dark:text-darkInk line-clamp-2">{paperTitle}</p>
          <p className="text-xs text-primary font-bold">Citation Growth Rate: +24% / quarter</p>
        </div>

        {/* Downstream Nodes */}
        <div className="space-y-3">
          <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Derived Works (Outputs)</p>
          {downstreamCitations.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedNode(item.title)}
              className={`p-3 rounded border cursor-pointer transition ${
                selectedNode === item.title
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 bg-slate-50 hover:border-primary/50 dark:border-darkLine dark:bg-darkPanel dark:text-slate-300'
              }`}
            >
              <p className="font-bold line-clamp-1 flex items-center justify-between">
                <span>{item.title}</span>
                <ArrowUpRight size={12} className="shrink-0 text-slate-400" />
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{item.authors} &middot; {item.citations} citations</p>
            </div>
          ))}
        </div>
      </div>

      {selectedNode && (
        <div className="mt-4 p-3 rounded bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center justify-between">
          <span>Selected Citation Node: <strong>{selectedNode}</strong></span>
          <button type="button" onClick={() => setSelectedNode(null)} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
