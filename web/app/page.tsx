'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Search, Sparkles, GraduationCap, Building2, HeartPulse, UserCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.sessionStorage.getItem('researchhub_token');
      if (token) {
        router.replace('/feed');
      }
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-darkCanvas dark:text-darkInk">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white dark:border-darkLine dark:bg-darkCard">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-black tracking-tight text-primary">
            ResearchHub
          </Link>
          <div className="flex items-center gap-6 text-sm font-bold">
            <Link href="/search" className="text-slate-600 transition hover:text-primary dark:text-darkMuted">
              Search
            </Link>
            <Link href="/login" className="text-slate-700 transition hover:text-primary dark:text-darkMuted">
              Log in
            </Link>
            <Link href="/signup" className="rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primaryDark">
              Join for free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full bg-primarySoft px-4 py-1.5 text-xs font-bold text-primary dark:bg-primary/10">
          <Sparkles size={14} /> Replicating ResearchGate Platform Design
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl text-slate-900 dark:text-white leading-tight">
          Discover scientific knowledge, connect with peers, and share your work.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-darkMuted">
          Access over 160 million publication pages, view real-time citation metrics, ask questions, and follow your colleagues.
        </p>

        {/* Global Search Bar */}
        <form action="/search" className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-stitch dark:border-darkLine dark:bg-darkCard md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input 
              name="q" 
              className="h-12 w-full bg-transparent pl-12 pr-4 text-base outline-none dark:text-white" 
              placeholder="Search publications, researchers, journals, or topics" 
            />
          </div>
          <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-bold text-white transition hover:bg-primaryDark">
            Search
          </button>
        </form>
      </section>

      {/* Target Audiences Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-center text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-darkMuted">
          Join your professional scientific community
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [GraduationCap, 'Academic or Student', 'Connect with university faculty, peers, and department libraries.'],
            [Building2, 'Corporate Researcher', 'Discover patents, commercial research findings, and industrial tech.'],
            [HeartPulse, 'Medical Professional', 'Follow clinical trials, medical breakthroughs, and scientific reviews.'],
            [UserCircle, 'Not a Researcher', 'Search public papers, learn about topics, and follow discussions.']
          ].map(([Icon, label, description]) => {
            const CardIcon = Icon as typeof GraduationCap;
            return (
              <Link 
                href="/signup" 
                key={label as string}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary hover:shadow-md dark:border-darkLine dark:bg-darkCard"
              >
                <div>
                  <CardIcon className="text-primary transition group-hover:scale-110" size={28} />
                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{label as string}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-darkMuted">{description as string}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-primary group-hover:underline">
                  Sign up for free <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
