'use client';

import { useState } from 'react';
import { DollarSign, X, Calculator, PieChart } from 'lucide-react';

interface GrantBudgetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GrantBudgetCalculatorModal({ isOpen, onClose }: GrantBudgetCalculatorModalProps) {
  const [postDocs, setPostDocs] = useState(2);
  const [gpuHours, setGpuHours] = useState(1000);
  const [faRate, setFaRate] = useState(52.5);

  if (!isOpen) return null;

  const salaryCost = postDocs * 75000;
  const computeCost = gpuHours * 2.5;
  const directCost = salaryCost + computeCost + 15000; // $15k travel/supplies
  const indirectCost = directCost * (faRate / 100);
  const totalBudget = directCost + indirectCost;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-darkCard rounded-lg border border-line dark:border-darkLine shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-teal-400" />
            <h3 className="font-bold text-sm">AI Research Grant Financial Budget Calculator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Post-Doc Researchers</label>
              <input
                type="number"
                min="0"
                value={postDocs}
                onChange={(e) => setPostDocs(Number(e.target.value))}
                className="w-full text-xs p-2 border border-line dark:border-darkLine rounded bg-slate-50 dark:bg-darkPanel dark:text-white outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">GPU Compute Hours</label>
              <input
                type="number"
                min="0"
                value={gpuHours}
                onChange={(e) => setGpuHours(Number(e.target.value))}
                className="w-full text-xs p-2 border border-line dark:border-darkLine rounded bg-slate-50 dark:bg-darkPanel dark:text-white outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Indirect F&A Overhead %</label>
              <input
                type="number"
                step="0.5"
                value={faRate}
                onChange={(e) => setFaRate(Number(e.target.value))}
                className="w-full text-xs p-2 border border-line dark:border-darkLine rounded bg-slate-50 dark:bg-darkPanel dark:text-white outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 text-white rounded border border-slate-800 space-y-2 font-mono">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Direct Costs (Salaries + Compute + Travel):</span>
              <span>${directCost.toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Indirect F&A Overhead Rate ({faRate}%):</span>
              <span>${indirectCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm text-teal-400">
              <span>Estimated Total Grant Request:</span>
              <span>${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-darkPanel border-t border-line dark:border-darkLine flex justify-between items-center">
          <button
            onClick={() => alert(`Exported Budget Summary PDF: $${totalBudget.toLocaleString()} USD`)}
            className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-xs font-bold hover:bg-slate-300 transition"
          >
            Export Budget Summary
          </button>
          <button onClick={onClose} className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
