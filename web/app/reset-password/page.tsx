'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/api';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setStatus('This reset link is missing its token.');
    try {
      await resetPassword(token, password);
      setStatus('Password updated. You can sign in now.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Password reset failed');
    }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-darkCanvas"><section className="w-full max-w-md rounded-soft border border-line bg-paper p-8 shadow-stitch dark:border-darkLine dark:bg-darkCard"><h1 className="text-2xl font-black">Choose a new password</h1><form onSubmit={handleSubmit} className="mt-6 space-y-4"><input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 dark:border-darkLine dark:bg-darkPanel" placeholder="New password" /><button type="submit" className="w-full rounded-lg bg-primary px-4 py-3 font-bold text-white">Update password</button></form>{status ? <p className="mt-4 text-sm font-bold text-primary" role="status">{status}</p> : null}<Link href="/login" className="mt-5 inline-block text-sm font-bold text-primary">Back to sign in</Link></section></main>;
}
