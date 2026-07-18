'use client';

import { useEffect, useState } from 'react';
import { decideVerificationRequest, getUnverifiedUsers, getVerificationRequests, verifyUser, type VerificationRequestSummary } from '@/lib/api';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';

export function AdminView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequestSummary[]>([]);
  const [requestError, setRequestError] = useState('');
  const [requestLoading, setRequestLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});

  useEffect(() => {
    void fetchData();
  }, []);

  async function fetchData() {
    try {
      const [userData, requestData] = await Promise.all([getUnverifiedUsers(), getVerificationRequests()]);
      setUsers(userData);
      setVerificationRequests(requestData);
      setRequestError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      setRequestError(err.message || 'Failed to load verification requests');
    } finally {
      setLoading(false);
      setRequestLoading(false);
    }
  }

  async function handleVerify(userId: number) {
    try {
      await verifyUser(userId);
      setUsers(current => current.filter(u => u.user_id !== userId));
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  }

  async function handleDecision(request: VerificationRequestSummary, status: 'approved' | 'rejected') {
    const requestId = Number(request.verification_request_id);
    const reason = rejectionReasons[requestId] || '';
    if (status === 'rejected' && !reason.trim()) return;
    try {
      await decideVerificationRequest(requestId, status, reason.trim());
      setVerificationRequests(current => current.filter(item => Number(item.verification_request_id) !== requestId));
    } catch (err: any) {
      setRequestError(err.message || 'Unable to update verification request');
    }
  }

  return (
    <AppShell title="Admin Dashboard" subtitle="Review verification and platform safety activity." utility={false}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-ink dark:text-darkInk">Admin Dashboard</h1>

        <section className="mb-8 rounded-lg border border-line bg-white shadow-sm dark:border-darkLine dark:bg-darkCard">
          <div className="border-b border-line px-6 py-4 dark:border-darkLine">
            <h2 className="text-lg font-bold text-ink dark:text-darkInk">Researcher verification requests</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review institutional evidence before awarding the public researcher badge.</p>
          </div>
          {requestLoading ? <p className="px-6 py-5 text-sm text-slate-500">Loading verification requests...</p> : requestError ? <p className="px-6 py-5 text-sm text-red-600">{requestError}</p> : verificationRequests.length === 0 ? <p className="px-6 py-5 text-sm text-slate-500">No pending researcher verification requests.</p> : (
            <div className="divide-y divide-line dark:divide-darkLine">
              {verificationRequests.map(request => {
                const requestId = Number(request.verification_request_id);
                return (
                  <div key={requestId} className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_1fr_220px]">
                    <div>
                      <p className="font-semibold text-ink dark:text-darkInk">{request.full_name || request.username || `User ${request.user_id}`}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{request.email || 'No account email'} · {request.affiliation || 'No affiliation listed'}</p>
                      <p className="mt-2 text-sm text-ink dark:text-darkInk">Institutional email: <span className="font-semibold">{request.institutional_email || 'Not supplied'}</span></p>
                      {request.evidence ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Evidence: {request.evidence}</p> : null}
                    </div>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">Submitted {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'recently'}</div>
                    <div className="space-y-2">
                      <input value={rejectionReasons[requestId] || ''} onChange={event => setRejectionReasons(current => ({ ...current, [requestId]: event.target.value }))} placeholder="Reason if rejecting" aria-label={`Rejection reason for ${request.full_name || request.username || request.user_id}`} className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => void handleDecision(request, 'approved')}>Approve</Button>
                        <Button size="sm" variant="secondary" disabled={!rejectionReasons[requestId]?.trim()} onClick={() => void handleDecision(request, 'rejected')}>Reject</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p>No unverified users found.</p>
        ) : (
          <div className="bg-white dark:bg-darkCard rounded-lg shadow-sm border border-line dark:border-darkLine overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-line dark:border-darkLine">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                  <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                  <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Role / Affiliation</th>
                  <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Joined</th>
                  <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-darkLine">
                {users.map(user => (
                  <tr key={user.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink dark:text-darkInk">{user.full_name || user.username}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {user.role}
                      {user.affiliation && <span className="block text-xs text-slate-500">{user.affiliation}</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button onClick={() => handleVerify(user.user_id)} className="bg-primary hover:bg-primary-hover text-white">
                        Verify User
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
