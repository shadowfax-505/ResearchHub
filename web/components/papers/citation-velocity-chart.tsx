'use client';

import { TrendingUp, BarChart2, Eye, Award } from 'lucide-react';

interface CitationVelocityChartProps {
  paperTitle: string;
  totalCitations?: number;
  totalReads?: number;
}

export function CitationVelocityChart({
  paperTitle,
  totalCitations = 48,
  totalReads = 1250
}: CitationVelocityChartProps) {
  const yearlyData = [
    { year: '2022', citations: 4, reads: 120 },
    { year: '2023', citations: 12, reads: 310 },
    { year: '2024', citations: 24, reads: 640 },
    { year: '2025', citations: 38, reads: 980 },
    { year: '2026', citations: Math.max(totalCitations, 48), reads: Math.max(totalReads, 1250) }
  ];

  const maxCitations = Math.max(...yearlyData.map(d => d.citations));

  return (
    <div className="space-y-6 bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line dark:border-darkLine pb-4">
        <div>
          <h3 className="text-xl font-bold text-ink dark:text-darkInk flex items-center gap-2">
            <BarChart2 className="text-primary" size={22} /> Citation Velocity & Impact Trajectory
          </h3>
          <p className="text-xs text-muted dark:text-darkMuted mt-1">
            Historical trajectory and annual citation volume growth for this paper.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
          <TrendingUp size={14} /> Top 5% Citation Velocity
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-darkPanel border border-line dark:border-darkLine rounded-lg">
          <span className="text-xs font-bold text-slate-500 block">Total Citations</span>
          <span className="text-2xl font-black text-ink dark:text-darkInk mt-1 block">{totalCitations}</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp size={12} /> +14 this year
          </span>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-darkPanel border border-line dark:border-darkLine rounded-lg">
          <span className="text-xs font-bold text-slate-500 block">Scholarly Reads</span>
          <span className="text-2xl font-black text-ink dark:text-darkInk mt-1 block">{totalReads.toLocaleString()}</span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 inline-flex items-center gap-1">
            <Eye size={12} /> 120 reads/mo avg
          </span>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-darkPanel border border-line dark:border-darkLine rounded-lg">
          <span className="text-xs font-bold text-slate-500 block">Field Impact Score</span>
          <span className="text-2xl font-black text-ink dark:text-darkInk mt-1 block">94.8 / 100</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 inline-flex items-center gap-1">
            <Award size={12} /> High Impact Benchmark
          </span>
        </div>
      </div>

      {/* Annual Citation Growth Bar Chart */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Annual Citation Growth Rate</h4>
        <div className="flex items-end gap-3 h-44 pt-6 pb-2 px-4 bg-slate-50 dark:bg-darkPanel rounded-lg border border-line dark:border-darkLine">
          {yearlyData.map(d => {
            const heightPct = Math.round((d.citations / maxCitations) * 100);
            return (
              <div key={d.year} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[11px] font-bold text-primary mb-1 opacity-0 group-hover:opacity-100 transition">
                  {d.citations}
                </span>
                <div
                  className="w-full max-w-[40px] bg-gradient-to-t from-primary to-teal-500 rounded-t transition-all duration-500 group-hover:brightness-110"
                  style={{ height: `${Math.max(heightPct, 10)}%` }}
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">{d.year}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
