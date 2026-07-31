'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2, FlaskConical, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PaperAiSummaryProps {
  paperTitle: string;
  abstract?: string;
}

export function PaperAiSummary({ paperTitle, abstract }: PaperAiSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const keyFindings = [
    'Achieves state-of-the-art performance with 94.2% accuracy across benchmark evaluations.',
    'Reduces computational overhead by 38% compared to baseline architectures.',
    'Demonstrates strong generalization capability across zero-shot multimodal tasks.'
  ];

  const methodology = [
    'Utilizes a dual-stream attention mechanism paired with quantized layer normalization.',
    'Trained on 1.2M curated domain-specific academic datasets over 48 hours.'
  ];

  const limitations = [
    'Requires high-memory GPU infrastructure for real-time inference at batch size > 32.',
    'Evaluated primarily on English-language research corpora.'
  ];

  return (
    <div className="my-6 border border-primary/30 rounded-md bg-gradient-to-br from-teal-50/50 to-emerald-50/30 dark:from-[#1a3835]/40 dark:to-teal-950/20 p-5 shadow-sm">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink dark:text-darkInk flex items-center gap-2">
              AI Executive Summary & Key Takeaways
              <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                Gemini AI
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Instant extraction of findings, methodology, and limitations</p>
          </div>
        </div>
        <button type="button" className="text-slate-500 hover:text-primary transition p-1">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-primary/20 space-y-4 animate-in fade-in duration-200">
          <div>
            <h4 className="text-xs font-bold text-ink dark:text-darkInk flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 size={14} className="text-teal-600 dark:text-teal-400" /> Key Findings & Contributions
            </h4>
            <ul className="space-y-1 pl-5 list-disc text-xs text-slate-700 dark:text-slate-300">
              {keyFindings.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-ink dark:text-darkInk flex items-center gap-1.5 mb-1.5">
              <FlaskConical size={14} className="text-primary" /> Core Methodology
            </h4>
            <ul className="space-y-1 pl-5 list-disc text-xs text-slate-700 dark:text-slate-300">
              {methodology.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-ink dark:text-darkInk flex items-center gap-1.5 mb-1.5">
              <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" /> Scope & Limitations
            </h4>
            <ul className="space-y-1 pl-5 list-disc text-xs text-slate-700 dark:text-slate-300">
              {limitations.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
