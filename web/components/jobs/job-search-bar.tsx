import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const POPULAR_COUNTRIES = [
  'Bangladesh',
  'United States',
  'United Kingdom',
  'Germany',
  'Canada',
  'Australia',
  'Japan',
  'China',
  'France',
  'India',
  'Sweden',
  'Switzerland',
  'Singapore',
  'Netherlands'
];

const POPULAR_FIELDS = [
  'Computer Science',
  'Biology',
  'Physics',
  'Chemistry',
  'Engineering',
  'Mathematics',
  'Medicine',
  'Environmental Science',
  'Economics',
  'Neuroscience',
  'Materials Science',
  'Social Sciences'
];

export function JobSearchBar({
  query,
  country,
  discipline,
  onQueryChange,
  onCountryChange,
  onDisciplineChange,
  countries = [],
  disciplines = []
}: {
  query: string;
  country: string;
  discipline: string;
  onQueryChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onDisciplineChange: (value: string) => void;
  countries?: Array<{ name: string }>;
  disciplines?: Array<{ name: string }>;
}) {
  const mergedCountries = Array.from(
    new Set([
      ...countries.map(c => c.name || ''),
      ...POPULAR_COUNTRIES
    ])
  )
    .filter(Boolean)
    .sort();

  const mergedDisciplines = Array.from(
    new Set([
      ...disciplines.map(d => d.name || ''),
      ...POPULAR_FIELDS
    ])
  )
    .filter(Boolean)
    .sort();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
          placeholder="Search for jobs"
        />
      </div>
      
      <div className="flex gap-4 sm:w-auto w-full">
        <div className="relative w-full sm:w-48">
          <select value={country} onChange={event => onCountryChange(event.target.value)} className="block w-full pl-3 pr-10 py-3 text-base border border-gray-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md appearance-none bg-gray-50 text-gray-700">
            <option value="">All regions</option>
            {mergedCountries.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <div className="relative w-full sm:w-56">
          <select value={discipline} onChange={event => onDisciplineChange(event.target.value)} className="block w-full pl-3 pr-10 py-3 text-base border border-gray-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md appearance-none bg-gray-50 text-gray-700">
            <option value="">All research areas</option>
            {mergedDisciplines.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
