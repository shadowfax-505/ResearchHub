'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getResearchers, getInstitutionalRankings, PublicResearcherProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Search, Users, BookOpen, CheckCircle, Trophy, Building2, Download, Scale } from 'lucide-react';
import { InstitutionalComparison } from '@/components/researchers/institutional-comparison';

export default function ResearchersDirectory() {
  const [activeTab, setActiveTab] = useState<'directory' | 'rankings'>('directory');
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [researchers, setResearchers] = useState<PublicResearcherProfile[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [rankingQuery, setRankingQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResearchers(50, 0)
      .then(data => {
        setResearchers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    getInstitutionalRankings()
      .then(res => {
        if (res?.data) setRankings(res.data);
      })
      .catch(console.error);
  }, []);

  const filtered = researchers.filter((r) => {
    const text = `${r.full_name || ''} ${r.username || ''} ${r.affiliation || ''} ${r.department || ''} ${r.headline || ''}`.toLowerCase();
    const matchesQuery = !query.trim() || text.includes(query.toLowerCase());
    const matchesVerified = !verifiedOnly || Boolean(r.is_verified);
    const matchesDept = selectedDept === 'All' || (r.department && r.department.toLowerCase().includes(selectedDept.toLowerCase()));
    return matchesQuery && matchesVerified && matchesDept;
  });

  const filteredRankings = rankings.filter((inst) => {
    const name = (inst.institution || inst.name || inst.institution_name || '').toLowerCase();
    const matchesQuery = !rankingQuery.trim() || name.includes(rankingQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'All Countries' || (inst.country && inst.country.toLowerCase().includes(selectedCountry.toLowerCase()));
    return matchesQuery && matchesCountry;
  });

  function exportRankingsCsv() {
    if (!filteredRankings.length) return;
    const headers = ['Rank', 'Institution Name', 'Country', 'Researchers', 'Publications', 'Citations', 'Total Reads'];
    const rows = filteredRankings.map((inst, index) => [
      index + 1,
      `"${(inst.institution_name || '').replace(/"/g, '""')}"`,
      `"${(inst.country || '').replace(/"/g, '""')}"`,
      inst.researchers_count || 1,
      inst.publications_count || 0,
      inst.citations_count || 0,
      inst.reads_count || 0,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `institutional_rankings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg">
      {/* Header section */}
      <div className="bg-white border-b border-line shadow-sm dark:bg-darkCard dark:border-darkLine">
        <div className="max-w-[1000px] mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-ink dark:text-darkInk mb-2">Researchers & Institutions</h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-[15px]">
                Discover researchers worldwide or explore top university rankings by publication volume, citations, and scholarly reads.
              </p>
            </div>
          </div>

          <div className="flex border-b border-line dark:border-darkLine mt-6 mb-4 gap-6">
            <button
              onClick={() => setActiveTab('directory')}
              className={`pb-2.5 text-sm font-bold border-b-2 transition ${
                activeTab === 'directory'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Researchers Directory
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`pb-2.5 text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'rankings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Trophy size={16} className="text-amber-500" /> Institutional Rankings
            </button>
          </div>
          
          {activeTab === 'directory' && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search researchers by name or institution (e.g. Stanford, MIT)..." 
                    className="w-full h-10 pl-10 pr-4 border border-line rounded bg-slate-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-darkPanel dark:border-darkLine dark:text-darkInk text-sm"
                  />
                </div>
                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`h-10 px-4 rounded border text-xs font-bold transition flex items-center gap-1.5 ${
                    verifiedOnly
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-100 text-slate-700 border-line dark:bg-darkPanel dark:border-darkLine dark:text-slate-300'
                  }`}
                >
                  <CheckCircle size={14} /> Verified Researchers Only
                </button>
              </div>

              {/* Department Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                <span className="text-xs font-bold text-slate-500 shrink-0">Department:</span>
                {['All', 'Computer Science', 'Electrical Engineering', 'Medicine', 'Physics', 'Biology', 'Economics'].map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap border ${
                      selectedDept === dept
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary dark:bg-darkPanel dark:border-darkLine dark:text-slate-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        {activeTab === 'rankings' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-ink dark:text-darkInk flex items-center gap-2">
                <Building2 size={20} className="text-primary" /> Top Universities & Research Institutions
              </h2>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={rankingQuery}
                    onChange={e => setRankingQuery(e.target.value)}
                    placeholder="Search university name..."
                    className="w-full h-9 pl-9 pr-3 border border-line rounded bg-white outline-none focus:border-primary text-xs dark:bg-darkCard dark:border-darkLine dark:text-darkInk"
                  />
                </div>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="h-9 px-3 border border-line rounded bg-white outline-none focus:border-primary text-xs font-bold dark:bg-darkCard dark:border-darkLine dark:text-darkInk"
                >
                  <option value="All Countries">All Countries</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Germany">Germany</option>
                  <option value="Canada">Canada</option>
                  <option value="Japan">Japan</option>
                </select>
                <Button
                  onClick={exportRankingsCsv}
                  variant="outline"
                  className="h-9 px-3 text-xs font-bold border-primary text-primary hover:bg-primary/5 flex items-center gap-1.5 shrink-0"
                >
                  <Download size={14} /> Export CSV
                </Button>
                <Button
                  onClick={() => setShowCompareModal(true)}
                  className="h-9 px-3 text-xs font-bold bg-primary text-white hover:bg-primaryDark flex items-center gap-1.5 shrink-0"
                >
                  <Scale size={14} /> Compare Head-to-Head
                </Button>
                <span className="text-xs font-bold text-slate-500 shrink-0">{filteredRankings.length} Listed</span>
              </div>
            </div>

            <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden dark:bg-darkCard dark:border-darkLine">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-darkPanel text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-line dark:border-darkLine">
                    <tr>
                      <th className="py-3 px-4 w-16">Rank</th>
                      <th className="py-3 px-4">Institution Name</th>
                      <th className="py-3 px-4 text-center">Researchers</th>
                      <th className="py-3 px-4 text-center">Publications</th>
                      <th className="py-3 px-4 text-center">Citations</th>
                      <th className="py-3 px-4 text-right">Total Reads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line dark:divide-darkLine">
                    {filteredRankings.map((inst, index) => (
                      <tr key={inst.institution_name} className="hover:bg-slate-50/50 dark:hover:bg-darkPanel/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-500">
                          {index < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs text-white font-black ${
                              index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'
                            }`}>
                              #{index + 1}
                            </span>
                          ) : (
                            <span>#{index + 1}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-ink dark:text-darkInk">
                          {inst.institution_name}
                          {inst.country && <span className="block text-xs font-normal text-slate-500">{inst.country}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold">{inst.researchers_count || 1}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-primary">{inst.total_publications}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-teal-600 dark:text-teal-400">{inst.total_citations}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          {(inst.total_reads || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ink dark:text-darkInk">Popular Researchers</h2>
              <span className="text-sm text-slate-500 font-medium">{filtered.length} results</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white border border-line p-6 rounded shadow-sm flex gap-4 animate-pulse dark:bg-darkCard dark:border-darkLine">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-700"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 dark:bg-slate-700"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/3 dark:bg-slate-700"></div>
                      </div>
                    </div>
                 ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center bg-white border border-line rounded dark:bg-darkCard dark:border-darkLine text-slate-500 text-sm">
                No researchers found matching &quot;{query}&quot;.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map(researcher => (
                  <div key={researcher.user_id} className="bg-white border border-line p-5 rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine flex flex-col hover:border-slate-300 transition">
                    <div className="flex items-start gap-4 mb-4">
                      <Link href={`/profile/${researcher.slug}` as any} className="shrink-0">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-500 overflow-hidden">
                          {(researcher as any).profile_picture_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={(researcher as any).profile_picture_url} alt={researcher.full_name} className="h-full w-full object-cover" />
                          ) : (
                            (researcher.full_name || researcher.username || "?").charAt(0).toUpperCase()
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/profile/${researcher.slug}` as any} className="text-[17px] font-bold text-ink hover:text-primary hover:underline truncate block dark:text-darkInk">
                            {researcher.full_name || researcher.username}
                          </Link>
                          {researcher.is_verified ? <CheckCircle size={14} className="text-teal-500 shrink-0" /> : null}
                        </div>
                        <div className="text-[14px] text-slate-700 font-medium truncate dark:text-slate-300">
                          {researcher.affiliation || researcher.department || 'Independent Researcher'}
                        </div>
                        {researcher.headline && (
                          <div className="text-[13px] text-slate-500 truncate mt-0.5">
                            {researcher.headline}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                      <div className="flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5" title="Followers">
                          <Users size={14} className="text-slate-400" />
                          <span>{researcher.followers || 0} followers</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Publications">
                          <BookOpen size={14} className="text-slate-400" />
                          <span>{researcher.papers?.length || 0} publications</span>
                        </div>
                      </div>

                      <Link href={`/profile/${researcher.slug}` as any}>
                        <Button size="sm" variant="secondary" className="h-8 text-xs font-bold">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <InstitutionalComparison
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </div>
  );
}
