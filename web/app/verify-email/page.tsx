'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { verifyEmail } from '@/lib/api';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('Verifying your email...');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('This verification link is missing its token.');
      return;
    }
    verifyEmail(token).then(() => setStatus('Your email is verified. You can sign in now.')).catch(error => setStatus(error instanceof Error ? error.message : 'Verification failed'));
  }, []);

  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-darkCanvas"><section className="w-full max-w-md rounded-soft border border-line bg-paper p-8 text-center shadow-stitch dark:border-darkLine dark:bg-darkCard"><h1 className="text-2xl font-black">Email verification</h1><p className="mt-4 text-muted dark:text-darkMuted" role="status">{status}</p><Link href="/login" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 font-bold text-white">Go to sign in</Link></section></main>;
}
