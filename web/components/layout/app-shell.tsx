'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Briefcase,
  Home,
  MailPlus,
  MessageSquare,
  Search,
  Shield
} from 'lucide-react';
import { hasStoredSession, getStoredSessionRole } from '@/lib/session';
import { getNetworkRecommendations, followResearcher, getVerificationStatus, resendVerificationEmail, requestResearcherVerification } from '@/lib/api';
import { UpdatesMenu, MessagesMenu, RequestsMenu, ProfileMenu } from './header-menus';
import { AddNewDrawer } from './add-new-drawer';

import { AiCopilotDrawer } from '@/components/ai/ai-copilot-drawer';

export function AppShell({ children, title, subtitle, utility = true }: { children: React.ReactNode; title: string; subtitle?: string; utility?: boolean }) {
  const pathname = usePathname();
  const [verification, setVerification] = useState<{ email_verified?: boolean; researcher_verified?: boolean; eligible?: boolean; request?: { status?: string; rejection_reason?: string } } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    setIsAdmin(getStoredSessionRole() === 'admin');
    const checkMaint = () => {
      if (typeof window !== 'undefined') {
        setIsMaintenance(window.localStorage.getItem('researchhub_maintenance_mode') === 'true');
      }
    };
    checkMaint();
    window.addEventListener('storage', checkMaint);
    if (!hasStoredSession()) return;
    getVerificationStatus().then(result => setVerification(result.data || null)).catch(() => setVerification(null));
    return () => window.removeEventListener('storage', checkMaint);
  }, []);

  async function handleVerification() {
    setVerificationLoading(true);
    try {
      if (!verification?.email_verified) {
        await resendVerificationEmail();
        setVerificationStatus('Verification email sent. Check your inbox.');
      } else {
        const result = await requestResearcherVerification();
        setVerification(result.data ? { ...verification, request: result.data } : verification);
        setVerificationStatus('Waiting for admin verification.');
      }
    } catch (error) { setVerificationStatus(error instanceof Error ? error.message : 'Verification request failed'); }
    finally { setVerificationLoading(false); }
  }
  const primaryNav = [
    ['Home', '/feed', Home],
    ['Questions', '/questions', MessageSquare],
    ['Jobs', '/jobs', Briefcase],
    ...(isAdmin ? [['Admin', '/admin', Shield] as const] : [])
  ] as const;
  return (
    <main className="min-h-screen bg-[#F2F2F2] text-ink dark:bg-darkCanvas dark:text-darkInk">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-line bg-white px-4 shadow-sm dark:border-darkLine dark:bg-darkCard md:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/feed" className="shrink-0 text-2xl font-serif text-[#000000] dark:text-white">
            ResearchHub
          </Link>
          <nav className="hidden items-center gap-5 md:flex" aria-label="Top navigation">
            {primaryNav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex h-14 items-center border-b-[3px] text-[15px] font-medium transition',
                  pathname === href ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form action="/search" className="relative hidden lg:block">
            <input
              name="q"
              className="h-[36px] w-[340px] rounded-sm border border-line bg-slate-100 px-3 pr-9 text-[15px] outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-darkLine dark:bg-darkCard"
              placeholder="Search for research, journals, people, etc."
            />
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          </form>
          <div className="flex items-center gap-1">
            <UpdatesMenu />
            <MessagesMenu />
            <RequestsMenu />
          </div>
          <button
            type="button"
            title="Toggle OLED High-Contrast Mode"
            onClick={() => {
              document.documentElement.classList.toggle('dark');
            }}
            className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition rounded-full hover:bg-slate-100 dark:hover:bg-darkPanel"
          >
            <span className="text-xs font-black font-mono">OLED</span>
          </button>
          <ProfileMenu />
          <AddNewDrawer />
        </div>
      </header>

      {isMaintenance && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-center text-xs tracking-wide shadow-sm flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>HQ SYSTEM NOTICE: ResearchHub Maintenance Mode is currently active. Public endpoints are in Read-Only state.</span>
        </div>
      )}

      <div className={clsx('mx-auto grid max-w-[1080px] gap-8 px-4 py-7 md:px-6', utility ? 'lg:grid-cols-[minmax(0,1fr)_19rem]' : 'lg:grid-cols-1')}>
        <section className="min-w-0 pb-20 lg:pb-0">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-primary">Academic Workspace</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-ink dark:text-darkInk md:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 max-w-3xl text-base leading-7 text-muted dark:text-darkMuted">{subtitle}</p> : null}
          </div>
          {children}
        </section>

        {utility ? (
          <aside className="hidden space-y-4 xl:block" aria-label="Workspace utilities">
            {verification && !verification.researcher_verified && (
            <section className="rounded-sm border border-line bg-white shadow-sm dark:border-darkLine dark:bg-darkCard p-4 relative">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-primary dark:bg-darkPanel">
                <MailPlus size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-[17px] font-bold text-ink dark:text-white leading-tight">Researcher verification</h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{verification.request?.status === 'pending' ? 'Waiting for admin verification.' : verification.request?.status === 'rejected' ? `Request rejected: ${verification.request.rejection_reason || 'You can reapply.'}` : verification.email_verified ? 'Confirm your institutional affiliation to get the verified researcher badge.' : 'Confirm your email address to begin researcher verification.'}</p>
              {verification.request?.status !== 'pending' ? <button onClick={handleVerification} disabled={verificationLoading} className="mt-4 rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-50">
                {verification.email_verified ? (verification.request?.status === 'rejected' ? 'Reapply' : 'Request review') : 'Verify now'}
              </button>
              : null}
              {verificationStatus ? <p className="mt-3 text-xs font-semibold text-primary">{verificationStatus}</p> : null}
            </section>
            )}

            {/* Who to follow */}
            <section className="rounded-sm border border-line bg-white shadow-sm dark:border-darkLine dark:bg-darkCard">
              <div className="flex items-center justify-between border-b border-line p-4 dark:border-darkLine">
                <h2 className="text-[15px] font-semibold text-ink dark:text-white">Who to follow</h2>
                <button className="text-slate-400 hover:text-slate-600 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                </button>
              </div>
              <div className="flex flex-col">
                <NetworkRecommendations />
              </div>
              <div className="border-t border-line p-3 text-center dark:border-darkLine">
                <Link href="/network" className="text-sm font-semibold text-primary hover:underline">
                  View all related researchers
                </Link>
              </div>
            </section>

            {/* Mini Footer */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2 text-[13px] text-slate-500">
              <Link href="/" className="hover:underline">About us</Link>
              <Link href="/feed" className="hover:underline">Blog</Link>
              <Link href="/jobs" className="hover:underline">Careers</Link>
                  <Link href="/settings" className="hover:underline">Settings</Link>
              <Link href="/requests" className="hover:underline">Contact us</Link>
            </div>
          </aside>
        ) : null}
      </div>

        <nav className={clsx("fixed inset-x-0 bottom-0 z-50 grid border-t border-line bg-paper px-2 py-2 shadow-lg dark:border-darkLine dark:bg-darkPanel lg:hidden", primaryNav.length === 3 ? "grid-cols-3" : "grid-cols-4")} aria-label="Mobile primary">
        {primaryNav.map(([label, href, Icon]) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition',
              pathname === href ? 'bg-primarySoft text-primary dark:bg-darkCard' : 'text-muted hover:text-primary dark:text-darkMuted'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <AiCopilotDrawer />
    </main>
  );
}

function NetworkRecommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getNetworkRecommendations().then((res) => {
      if (res?.data) {
        setRecommendations(res.data);
      }
    }).catch(() => undefined);
  }, []);

  if (recommendations.length === 0) {
    return <div className="p-4 text-sm text-slate-500">No suggestions right now.</div>;
  }

  const handleFollow = async (userId: number, fullName: string, index: number) => {
    try {
      await followResearcher(userId);
      setStatus('Followed ' + fullName);
      setRecommendations(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], followed: true };
        return updated;
      });
    } catch (error) {
      setStatus('Failed to follow');
    }
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <>
      {recommendations.slice(0, 3).map((user, i) => (
        <div key={i} className="flex items-start gap-3 border-b border-line p-4 last:border-b-0 dark:border-darkLine">
          <div className="size-10 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} alt={user.full_name} className="size-full object-cover" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link href={`/researchers/${user.slug || user.username}`} className="truncate font-bold text-[14px] text-ink hover:underline dark:text-white block">{user.full_name}</Link>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user.recommendation_reason || user.department || user.affiliation}</div>
              </div>
              <button 
                onClick={() => handleFollow(user.user_id, user.full_name, i)}
                disabled={user.followed}
                className={clsx(
                  "rounded-sm border px-3 py-1 text-xs font-semibold transition disabled:opacity-100 whitespace-nowrap",
                  user.followed 
                    ? "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary" 
                    : "border-line text-slate-700 hover:bg-slate-50 dark:border-darkLine dark:text-slate-300 dark:hover:bg-darkLine"
                )}
              >
                {user.followed ? 'Followed' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      ))}
      {status && <div className="p-2 text-xs text-primary font-bold text-center">{status}</div>}
    </>
  );
}
