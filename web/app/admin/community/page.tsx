'use client';

export default function CommunityAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Community & Q&A Moderation</h1>
        <p className="text-sm text-slate-400">Oversee scientific discussions, resolve spam reports, and manage research topics.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Reported Discussions Queue</h2>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
          ✓ Clean Queue: No active community violations or spam reports requiring HQ intervention.
        </div>
      </div>
    </div>
  );
}
