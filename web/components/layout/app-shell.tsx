'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ArrowUpRight, BookOpen, Briefcase, FolderOpen, Home, MessageSquare, Network, Search, Settings, Shield, Sun, Moon, Users, FlaskConical } from 'lucide-react';
import { hasStoredSession, getStoredSessionRole } from '@/lib/session';
import { getVerificationStatus, resendVerificationEmail, requestResearcherVerification } from '@/lib/api';
import { UpdatesMenu, MessagesMenu, RequestsMenu, ProfileMenu } from './header-menus';
import { AddNewDrawer } from './add-new-drawer';

const links = [
  { label: 'Discover', href: '/feed', icon: Home },
  { label: 'Search research', href: '/search', icon: Search },
  { label: 'My library', href: '/collections', icon: FolderOpen },
  { label: 'Questions', href: '/questions', icon: MessageSquare },
  { label: 'Researchers', href: '/researchers', icon: Users },
  { label: 'My network', href: '/network', icon: Network },
  { label: 'Projects', href: '/projects', icon: FlaskConical },
  { label: 'Opportunities', href: '/jobs', icon: Briefcase },
  { label: 'Settings', href: '/settings', icon: Settings }
];

export function ResearchMark() {
  return <span className="rh-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M6 7h7c5 0 8 3 8 7s-3 7-8 7H6V7Zm7 14 9 7M25 3v8M21 7h8" stroke="currentColor" strokeWidth="1.8" /></svg></span>;
}

export function AppShell({ children, title, subtitle, utility = true }: { children: React.ReactNode; title: string; subtitle?: string; utility?: boolean }) {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dark, setDark] = useState(false);
  const [verification, setVerification] = useState<{ email_verified?: boolean; researcher_verified?: boolean; request?: { status?: string; rejection_reason?: string } } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  useEffect(() => {
    const session = hasStoredSession();
    setSignedIn(session);setIsAdmin(getStoredSessionRole() === 'admin');
    const theme = window.localStorage.getItem('researchhub_theme');
    const isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);setDark(isDark);
    if(session) getVerificationStatus().then(result=>setVerification(result.data || null)).catch(()=>setVerification(null));
    const syncTheme = () => setDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('researchhub-theme-changed', syncTheme);
    return () => window.removeEventListener('researchhub-theme-changed', syncTheme);
  }, []);

  function toggleTheme() {
    const next = !dark;setDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem('researchhub_theme', next ? 'dark' : 'light');
  }
  async function handleVerification() {
    setVerificationLoading(true);
    try {
      if (!verification?.email_verified) {
        await resendVerificationEmail();setVerificationStatus('Verification email queued. Check your inbox.');
      } else {
        const result=await requestResearcherVerification();
        setVerification(result.data ? {...verification,request:result.data} : verification);
        setVerificationStatus('Your verification request is awaiting review.');
      }
    } catch(error){setVerificationStatus(error instanceof Error?error.message:'Unable to request verification');}
    finally{setVerificationLoading(false);}
  }
  const navigation=[...links,...(isAdmin?[{label:'Administration',href:'/admin',icon:Shield}]:[])];
  function navItems() { return navigation.map(({label,href,icon:Icon})=><Link key={href} href={href as Route} aria-current={pathname===href?'page':undefined} className={clsx('rh-nav-link',pathname===href&&'is-current')}><Icon size={17} strokeWidth={1.7}/><span>{label}</span>{pathname===href?<span className="rh-nav-dot" aria-hidden="true"/>:null}</Link>); }
  return <div className="rh-workspace">
    <a className="rh-skip" href="#workspace-main">Skip to content</a>
    <header className="rh-header">
      <Link href="/" className="rh-brand"><ResearchMark/><span>Research<span className="rh-brand-light">Hub</span><small>THE READING ROOM</small></span></Link>
      <form action="/search" className="rh-header-search" role="search"><Search size={16}/><input name="q" aria-label="Search research" placeholder="An idea, a paper, a person…"/><kbd aria-hidden="true">↵</kbd></form>
      <div className="rh-header-actions">
        <button type="button" className="rh-icon-button" onClick={toggleTheme} aria-label={dark?'Use light theme':'Use dark theme'}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
        {signedIn?<><div className="rh-session-tools"><UpdatesMenu/><MessagesMenu/><RequestsMenu/></div><ProfileMenu/><AddNewDrawer/></>:<><Link className="rh-login-link" href="/login">Log in</Link><Link className="rh-join" href="/signup">Join the room <ArrowUpRight size={14}/></Link></>}
      </div>
    </header>
    <div className="rh-workspace-grid">
      <aside className="rh-sidebar" aria-label="Workspace navigation">
        <p className="rh-micro">YOUR WORKSPACE</p>
        <nav aria-label="Main navigation">{navItems()}</nav>
        <div className="rh-sidebar-note"><BookOpen size={24} strokeWidth={1.2}/><p>Make room for<br/><em>your next idea.</em></p><Link href="/submit">Share your research <ArrowUpRight size={14}/></Link></div>
        <span className="rh-sidebar-foot">AN OPEN MIND IS A GOOD START.</span>
      </aside>
      <main id="workspace-main" className={clsx('rh-main',!utility&&'rh-main-wide')}>
        <details className="rh-mobile-navigation"><summary>Explore the workspace <span>＋</span></summary><nav aria-label="Mobile navigation">{navItems()}</nav></details>
        <div className="rh-page-heading"><div><p className="rh-micro">RESEARCHHUB / {pathname.split('/')[1]?.replaceAll('-',' ') || 'WORKSPACE'}</p><h1>{title}</h1>{subtitle?<p className="rh-page-subtitle">{subtitle}</p>:null}</div><span className="rh-heading-star" aria-hidden="true">✳</span></div>
        {verification&&!verification.researcher_verified?<div className="rh-verification"><div><strong>{verification.request?.status==='pending'?'Verification in review':'A little more about you.'}</strong><p>{verification.email_verified?'Add an institutional verification to your researcher profile.':'Verify your email address to complete your profile.'}</p>{verificationStatus?<p role="status">{verificationStatus}</p>:null}</div>{verification.request?.status!=='pending'?<button onClick={handleVerification} disabled={verificationLoading}>{verification.email_verified?'Request verification':'Verify email'} <ArrowUpRight size={14}/></button>:null}</div>:null}
        <div className="rh-content">{children}</div>
        <footer className="rh-workspace-footer"><span>Research is better in good company.</span><Link href="/requests">Start a conversation <ArrowUpRight size={12}/></Link></footer>
      </main>
    </div>
  </div>;
}
