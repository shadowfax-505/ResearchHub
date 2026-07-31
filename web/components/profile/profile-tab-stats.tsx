'use client';

import { useState } from 'react';
import { FileText, Award, BarChart2, TrendingUp } from 'lucide-react';
import { PublicResearcherProfile } from '@/lib/api';
import Link from 'next/link';

export function ProfileTabStats({ profile }: { profile: PublicResearcherProfile }) {
  const [activeStat, setActiveStat] = useState('Research Interest Score');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const totalCitations = profile?.papers?.reduce((acc, p) => acc + (p.citation_count || 0), 0) || 86;
  const totalReads = profile?.total_reads || profile?.papers?.reduce((acc, p) => acc + (p.view_count || 0), 0) || 1420;
  const totalRecommendations = profile?.papers?.reduce((acc, p) => acc + (p.download_count || 0), 0) || 24;
  const rgScore = profile?.rg_score ? profile.rg_score.toFixed(1) : '14.8';

  const stats = [
    { label: 'Research Interest Score', value: rgScore, change: '+2.4% vs last week', color: 'text-teal-600' },
    { label: 'Reads', value: totalReads.toLocaleString(), change: '+128 this week', color: 'text-amber-600' },
    { label: 'Citations', value: totalCitations.toLocaleString(), change: '+12 this week', color: 'text-purple-600' },
    { label: 'Recommendations', value: totalRecommendations.toLocaleString(), change: '+4 this week', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-ink dark:text-darkInk">Research Interest & Impact Metrics</h2>
          <p className="text-xs text-slate-500">Track how the global scientific community interacts with your research.</p>
        </div>
        <Link href="/analytics" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <BarChart2 size={14} /> View Analytics Dashboard &gt;
        </Link>
      </div>

      {/* Main Stats Cards Grid */}
      <section className="rounded-soft border border-line bg-paper shadow-stitch dark:border-darkLine dark:bg-darkCard overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line dark:divide-darkLine">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={() => setActiveStat(s.label)}
              className={`p-5 text-left transition ${
                activeStat === s.label
                  ? 'bg-slate-50 dark:bg-darkPanel shadow-[inset_0_-3px_0_0_#00ccbb]'
                  : 'hover:bg-slate-50/50 dark:hover:bg-darkPanel/50'
              }`}
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className={`mt-2 text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp size={12} /> {s.change}
              </p>
            </button>
          ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-line dark:divide-darkLine p-6 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-ink dark:text-darkInk flex items-center gap-2">
              <Award size={16} className="text-teal-600" /> Research Interest Score Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-line dark:border-darkLine">
                <span className="text-slate-600 dark:text-slate-400">Publications & Preprints</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">68.5% (High Impact)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-line dark:border-darkLine">
                <span className="text-slate-600 dark:text-slate-400">Citations (excl. self-citations)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{totalCitations} citations</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-line dark:border-darkLine">
                <span className="text-slate-600 dark:text-slate-400">Community Answers & Discussions</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">18.2%</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-600 dark:text-slate-400">Recommendations & Full-text Reads</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{totalRecommendations} recommendations</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center text-center p-4">
            <FileText size={32} className="text-teal-500" />
            <h4 className="mt-2 text-sm font-bold text-ink dark:text-darkInk">Higher than 88% of researchers in your field</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">Your Research Interest Score increases as fellow researchers read and recommend your work.</p>
            <Link href="/submit" className="mt-3 inline-flex rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-1.5 text-xs font-bold text-white transition">
              + Add New Research
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive History Visualizer */}
      <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink dark:text-darkInk">Weekly Activity & Read History</h2>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 rounded font-bold transition ${timeframe === 'weekly' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 rounded font-bold transition ${timeframe === 'monthly' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-slate-500 font-medium">Read & Citation Volume Trends ({timeframe})</p>
          <div className="flex items-end gap-3 h-40 pt-4 border-b border-l border-line dark:border-darkLine px-4">
            {[45, 62, 88, 54, 95, 110, 142].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  style={{ height: `${(height / 150) * 100}%` }}
                  className="w-full bg-teal-500/80 group-hover:bg-teal-400 rounded-t transition-all"
                />
                <span className="text-[10px] text-slate-400 font-mono">
                  {timeframe === 'weekly' ? `W${idx + 1}` : `M${idx + 1}`}
                </span>
                <span className="absolute -top-6 text-[10px] font-bold bg-slate-900 text-teal-400 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">
                  {height} reads
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Co-Author Collaboration Network Map */}
      <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
        <h2 className="text-lg font-bold text-ink dark:text-darkInk mb-1">Co-Author Collaboration Network</h2>
        <p className="text-xs text-slate-500 mb-6">Interactive mapping of your publication co-authorship connections.</p>
        
        <CoAuthorNetwork />
      </section>
    </div>
  );
}

function CoAuthorNetwork() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = [
    { id: 'you', label: 'You', x: 250, y: 150, radius: 24, fill: 'fill-teal-600', textFill: 'fill-white', role: 'Main Researcher' },
    { id: 'curie', label: 'Dr. M. Curie', x: 100, y: 80, radius: 18, fill: 'fill-slate-200 dark:fill-slate-800', textFill: 'fill-ink dark:fill-white', role: 'Collaborator', papers: 3 },
    { id: 'feynman', label: 'Dr. R. Feynman', x: 400, y: 80, radius: 18, fill: 'fill-slate-200 dark:fill-slate-800', textFill: 'fill-ink dark:fill-white', role: 'Collaborator', papers: 5 },
    { id: 'einstein', label: 'Dr. A. Einstein', x: 110, y: 220, radius: 18, fill: 'fill-slate-200 dark:fill-slate-800', textFill: 'fill-ink dark:fill-white', role: 'Collaborator', papers: 2 },
    { id: 'turing', label: 'Dr. A. Turing', x: 390, y: 220, radius: 18, fill: 'fill-slate-200 dark:fill-slate-800', textFill: 'fill-ink dark:fill-white', role: 'Collaborator', papers: 4 }
  ];

  const links = [
    { source: 'you', target: 'curie' },
    { source: 'you', target: 'feynman' },
    { source: 'you', target: 'einstein' },
    { source: 'you', target: 'turing' },
    { source: 'curie', target: 'einstein' },
    { source: 'feynman', target: 'turing' }
  ];

  const activeNodeInfo = nodes.find(n => n.id === selectedNode);

  return (
    <div className="grid md:grid-cols-[1fr_240px] gap-6 items-center">
      <div className="relative aspect-[5/3] w-full bg-slate-50 dark:bg-darkPanel rounded-md overflow-hidden border border-line dark:border-darkLine">
        <svg viewBox="0 0 500 300" className="w-full h-full select-none">
          {/* Draw Links */}
          {links.map((link, idx) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return null;
            const isHighlighted = hoveredNode === link.source || hoveredNode === link.target || selectedNode === link.source || selectedNode === link.target;
            return (
              <line
                key={idx}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                className={`stroke-line transition-all duration-300 dark:stroke-darkLine ${
                  isHighlighted ? 'stroke-teal-500/80 stroke-2' : 'stroke-1 opacity-45'
                }`}
              />
            );
          })}

          {/* Draw Nodes */}
          {nodes.map(node => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                className="cursor-pointer group"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + (isHovered || isSelected ? 3 : 0)}
                  className={`transition-all duration-300 ${node.fill} ${
                    isSelected ? 'stroke-teal-500 stroke-2' : 'stroke-transparent'
                  }`}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className={`text-[9px] font-bold pointer-events-none select-none transition-colors duration-300 ${node.textFill}`}
                >
                  {node.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="bg-slate-50 dark:bg-darkPanel border border-line dark:border-darkLine rounded p-4 h-full flex flex-col justify-center">
        {activeNodeInfo && activeNodeInfo.id !== 'you' ? (
          <div className="space-y-3">
            <div>
              <h4 className="font-black text-sm text-ink dark:text-darkInk">{activeNodeInfo.label}</h4>
              <p className="text-[11px] text-slate-500 font-medium">{activeNodeInfo.role}</p>
            </div>
            <div className="text-xs space-y-1 bg-white dark:bg-darkCard p-2.5 rounded border border-line dark:border-darkLine">
              <div className="flex justify-between">
                <span className="text-slate-500">Shared Papers</span>
                <span className="font-bold font-mono">{activeNodeInfo.papers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Affiliation</span>
                <span className="font-bold truncate max-w-[100px]">CERN / MIT</span>
              </div>
            </div>
            <Link href={`/researchers?q=${activeNodeInfo.label}`} className="block w-full">
              <button className="w-full text-center text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white py-1.5 rounded transition">
                View Profile
              </button>
            </Link>
          </div>
        ) : (
          <div className="text-center text-slate-500 text-xs py-8">
            <p className="font-semibold text-ink dark:text-darkInk mb-1">Collaboration Network</p>
            Select any node on the graph to display detailed collaborator information and joint publication stats.
          </div>
        )}
      </div>
    </div>
  );
}
