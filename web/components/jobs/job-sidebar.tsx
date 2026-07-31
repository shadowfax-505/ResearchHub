import React from 'react';
import Link from 'next/link';
import { Bookmark, Info } from 'lucide-react';

interface FilterOption { name: string; count: number; }
interface JobSidebarProps {
  countries: FilterOption[];
  disciplines: FilterOption[];
  employmentTypes?: FilterOption[];
  remoteModes?: FilterOption[];
  careerLevels?: FilterOption[];
  selectedCountries: string[];
  selectedDisciplines: string[];
  employmentType: string;
  remoteMode: string;
  careerLevel: string;
  currency?: 'USD' | 'EUR' | 'GBP';
  minSalary?: number;
  onCurrencyChange?: (value: 'USD' | 'EUR' | 'GBP') => void;
  onMinSalaryChange?: (value: number) => void;
  onCountryToggle: (value: string) => void;
  onDisciplineToggle: (value: string) => void;
  onEmploymentTypeChange: (value: string) => void;
  onRemoteModeChange: (value: string) => void;
  onCareerLevelChange: (value: string) => void;
  onClear: () => void;
}

const DEFAULT_EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Temporary',
  'Postdoctoral Fellowship',
  'Tenured/Tenure-track Faculty',
  'Freelance',
  'Volunteer',
  'Apprenticeship'
];

const DEFAULT_REMOTE_MODES = [
  'On-site',
  'Hybrid',
  'Remote',
  'Fully Remote',
  'Flexible'
];

const DEFAULT_CAREER_LEVELS = [
  'Entry level',
  'Mid level',
  'Senior level',
  'Executive',
  'Director',
  'Student / Intern',
  'Principal',
  'Staff',
  'Manager'
];

export function JobSidebar({
  countries,
  disciplines,
  employmentTypes = [],
  remoteModes = [],
  careerLevels = [],
  selectedCountries,
  selectedDisciplines,
  employmentType,
  remoteMode,
  careerLevel,
  currency = 'USD',
  minSalary = 0,
  onCurrencyChange,
  onMinSalaryChange,
  onCountryToggle,
  onDisciplineToggle,
  onEmploymentTypeChange,
  onRemoteModeChange,
  onCareerLevelChange,
  onClear
}: JobSidebarProps) {
  const mergedEmploymentTypes = Array.from(
    new Set([
      ...employmentTypes.map(e => e.name || ''),
      ...DEFAULT_EMPLOYMENT_TYPES
    ])
  ).filter(Boolean).map(name => {
    const existing = employmentTypes.find(e => e.name === name);
    return { name, count: existing ? existing.count : 0 };
  });

  const mergedRemoteModes = Array.from(
    new Set([
      ...remoteModes.map(r => r.name || ''),
      ...DEFAULT_REMOTE_MODES
    ])
  ).filter(Boolean).map(name => {
    const existing = remoteModes.find(r => r.name === name);
    return { name, count: existing ? existing.count : 0 };
  });

  const mergedCareerLevels = Array.from(
    new Set([
      ...careerLevels.map(c => c.name || ''),
      ...DEFAULT_CAREER_LEVELS
    ])
  ).filter(Boolean).map(name => {
    const existing = careerLevels.find(c => c.name === name);
    return { name, count: existing ? existing.count : 0 };
  });

  const checkboxes = (title: string, options: FilterOption[], selected: string[], toggle: (value: string) => void) => (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">{title}</h4>
      <div className="max-h-56 space-y-2 overflow-y-auto">
        {options.map(option => (
          <label key={option.name} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
            <input type="checkbox" checked={selected.includes(option.name)} onChange={() => toggle(option.name)} className="h-4 w-4 rounded text-primary focus:ring-primary" />
            <span>{option.name} · {option.count}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="flex w-full flex-col gap-6">
      <div className="border border-primary/20 bg-primarySoft p-6">
        <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Looking to hire researchers?</h3>
        <p className="mb-5 text-sm text-gray-700 dark:text-slate-300">Post an opportunity and reach researchers whose work matches your team.</p>
        <Link href="/jobs/post" className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark">Post a job</Link>
      </div>

      <div className="rounded-sm border border-gray-200 bg-white dark:border-darkLine dark:bg-darkCard">
        <div className="flex items-center gap-2 border-b border-gray-200 p-4 dark:border-darkLine">
          <Bookmark className="h-5 w-5 text-gray-600" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white">Your bookmarked jobs</h3>
          <Info className="ml-auto h-4 w-4 text-gray-400" />
        </div>
        <div className="bg-gray-50 p-6 dark:bg-darkPanel">
          <p className="text-sm text-gray-600 dark:text-slate-300">Bookmark jobs to keep track of opportunities and return to them later.</p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Refine your search</h3>
          <button onClick={onClear} className="text-xs font-bold text-primary hover:underline">Clear all</button>
        </div>

        {/* Currency Switcher */}
        <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded dark:bg-darkPanel dark:border-darkLine">
          <label className="mb-2 block text-xs font-bold text-gray-900 dark:text-white">Display Currency</label>
          <div className="flex gap-1.5">
            {[
              ['USD', '$ USD'],
              ['EUR', '€ EUR'],
              ['GBP', '£ GBP']
            ].map(([cur, label]) => (
              <button
                key={cur}
                type="button"
                onClick={() => onCurrencyChange && onCurrencyChange(cur as any)}
                className={`flex-1 py-1 px-2 rounded text-xs font-bold transition border ${
                  currency === cur
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-primary dark:bg-darkCard dark:border-darkLine dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Salary Range Filter */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">Minimum Salary</label>
          <select
            value={minSalary}
            onChange={(e) => onMinSalaryChange && onMinSalaryChange(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-darkLine dark:text-white"
          >
            <option value={0}>Any Salary</option>
            <option value={50000}>$50,000+ / yr</option>
            <option value={80000}>$80,000+ / yr</option>
            <option value={100000}>$100,000+ / yr</option>
            <option value={120000}>$120,000+ / yr</option>
          </select>
        </div>

        {checkboxes('Countries', countries, selectedCountries, onCountryToggle)}
        {checkboxes('Disciplines', disciplines, selectedDisciplines, onDisciplineToggle)}

        <div className="mb-5">
          <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">Employment type</label>
          <select value={employmentType} onChange={event => onEmploymentTypeChange(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-darkLine dark:text-white">
            <option value="">All types</option>
            {mergedEmploymentTypes.map(option => <option key={option.name} value={option.name}>{option.name} {option.count > 0 ? `· ${option.count}` : ''}</option>)}
          </select>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">Work mode</label>
          <select value={remoteMode} onChange={event => onRemoteModeChange(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-darkLine dark:text-white">
            <option value="">Any mode</option>
            {mergedRemoteModes.map(option => <option key={option.name} value={option.name}>{option.name} {option.count > 0 ? `· ${option.count}` : ''}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">Career level</label>
          <select value={careerLevel} onChange={event => onCareerLevelChange(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-darkLine dark:text-white">
            <option value="">Any level</option>
            {mergedCareerLevels.map(option => <option key={option.name} value={option.name}>{option.name} {option.count > 0 ? `· ${option.count}` : ''}</option>)}
          </select>
        </div>
      </div>
    </aside>
  );
}
