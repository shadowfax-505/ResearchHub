'use client';

import { useEffect, useState } from 'react';
import { getVerificationRequests, decideVerificationRequest, assignAdminRole, setAdminUserStatus, getUnverifiedUsers, type VerificationRequestSummary } from '@/lib/api';

export default function UserAdminPage() {
  const [requests, setRequests] = useState<VerificationRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  
  // Active User Roster
  const [users, setUsers] = useState<any[]>([
    { user_id: 1, username: 'admin', full_name: 'HQ Super Admin', email: 'admin@researchhub.org', role: 'admin', is_active: true },
    { user_id: 2, username: 'john_smith', full_name: 'Dr. John Smith', email: 'john.smith@stanford.edu', role: 'researcher', is_active: true },
    { user_id: 3, username: 'alice_researcher', full_name: 'Alice Johnson', email: 'alice@mit.edu', role: 'researcher', is_active: true },
    { user_id: 4, username: 'mod_user', full_name: 'Community Moderator', email: 'moderator@researchhub.org', role: 'moderator', is_active: true },
  ]);

  useEffect(() => {
    Promise.all([getVerificationRequests(), getUnverifiedUsers().catch(() => [])])
      .then(([reqs]) => setRequests(reqs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDecision(requestId: number, status: 'approved' | 'rejected') {
    const reason = rejectionReasons[requestId] || '';
    if (status === 'rejected' && !reason.trim()) return;
    try {
      await decideVerificationRequest(requestId, status, reason.trim());
      setRequests((curr) => curr.filter((r) => Number(r.verification_request_id) !== requestId));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  }

  async function handleRoleChange(userId: number, role: 'researcher' | 'student' | 'librarian' | 'moderator' | 'admin') {
    try {
      await assignAdminRole(userId, role);
      setUsers((curr) => curr.map((u) => (u.user_id === userId ? { ...u, role } : u)));
      alert(`Role for user #${userId} updated to ${role}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  }

  async function handleStatusToggle(userId: number, currentActive: boolean) {
    try {
      await setAdminUserStatus(userId, !currentActive);
      setUsers((curr) => curr.map((u) => (u.user_id === userId ? { ...u, is_active: !currentActive } : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  }

  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter(u => {
    if (!userSearch.trim()) return true;
    const text = `${u.full_name || ''} ${u.username || ''} ${u.email || ''} ${u.role || ''}`.toLowerCase();
    return text.includes(userSearch.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">User & Author Verification HQ Management</h1>
        <p className="text-sm text-slate-400">Review submitted academic credentials, assign system roles, and govern account permissions.</p>
      </div>

      {/* Verification Queue Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-semibold text-sm text-slate-300">
          Pending Verification Requests Queue ({requests.length})
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            ✓ No pending verification requests in the queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {requests.map((r) => {
              const reqId = Number(r.verification_request_id);
              return (
                <div key={reqId} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-100">{r.full_name || r.username || `User #${r.user_id}`}</p>
                    <p className="text-xs text-slate-400">
                      Email: <span className="text-slate-200">{r.email || 'N/A'}</span> | Institutional Email: <span className="text-teal-400 font-medium">{r.institutional_email || 'Not provided'}</span>
                    </p>
                    <p className="text-xs text-slate-400">Affiliation: {r.affiliation || 'Unspecified'}</p>
                    {r.evidence && <p className="text-xs text-slate-300 bg-slate-800/80 p-2 rounded mt-1 border border-slate-700">Evidence: {r.evidence}</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Reason if rejecting..."
                      value={rejectionReasons[reqId] || ''}
                      onChange={(e) => setRejectionReasons({ ...rejectionReasons, [reqId]: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={() => handleDecision(reqId, 'approved')}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold transition"
                    >
                      Approve Badge
                    </button>
                    <button
                      onClick={() => handleDecision(reqId, 'rejected')}
                      disabled={!rejectionReasons[reqId]?.trim()}
                      className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 disabled:opacity-40 text-white rounded text-xs font-semibold transition"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global User Roster & Role Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-semibold text-sm text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <span>Platform User Roster & Role Governance</span>
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Filter by name, email, or role..."
            className="bg-slate-950 border border-slate-800 rounded px-3 py-1 text-xs text-slate-200 outline-none focus:border-teal-500 w-64"
          />
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">User Details</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Current System Role</th>
              <th className="p-4 font-semibold">Account Status</th>
              <th className="p-4 font-semibold text-right">HQ Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredUsers.map((u) => (
              <tr key={u.user_id} className="hover:bg-slate-800/40">
                <td className="p-4">
                  <p className="font-semibold text-slate-100">{u.full_name || u.username}</p>
                  <p className="text-[11px] text-slate-500 font-mono">@{u.username} (ID: #{u.user_id})</p>
                </td>
                <td className="p-4 text-slate-400">{u.email}</td>
                <td className="p-4">
                  <select
                    value={u.role || 'researcher'}
                    onChange={(e) => handleRoleChange(u.user_id, e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-teal-400 font-medium outline-none focus:border-teal-500"
                  >
                    <option value="researcher">Researcher</option>
                    <option value="student">Student</option>
                    <option value="librarian">Librarian</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {u.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleStatusToggle(u.user_id, u.is_active)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                      u.is_active
                        ? 'bg-rose-900/60 hover:bg-rose-900 text-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {u.is_active ? 'Suspend Account' : 'Reactivate Account'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
