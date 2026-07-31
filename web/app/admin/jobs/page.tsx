'use client';

export default function JobsAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Job Board Control</h1>
        <p className="text-sm text-slate-400">Review institutional academic listings, approve employer profiles, and feature openings.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Active Academic Job Postings</h2>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
          No pending employer job postings requiring approval.
        </div>
      </div>
    </div>
  );
}
