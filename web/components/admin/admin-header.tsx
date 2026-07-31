'use client';

import { getStoredSessionRole, getStoredSessionToken, decodeTokenPayload } from '@/lib/session';

export function AdminHeader() {
  const token = getStoredSessionToken();
  const payload = token ? decodeTokenPayload(token) : null;
  const role = getStoredSessionRole() || 'admin';
  const username = payload?.username || 'HQ Administrator';

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-slate-200">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ● HQ Systems Operational
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="text-right">
          <p className="font-semibold text-slate-100">{username}</p>
          <p className="text-slate-400 capitalize">{role} Level Access</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center border border-teal-400/30">
          {username[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
