'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { MessagesView } from '../messages/messages-view';
import { ProjectsView } from '../projects/projects-view';
import { NetworkView } from '../network/network-view';
import { ScholarBadges } from '../profile/scholar-badges';
import { CitationVelocityChart } from '../papers/citation-velocity-chart';
import { PaperPdfViewer } from '../papers/paper-pdf-viewer';
import { PaperKeywordCloud } from '../papers/paper-keyword-cloud';
import { PaperAltmetricBadge } from '../papers/paper-altmetric-badge';
import { PaperAiSummary } from '../papers/paper-ai-summary';
import { CitationTreeVisualizer } from '../papers/citation-tree-visualizer';
import { ConferenceTracker } from '../conferences/conference-tracker';
import { PaperAudioPlayer } from '../papers/paper-audio-player';
import { ReviewRigorRadar } from '../papers/review-rigor-radar';
import { ScienceNewsTicker } from '../feed/science-news-ticker';
import { QaLeaderboard } from '../questions/qa-leaderboard';
import { ReviewMarketplaceModal } from '../papers/review-marketplace-modal';
import { CitationForecaster } from '../papers/citation-forecaster';
import { ReviewRebuttalModal } from '../papers/review-rebuttal-modal';
import { LibraryExportWidget } from '../settings/library-export-widget';
import { JournalImpactDirectory } from '../journals/journal-impact-directory';
import { VirtualPosterHub } from '../feed/virtual-poster-hub';
import { BatchCitationExportModal } from '../papers/batch-citation-export-modal';
import { ReviewerScoringMatrix } from '../papers/reviewer-scoring-matrix';
import { BibtexNormalizerModal } from '../papers/bibtex-normalizer-modal';
import { CoiAuditBadge } from '../papers/coi-audit-badge';
import { CodeReproducibilityCard } from '../papers/code-reproducibility-card';
import {
  Bell,
  Bookmark,
  BookOpen,
  CheckCircle,
  Download,
  Folder,
  Lock,
  MailPlus,
  Plus,
  MessageSquare,
  Quote,
  Search,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  Upload,
  UserPlus,
  BadgeCheck
, FileText, UploadCloud, Presentation, Database, CheckCircle2, ArrowRight, ArrowLeft, X, Globe, Moon, Palette, Sun, Users, HelpCircle, Mail} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PaperCard } from '@/components/papers/paper-card';
import { ProfileLayout } from '@/components/profile/profile-layout';
import { Button } from '@/components/ui/button';
import { decodeTokenPayload } from '@/lib/session';
import { clearSubmitDraft, draftFileToFile, fileToDraftFile, loadSubmitDraft, updateSubmitDraft } from '@/lib/draft-storage';

import { JobSearchBar } from '@/components/jobs/job-search-bar';
import { JobCard } from '@/components/jobs/job-card';
import { JobSidebar } from '@/components/jobs/job-sidebar';



import {
  authFetch,
  createAnswer,
  createCollection,
  createQuestion,
  createResearchRequest,
  createReview,
  applyModerationAction,
  assignAdminRole,
  exportCitation,
  followAuthor,
  getCollections,
  getCollectionPapers,
  getAdminDashboard,
  getAdminEmailQueue,
  getModerationCases,
  getAdminPlatformActivity,
  getMyStats,
  getPaperReviews,
  markNotificationRead,
  submitPaperReview,
  getQuestion,
  getQuestions,
  getResearcherProfile,
  getResearchRequests,
  getReceivedRequests,
  updateRequestStatus,
  getSavedPapers,
  getUnverifiedUsers,
  getJobs, getJobFilters, toggleJobBookmark, updateSettings, getSettings, getUsers, getResearchers,
  getAuthor, claimAuthor,
  recommendPaper, savePaper,
  getTopPapers,
  getGlobalFeed,
  unifiedSearch,
  getSearchFacets,
  getFeedPapers,
  getTrendingFields,
  isFollowingAuthor,
  followResearcher,
  forgotPassword,
  unfollowResearcher,
  isFollowingResearcher,
  login,
  register,
  retryAdminEmail,
  searchPapers,
  verifyUser,
  submitResearch,
  uploadPaperFile,
  uploadPaperCover,
  getResearcherContributions,
  getUpdates,
  markUpdateRead,
  markAllUpdatesRead,
  uploadAvatar,
  setAdminUserStatus,
  unfollowAuthor,
  type PaperSummary,
  type UserSummary,
  type ReviewSummary,
  type QuestionSummary,
  type QuestionAnswer,
  type PublicResearcherProfile,
  type ExternalAuthor,
  type ModerationCase,
  type EmailQueueItem
} from '@/lib/api';

const copy = {
  dashboard: ['Admin Dashboard', 'Manage platform users, review research activity, and monitor queued requests.'],
  search: ['Search & Discovery', 'Find papers, researchers, and topics with live API-backed search.'],
  feed: ['Research Feed', 'Follow the newest work from your fields, collaborators, and saved interests.'],
  questions: ['Questions & Answers', 'Ask research questions and reply from your profile-linked account.'],
  paper: ['Paper Details', 'Read the indexed publication record and its linked research metadata.'],
  profile: ['Researcher Profile', 'Manage identity, publications, collections, followers, and collaboration status.'],
  researcher: ['Researcher Profile', 'Explore publications, academic interests, and research contributions.'],
  author: ['Author Profile', 'Follow an external scholarly identity or request to claim it as your ResearchHub profile.'],
  analytics: ['Author Analytics', 'Track citation velocity, publication reach, field activity, and downloads.'],
  collections: ['Saved Collections', 'Organize saved papers into private and collaborative research folders.'],
  notifications: ['Notifications Activity', 'Review citation alerts, collaboration requests, mentions, and system updates.'],
  requests: ['Research Requests', 'Send and monitor paper access, collaboration, and dataset requests.'],
  login: ['Welcome Back', 'Sign in to sync saves, collections, requests, settings, and notifications.'],
  signup: ['Create ResearchHub Account', 'Join the workspace and start building your academic network.'],
  submit: ['Submit Your Research', 'Upload a paper draft and create a backend-backed publication record.'],
  citations: ['Citation Export', 'Generate BibTeX or text citations from the ResearchHub API.'],
  jobs: ['Jobs', 'Discover career opportunities in research and academia.'],
  messages: ['Messages', 'Communicate securely with your peers.'],
  projects: ['Projects', 'Manage and discover research projects.'],
  network: ['Network', 'Discover and connect with researchers in your field.'],
  settings: ['Account Settings', 'Manage your profile and platform preferences.']
} satisfies Record<string, [string, string]>;

type AdminOverview = {
  users?: { total?: number; active?: number };
  papers?: { total_papers?: number; avg_citations?: number; max_citations?: number; total_views?: number };
  questions?: { total_questions?: number; total_answers?: number; total_views?: number };
  email_queue?: { queued?: number; pending?: number; sent?: number; failed?: number };
  recent?: QuestionSummary[];
};

type AdminUser = {
  user_id: number;
  username?: string;
  full_name?: string;
  role?: string;
  affiliation?: string;
  is_active?: number | boolean;
};

export function RouteView({ kind, paperId, researcherSlug, authorId, searchQuery }: { kind: keyof typeof copy; paperId?: string; researcherSlug?: string; authorId?: string; searchQuery?: string }) {
  const [title, subtitle] = copy[kind];
  const utility = !['login', 'signup', 'paper', 'researcher', 'author'].includes(kind);

  return (
    <AppShell title={title} subtitle={subtitle} utility={utility}>
      {kind === 'dashboard' ? <Dashboard /> : null}
      {kind === 'search' ? <SearchView initialQuery={searchQuery} /> : null}
      {kind === 'feed' ? <GlobalFeed /> : null}
      {kind === 'questions' ? <QuestionsView /> : null}
      {kind === 'paper' ? <PaperDetail paperId={paperId} /> : null}
      {kind === 'profile' ? <ProfileLayout /> : null}
      {kind === 'researcher' ? <PublicResearcherProfileView slug={researcherSlug || ''} /> : null}
      {kind === 'author' ? <ExternalAuthorProfileView authorId={authorId || ''} /> : null}
      {kind === 'analytics' ? <AnalyticsView /> : null}
      {kind === 'collections' ? <CollectionsView /> : null}
      {kind === 'notifications' ? <NotificationsView /> : null}
      {kind === 'requests' ? <RequestsView /> : null}
      {kind === 'login' || kind === 'signup' ? <AuthPanel kind={kind} /> : null}
      {kind === 'citations' ? <CitationPanel /> : null}
      {kind === 'messages' ? <MessagesView /> : null}
      {kind === 'projects' ? <ProjectsView /> : null}
      {kind === 'network' ? <NetworkView /> : null}
      {kind === 'submit' ? <SubmitView /> : null}
      {kind === 'settings' ? <SettingsView /> : null}
      {kind === 'jobs' ? <JobsView /> : null}
    </AppShell>
  );
}

function PublicResearcherProfileView({ slug }: { slug: string }) {
  const [profile, setProfile] = useState<PublicResearcherProfile | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'profile' | 'research' | 'stats' | 'following' | 'contributions'>('profile');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ user_id?: number } | null>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarStatus, setAvatarStatus] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.sessionStorage.getItem('researchhub_token');
      if (token) setCurrentUser(decodeTokenPayload(token));
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    setError('');
    getResearcherProfile(slug).then(setProfile).catch(() => setError('This researcher profile is not available.'));
  }, [slug]);

  useEffect(() => {
    if (!profile?.user_id || !currentUser?.user_id || profile.user_id === currentUser.user_id) return;
    isFollowingResearcher(profile.user_id).then(result => setIsFollowing(result?.data?.is_following ?? false)).catch(() => undefined);
  }, [profile?.user_id, currentUser?.user_id]);

  useEffect(() => {
    if (tab !== 'contributions' || !slug || contributions.length) return;
    setContributionsLoading(true);
    getResearcherContributions(slug).then(result => setContributions(result.data || [])).catch(() => setContributions([])).finally(() => setContributionsLoading(false));
  }, [tab, slug, contributions.length]);

  async function handleFollowToggle() {
    if (!profile?.user_id || !currentUser?.user_id) return;
    setLoadingFollow(true);
    try {
      if (isFollowing) { await unfollowResearcher(profile.user_id); setIsFollowing(false); setProfile(prev => prev ? { ...prev, followers: Math.max(0, (prev.followers || 0) - 1) } : null); }
      else { await followResearcher(profile.user_id); setIsFollowing(true); setProfile(prev => prev ? { ...prev, followers: (prev.followers || 0) + 1 } : null); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Follow action failed'); }
    finally { setLoadingFollow(false); }
  }

  async function handleAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !currentUser || currentUser.user_id !== profile?.user_id) return;
    setAvatarFile(file);
    try { const result = await uploadAvatar(file) as { data?: { profile_picture_url?: string } }; setProfile(prev => prev ? { ...prev, profile_picture_url: result.data?.profile_picture_url } : null); setAvatarStatus('Profile photo updated'); }
    catch (err) { setAvatarStatus(err instanceof Error ? err.message : 'Photo upload failed'); }
  }

  if (error) return <p className="rounded-soft border border-line bg-paper p-6 text-muted shadow-stitch dark:border-darkLine dark:bg-darkCard dark:text-darkMuted">{error}</p>;
  if (!profile) return <p className="text-sm font-semibold text-muted dark:text-darkMuted">Loading researcher profile...</p>;

  const initials = (profile.full_name || profile.username || 'RH').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const verified = Boolean(profile.researcher_verified_at || profile.is_verified);
  const tabs = [['profile', 'Profile'], ['research', `Research (${profile.papers?.length || 0})`], ['stats', 'Stats'], ['following', 'Following'], ['contributions', 'Contributions']] as const;
  const section = (title: string, content: ReactNode) => <section className="overflow-hidden rounded-soft border border-line bg-paper shadow-stitch dark:border-darkLine dark:bg-darkCard"><h2 className="border-b border-line px-6 py-4 text-lg font-black dark:border-darkLine">{title}</h2><div className="p-6">{content}</div></section>;
  const listSection = (title: string, items: Array<{ label?: string; value?: string }>) => section(title, items.length ? <div className="grid gap-4 md:grid-cols-2">{items.map((item, index) => <div key={`${title}-${index}`} className="rounded-lg border border-line p-4 dark:border-darkLine"><p className="font-bold">{item.label || item.value}</p>{item.label && item.value ? <p className="mt-1 text-sm text-muted dark:text-darkMuted">{item.value}</p> : null}</div>)}</div> : <p className="text-sm text-muted dark:text-darkMuted">No public information has been added yet.</p>);

  return (
    <div className="space-y-5">
      <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard md:p-8">
        <div className="flex flex-wrap items-start gap-5">
          <label className="group relative grid size-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-gradient-to-br from-slate-900 to-primary text-2xl font-black text-white">
            {profile.profile_picture_url ? <img src={profile.profile_picture_url} alt={`${profile.full_name || profile.username} profile`} className="size-full object-cover" /> : initials}
            {currentUser?.user_id === profile.user_id ? <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-[10px] font-bold opacity-0 transition group-hover:opacity-100">Change</span> : null}
            {currentUser?.user_id === profile.user_id ? <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatar} /> : null}
          </label>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="flex flex-wrap items-center gap-2 text-2xl font-black md:text-3xl">{profile.full_name || profile.username}{verified ? <BadgeCheck className="size-6 text-primary" aria-label="Verified researcher" /> : null}</h2><p className="mt-1 font-semibold text-primary">{profile.position_title || profile.headline || 'Researcher'}</p></div>
              <div className="flex flex-wrap gap-2">
                {currentUser?.user_id === profile.user_id ? <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-500 dark:bg-darkPanel dark:text-darkMuted">Your profile</span> : currentUser ? <Button onClick={handleFollowToggle} disabled={loadingFollow} variant={isFollowing ? 'secondary' : 'primary'} className="font-bold"><UserPlus size={16} className="mr-2" />{isFollowing ? 'Following' : 'Follow'}</Button> : <Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Sign in to follow</Link>}
                {currentUser?.user_id !== profile.user_id ? <Link href={`/messages?to=${profile.user_id}`} className="rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary">Message</Link> : null}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted dark:text-darkMuted">{[profile.department, profile.affiliation, profile.country].filter(Boolean).join(' · ')}</p>
            <ScholarBadges profile={profile} />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric value={String(profile.rg_score || 0)} label="Research score" /><Metric value={String(profile.citations || 0)} label="Citations" /><Metric value={String(profile.total_reads || 0)} label="Reads" /><Metric value={String(profile.followers || 0)} label="Followers" /></div>
            {avatarStatus ? <p className="mt-3 text-xs font-semibold text-primary">{avatarStatus}</p> : null}
          </div>
        </div>
      </section>

      <nav className="flex gap-1 overflow-x-auto border-b border-line dark:border-darkLine" aria-label="Researcher profile tabs">{tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={clsx('whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold', tab === key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary dark:text-darkMuted')}>{label}</button>)}</nav>

      {tab === 'profile' ? <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-5">
          {section(`About ${profile.full_name || profile.username}`, <p className="leading-7 text-muted dark:text-darkMuted">{profile.bio || 'This researcher has not added an introduction yet.'}</p>)}
          {listSection('Affiliations and education', [...(profile.education || []).map(item => ({ label: item.institution, value: [item.degree, item.field_of_study, item.start_year && `${item.start_year}-${item.end_year || 'Present'}`].filter(Boolean).join(' · ') })), ...(profile.experience || []).map(item => ({ label: item.position, value: [item.company, item.start_date && `${item.start_date} - ${item.end_date || 'Present'}`].filter(Boolean).join(' · ') }))])}
          {listSection('Skills and disciplines', [...(profile.skills || []).map(item => ({ value: item.skill_name })), ...(profile.disciplines || []).map(item => ({ value: item.discipline_name }))])}
          {listSection('Languages', (profile.languages || []).map(item => ({ label: item.language_name, value: item.proficiency })))}
        </div>
        <div className="space-y-5">{section('Profile details', <div className="space-y-4 text-sm"><div><p className="font-bold">ORCID iD</p><p className="mt-1 text-muted dark:text-darkMuted">{profile.orcid || 'Not added'}</p></div><div><p className="font-bold">Website</p>{profile.website_url ? <a href={profile.website_url} className="mt-1 block break-all text-primary hover:underline">{profile.website_url}</a> : <p className="mt-1 text-muted dark:text-darkMuted">Not added</p>}</div></div>)}{section('Network', <div className="grid grid-cols-2 gap-3"><Metric value={String(profile.following || 0)} label="Following" /><Metric value={String(profile.publication_count || profile.papers?.length || 0)} label="Publications" /></div>)}</div>
      </div> : null}
      {tab === 'research' ? <div className="space-y-4">{profile.papers?.length ? profile.papers.map(paper => <PaperCard key={paper.paper_id} paper={paper} />) : <p className="rounded-soft border border-line bg-paper p-6 text-sm text-muted shadow-stitch dark:border-darkLine dark:bg-darkCard dark:text-darkMuted">No verified public publications yet.</p>}{profile.questions?.length ? section('Questions and answers', <div className="grid gap-3 md:grid-cols-2">{profile.questions.map(question => <Link key={question.question_id} href={`/questions`} className="rounded-lg border border-line p-4 hover:border-primary dark:border-darkLine"><p className="text-xs font-black uppercase tracking-widest text-primary">{question.category || 'Q&A'}</p><h3 className="mt-2 font-bold">{question.title}</h3><p className="mt-2 text-sm text-muted dark:text-darkMuted">{question.answer_count || 0} answers · {question.view_count || 0} views</p></Link>)}</div>) : null}</div> : null}
      {tab === 'stats' ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[['Research score', profile.rg_score || 0], ['Citations', profile.citations || 0], ['Reads', profile.total_reads || 0], ['Publications', profile.publication_count || profile.papers?.length || 0]].map(([label, value]) => <section key={String(label)} className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard"><p className="text-3xl font-black text-primary">{value}</p><p className="mt-2 text-sm font-semibold text-muted dark:text-darkMuted">{label}</p></section>)}</div> : null}
      {tab === 'following' ? section('Following', <p className="text-sm text-muted dark:text-darkMuted">Following details are visible when this researcher has made their network public.</p>) : null}
      {tab === 'contributions' ? <section className="rounded-soft border border-line bg-paper shadow-stitch dark:border-darkLine dark:bg-darkCard"><h2 className="border-b border-line px-6 py-4 text-lg font-black dark:border-darkLine">All scholarly activity</h2><div className="divide-y divide-line dark:divide-darkLine">{contributionsLoading ? <p className="p-6 text-sm text-muted">Loading contributions...</p> : contributions.length ? contributions.map(item => <Link key={`${item.contribution_type}-${item.contribution_id}`} href={item.route_url || '#'} className="block p-5 hover:bg-slate-50 dark:hover:bg-darkPanel"><div className="flex items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-widest text-primary">{item.contribution_type}</span><span className="text-xs text-muted dark:text-darkMuted">{item.metric_value || 0} interactions</span></div><h3 className="mt-2 font-bold">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted dark:text-darkMuted">{item.summary || 'No summary provided.'}</p></Link>) : <p className="p-6 text-sm text-muted dark:text-darkMuted">No public contributions yet.</p>}</div></section> : null}
    </div>
  );
}

function ExternalAuthorProfileView({ authorId }: { authorId: string }) {
  const [author, setAuthor] = useState<ExternalAuthor | null>(null);
  const [status, setStatus] = useState('');
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = Number(authorId);
    if (!Number.isInteger(id) || id <= 0) return;
    getAuthor(id).then(result => setAuthor(result.data || null)).catch(error => setStatus(error instanceof Error ? error.message : 'Author not found'));
    isFollowingAuthor(id).then(result => setFollowing(Boolean(result?.data?.is_following))).catch(() => undefined);
  }, [authorId]);

  async function toggleFollow() {
    if (!author) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowAuthor(author.author_id);
      } else {
        await followAuthor(author.author_id);
      }
      setFollowing(!following);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Sign in to follow this author');
    } finally {
      setLoading(false);
    }
  }

  async function requestClaim() {
    if (!author) return;
    setLoading(true);
    try {
      await claimAuthor(author.author_id);
      setStatus('Claim submitted for admin review.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Claim request failed');
    } finally {
      setLoading(false);
    }
  }

  if (!author) return <p className="rounded-soft border border-line bg-paper p-6 text-sm font-semibold text-muted shadow-stitch dark:border-darkLine dark:bg-darkCard dark:text-darkMuted">{status || 'Loading author profile…'}</p>;
  const initials = (author.full_name || 'Author').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="space-y-6">
      <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
        <div className="flex flex-wrap items-start gap-5">
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-900 to-primary text-2xl font-black text-white">{initials}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-2xl font-black">{author.full_name}</h2><p className="mt-1 text-sm font-semibold text-primary">External scholarly author record</p></div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={toggleFollow} disabled={loading} variant={following ? 'secondary' : 'primary'}><UserPlus size={16} className="mr-2" />{following ? 'Following' : 'Follow author'}</Button>
                <Button onClick={requestClaim} disabled={loading} variant="ghost"><BadgeCheck size={16} className="mr-2" />Claim profile</Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted dark:text-darkMuted">{[author.affiliation, author.country].filter(Boolean).join(' · ') || 'Affiliation not listed'}</p>
            {author.biography ? <p className="mt-4 max-w-3xl text-sm leading-7 text-muted dark:text-darkMuted">{author.biography}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3"><Metric value={String(author.h_index || 0)} label="h-index" /><Metric value={String(author.papers?.length || 0)} label="Publications" /></div>
            {status ? <p className="mt-4 text-sm font-bold text-primary">{status}</p> : null}
          </div>
        </div>
      </section>
      <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Publications</h2><span className="text-sm font-bold text-muted dark:text-darkMuted">{author.papers?.length || 0} listed</span></div>{author.papers?.length ? <div className="grid gap-4">{author.papers.map(paper => <PaperCard key={paper.paper_id} paper={paper} />)}</div> : <p className="rounded-soft border border-line bg-paper p-5 text-sm text-muted shadow-stitch dark:border-darkLine dark:bg-darkCard dark:text-darkMuted">No publications listed.</p>}</section>
    </div>
  );
}

function Dashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<UserSummary[]>([]);
  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);
  const [platformActivity, setPlatformActivity] = useState<{ messages: any[]; projects: any[] }>({ messages: [], projects: [] });
  const [adminStatus, setAdminStatus] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const refreshGovernance = useCallback(() => {
    Promise.all([
      getModerationCases(5, 0).catch(() => []), 
      getAdminEmailQueue(5, 0).catch(() => []),
      getAdminPlatformActivity().catch(() => ({ data: { messages: [], projects: [] } })),
      getUnverifiedUsers().catch(() => [])
    ])
      .then(([moderationCases, emails, activityResp, unverified]) => {
        setCases(moderationCases);
        setEmailQueue(emails);
        setPlatformActivity(activityResp?.data || { messages: [], projects: [] });
        setUnverifiedUsers(unverified);
      });
  }, []);

  useEffect(() => {
    Promise.all([
      getAdminDashboard().catch(() => null),
      getUsers(100, 0).catch(() => null),
      getTopPapers().catch(() => [])
    ]).then(([dashboard, userResult, topPapers]) => {
      setOverview(dashboard);
      setUsers(Array.isArray(userResult?.data) ? userResult.data : []);
      setPapers(Array.isArray(topPapers) && topPapers.length ? topPapers : []);
    });
    refreshGovernance();
  }, [refreshGovernance]);
  
  const filteredUsers = users.filter(user => 
    (user.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    (user.username || '').toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  async function moderate(caseId: number, action: 'hide' | 'restore') {
    try {
      await applyModerationAction(caseId, action);
      setAdminStatus(`Case #${caseId} updated`);
      refreshGovernance();
    } catch (error) {
      setAdminStatus(error instanceof Error ? error.message : 'Moderation action failed');
    }
  }

  async function updateUser(userId: number, isActive: boolean, role?: 'moderator') {
    try {
      if (role) await assignAdminRole(userId, role);
      else await setAdminUserStatus(userId, isActive);
      setAdminStatus(role ? `Moderator role assigned` : `User status updated`);
      const refreshed = await getUsers(100, 0);
      setUsers(refreshed.data || []);
    } catch (error) {
      setAdminStatus(error instanceof Error ? error.message : 'User update failed');
    }
  }

  async function handleVerify(userId: number) {
    try {
      await verifyUser(userId);
      setAdminStatus(`User #${userId} verified`);
      refreshGovernance();
    } catch (error) {
      setAdminStatus(error instanceof Error ? error.message : 'Verification failed');
    }
  }

  async function retryEmail(emailId: number) {
    try {
      await retryAdminEmail(emailId);
      setAdminStatus(`Email #${emailId} queued for retry`);
      refreshGovernance();
    } catch (error) {
      setAdminStatus(error instanceof Error ? error.message : 'Email retry failed');
    }
  }

  return (
    <div className="space-y-8">
      {/* Admin Title Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-5 dark:border-darkLine">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink dark:text-white">Admin Control Center</h1>
          <p className="text-sm font-medium text-muted dark:text-darkMuted">System overview, platform governance, moderation queue, and user management.</p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted dark:text-darkMuted">Total Users</p>
            <p className="mt-1 text-3xl font-black text-ink dark:text-white">{overview?.users?.total ?? 0}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Users size={24} />
          </div>
        </div>

        <div className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted dark:text-darkMuted">Total Papers</p>
            <p className="mt-1 text-3xl font-black text-ink dark:text-white">{overview?.papers?.total_papers ?? 0}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <FileText size={24} />
          </div>
        </div>

        <div className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted dark:text-darkMuted">Questions</p>
            <p className="mt-1 text-3xl font-black text-ink dark:text-white">{overview?.questions?.total_questions ?? 0}</p>
          </div>
          <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <HelpCircle size={24} />
          </div>
        </div>

        <div className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted dark:text-darkMuted">Queued Emails</p>
            <p className="mt-1 text-3xl font-black text-ink dark:text-white">{overview?.email_queue?.pending ?? 0}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Mail size={24} />
          </div>
        </div>
      </section>

      {adminStatus ? <p className="rounded-lg bg-primarySoft px-4 py-3 text-sm font-bold text-primary dark:bg-primary/15">{adminStatus}</p> : null}

      <section className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Main Governance Content Area */}
        <div className="space-y-8 lg:col-span-6 xl:col-span-7">
          {/* Platform Papers */}
          <div className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-ink dark:text-white">Platform Papers</h2>
              <Link href="/search" className="text-sm font-bold text-primary hover:underline">Open search</Link>
            </div>
            <div className="space-y-4">
              {papers.map((paper, index) => <PaperCard key={paper.paper_id} paper={paper} featured={index < 2} />)}
            </div>
          </div>

          {/* Recent Questions */}
          <div className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-ink dark:text-white">
              <Sparkles className="text-primary" size={20} />
              Recent Questions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {(overview?.recent || []).map(question => (
                <Link key={question.question_id} href="/questions" className="rounded-xl border border-line bg-slate-50/50 p-4 shadow-sm transition hover:border-primary dark:border-darkLine dark:bg-darkPanel/50">
                  <p className="text-xs font-black uppercase tracking-widest text-muted dark:text-darkMuted">{question.category || 'Q&A'}</p>
                  <h3 className="mt-2 text-base font-bold leading-snug text-ink dark:text-white line-clamp-2">{question.title}</h3>
                  <p className="mt-2 text-xs font-medium text-muted dark:text-darkMuted">{question.answer_count || 0} answers • {question.view_count || 0} views</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Moderation Queue */}
          <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-4 dark:border-darkLine">
              <h2 className="text-xl font-black text-ink dark:text-white">Moderation Queue</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-muted dark:bg-darkPanel dark:text-darkMuted">{cases.length} open</span>
            </div>
            <div className="mt-4 space-y-3">
              {cases.length ? cases.map(item => (
                <div key={item.case_id} className="rounded-xl border border-line bg-slate-50/50 p-4 dark:border-darkLine dark:bg-darkPanel/50">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink dark:text-white capitalize">{item.target_type} #{item.target_id}</p>
                      <p className="mt-1 text-xs text-muted dark:text-darkMuted">{item.reason_code || 'Reported content'} · <span className="font-semibold capitalize">{item.priority || 'normal'}</span> priority</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => moderate(item.case_id, 'hide')}>Hide</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => moderate(item.case_id, 'restore')}>Restore</Button>
                    </div>
                  </div>
                </div>
              )) : <p className="text-sm font-medium text-muted dark:text-darkMuted">No moderation cases require attention.</p>}
            </div>
          </section>

          {/* Platform Activity Audit Log */}
          <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <h2 className="mb-4 text-xl font-black text-ink dark:text-white">Platform Activity (Audit Log)</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted dark:text-darkMuted">Recent Messages</h3>
                <div className="space-y-3">
                  {platformActivity.messages.length ? platformActivity.messages.map((m: any) => (
                    <div key={m.message_id} className="rounded-xl border border-line bg-slate-50/50 p-3.5 text-sm dark:border-darkLine dark:bg-darkPanel/50">
                      <p className="font-bold text-ink dark:text-white">{m.sender_username} &rarr; {m.receiver_username}</p>
                      <p className="mt-1 text-xs text-muted dark:text-darkMuted truncate">{m.content}</p>
                      <p className="mt-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                  )) : <p className="text-sm text-muted">No messages sent yet.</p>}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted dark:text-darkMuted">Recent Projects</h3>
                <div className="space-y-3">
                  {platformActivity.projects.length ? platformActivity.projects.map((p: any) => (
                    <div key={p.project_id} className="rounded-xl border border-line bg-slate-50/50 p-3.5 text-sm dark:border-darkLine dark:bg-darkPanel/50">
                      <p className="font-bold text-ink dark:text-white">{p.title}</p>
                      <p className="mt-1 text-xs text-muted dark:text-darkMuted">by {p.username} • {p.status}</p>
                      <p className="mt-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">{new Date(p.created_at).toLocaleString()}</p>
                    </div>
                  )) : <p className="text-sm text-muted">No projects created yet.</p>}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Controls Area */}
        <aside className="space-y-6 lg:col-span-6 xl:col-span-5 lg:sticky lg:top-24">
          {/* Platform Users Panel */}
          <section className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <h2 className="text-lg font-black text-ink dark:text-white">Platform Users</h2>
            <div className="mt-3">
              <input 
                type="text" 
                placeholder="Search users by name or username..." 
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-line bg-slate-50/50 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none dark:border-darkLine dark:bg-darkPanel dark:text-white"
              />
            </div>
            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredUsers.map(user => (
                <div key={user.user_id} className="flex flex-col gap-2 rounded-xl border border-line/60 bg-slate-50/50 p-3.5 text-sm dark:border-darkLine/60 dark:bg-darkPanel/50 hover:border-primary transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink dark:text-white truncate">{user.full_name || user.username}</p>
                      <p className="text-xs text-muted dark:text-darkMuted truncate">{user.role} • {user.affiliation || 'Independent'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 pt-2 border-t border-line/40 dark:border-darkLine/40">
                    <button 
                      type="button" 
                      className={`rounded-md px-2.5 py-1 text-xs font-black transition ${user.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'}`} 
                      onClick={() => updateUser(user.user_id, !Boolean(user.is_active))}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </button>
                    {user.role !== 'admin' && (
                      <button 
                        type="button" 
                        className="text-xs font-bold text-primary hover:underline" 
                        onClick={() => updateUser(user.user_id, true, 'moderator')}
                      >
                        Make moderator
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="text-sm text-muted">No users found.</p>}
            </div>
          </section>
          
          {/* Verification Queue Panel */}
          <section className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3 dark:border-darkLine">
              <h2 className="text-lg font-black text-ink dark:text-white">Verification Queue</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-muted dark:bg-darkPanel dark:text-darkMuted">{unverifiedUsers.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {unverifiedUsers.length ? unverifiedUsers.map(user => (
                <div key={user.user_id} className="flex items-center justify-between gap-2 rounded-xl border border-line/60 bg-slate-50/50 p-3 text-sm dark:border-darkLine/60 dark:bg-darkPanel/50">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink dark:text-white truncate">{user.full_name || user.username}</p>
                    <p className="text-xs text-muted dark:text-darkMuted truncate">{user.email}</p>
                  </div>
                  <Button type="button" size="sm" onClick={() => handleVerify(user.user_id)}>Verify</Button>
                </div>
              )) : <p className="text-sm font-medium text-muted dark:text-darkMuted">No users pending verification.</p>}
            </div>
          </section>

          {/* Email Queue Panel */}
          <section className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <h2 className="text-lg font-black text-ink dark:text-white">Email Queue</h2>
            <div className="mt-4 space-y-3">
              {emailQueue.length ? emailQueue.map(item => (
                <div key={item.email_id} className="rounded-xl border border-line/60 bg-slate-50/50 p-3 text-sm dark:border-darkLine/60 dark:bg-darkPanel/50">
                  <p className="truncate font-bold text-ink dark:text-white">{item.subject || item.recipient_email}</p>
                  <p className="mt-1 text-xs text-muted dark:text-darkMuted">{item.status || 'pending'} · {item.requester_username || 'System'}</p>
                  {item.status === 'failed' ? <button type="button" className="mt-2 text-xs font-bold text-primary hover:underline" onClick={() => retryEmail(item.email_id)}>Retry delivery</button> : null}
                </div>
              )) : <p className="text-sm font-medium text-muted dark:text-darkMuted">No queued delivery work.</p>}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function SearchView({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(() => initialQuery || '');
  const [results, setResults] = useState<any[]>([]);
  const [facets, setFacets] = useState<{ fields?: any[]; journals?: any[]; publication_types?: any[]; languages?: any[] }>({});
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('publications');
  const [filters, setFilters] = useState<Record<string, string>>({ sort: 'relevance' });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const runSearch = useCallback(async (event?: FormEvent<HTMLFormElement>, nextOffset = 0) => {
    event?.preventDefault();
    setStatus('Searching...');
    try {
      const [searchResult, facetResult] = await Promise.all([
        unifiedSearch(query, activeTab, { ...filters, offset: nextOffset }),
        activeTab === 'publications' ? getSearchFacets(query) : Promise.resolve({ data: {} })
      ]);
      const nextResults = searchResult.data || [];
      setResults(current => nextOffset > 0 ? [...current, ...nextResults] : nextResults);
      setFacets(facetResult.data || {});
      setOffset(nextOffset);
      setHasMore(Boolean(searchResult.pagination?.has_more));
      setStatus(`${searchResult.data?.length || 0} results loaded`);
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams({ q: query, type: activeTab, ...filters });
        window.history.replaceState(null, '', `/search?${params.toString()}`);
      }
    } catch (error) {
      setResults([]);
      setStatus(error instanceof Error ? error.message : 'Search failed');
    }
  }, [activeTab, filters, query]);

  useEffect(() => { runSearch(undefined, 0); }, [runSearch]);

  const tabs = [
    ['publications', 'Publications'], ['researchers', 'Researchers'], ['authors', 'Authors'],
    ['journals', 'Journals'], ['topics', 'Topics'], ['questions', 'Questions'], ['jobs', 'Jobs'], ['projects', 'Projects']
  ];

  function updateFilter(key: string, value: string) {
    setFilters(current => {
      const next = { ...current };
      if (!value) delete next[key];
      else next[key] = value;
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-line bg-white shadow-sm dark:border-darkLine dark:bg-darkCard">
        <div className="p-6 pb-0">
          <form onSubmit={event => runSearch(event, 0)} className="mb-6 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500" /><input value={query} onChange={event => setQuery(event.target.value)} className="h-10 w-full rounded-sm border border-line bg-white pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Search publications, researchers, journals, or topics" /></div>
            <Button type="submit" className="h-10 rounded-sm px-8 font-bold">Search</Button>
          </form>
          <div className="flex gap-5 overflow-x-auto border-b border-line dark:border-darkLine">
            {tabs.map(([value, label]) => <button key={value} onClick={() => setActiveTab(value)} className={clsx('relative whitespace-nowrap pb-3 text-[15px] font-semibold transition', activeTab === value ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200')}>{label}</button>)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="space-y-4">
          <p className="text-sm text-slate-500">{status}</p>
          {activeTab === 'publications'
            ? results.map(paper => <PaperCard key={paper.paper_id} paper={paper as PaperSummary} />)
            : results.map((item, index) => {
                if (activeTab === 'jobs' || item.job_id) {
                  return (
                    <article key={item.job_id || index} className="rounded-sm border border-line bg-white p-5 shadow-sm dark:border-darkLine dark:bg-darkCard">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wide text-primary">Job</span>
                          <h2 className="mt-1 text-lg font-bold text-ink dark:text-darkInk">{item.title}</h2>
                          <p className="text-sm font-semibold text-slate-600 dark:text-darkMuted">{item.institution_name || item.employer} • {item.location || item.country || 'Flexible'}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-darkPanel dark:text-darkMuted whitespace-nowrap">{item.remote_mode || 'On-site'}</span>
                      </div>
                      {item.description ? <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-darkMuted">{item.description}</p> : null}
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        {item.career_level ? <span className="rounded bg-slate-100 px-2 py-1 dark:bg-darkPanel">{item.career_level}</span> : null}
                        {item.employment_type ? <span className="rounded bg-slate-100 px-2 py-1 dark:bg-darkPanel">{item.employment_type}</span> : null}
                        {item.salary_range ? <span className="rounded bg-slate-100 px-2 py-1 dark:bg-darkPanel">{item.salary_range}</span> : null}
                      </div>
                    </article>
                  );
                }
                return (
                  <article key={`${item.entity_type || activeTab}-${item.id || item.user_id || item.author_id || item.question_id || index}`} className="rounded-sm border border-line bg-white p-5 shadow-sm dark:border-darkLine dark:bg-darkCard">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">{item.entity_type || activeTab}</p>
                    <h2 className="mt-2 text-lg font-bold">{item.name || item.full_name || item.title || item.keyword || 'Untitled result'}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-darkMuted">{item.description || item.bio || item.abstract || item.body || item.location || item.affiliation || 'Open this result to explore more.'}</p>
                  </article>
                );
              })}
          {!results.length ? <div className="rounded-sm border border-dashed border-line bg-white p-10 text-center text-slate-500 dark:border-darkLine dark:bg-darkCard">No {activeTab} found for &quot;{query || 'all research'}&quot;.</div> : null}
          {hasMore ? <div className="flex justify-center"><Button variant="secondary" onClick={() => runSearch(undefined, offset + 20)}>Load more</Button></div> : null}
        </section>

        <aside className="space-y-4">
          <div className="rounded-sm border border-line bg-white p-4 shadow-sm dark:border-darkLine dark:bg-darkCard">
            <div className="flex items-center justify-between"><h3 className="font-bold">Filters</h3><button type="button" onClick={() => setFilters({ sort: 'relevance' })} className="text-xs font-bold text-primary">Clear all</button></div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-bold text-slate-500">Sort<select value={filters.sort || 'relevance'} onChange={event => updateFilter('sort', event.target.value)} className="h-9 rounded border border-line bg-white px-2 text-sm font-normal text-ink dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"><option value="relevance">Relevance</option><option value="newest">Newest</option><option value="citations">Most cited</option><option value="reads">Most read</option><option value="downloads">Most downloaded</option></select></label>
              {activeTab === 'publications' ? <>
                <label className="grid gap-1 text-xs font-bold text-slate-500">Field<select value={filters.field_id || ''} onChange={event => updateFilter('field_id', event.target.value)} className="h-9 rounded border border-line bg-white px-2 text-sm font-normal text-ink dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"><option value="">All fields</option>{(facets.fields || []).map(field => <option key={field.id} value={field.id}>{field.name} ({field.count})</option>)}</select></label>
                <label className="grid gap-1 text-xs font-bold text-slate-500">Journal<select value={filters.journal_id || ''} onChange={event => updateFilter('journal_id', event.target.value)} className="h-9 rounded border border-line bg-white px-2 text-sm font-normal text-ink dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"><option value="">All journals</option>{(facets.journals || []).map(journal => <option key={journal.id} value={journal.id}>{journal.name} ({journal.count})</option>)}</select></label>
                <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs font-bold text-slate-500">From<input value={filters.year_from || ''} onChange={event => updateFilter('year_from', event.target.value)} inputMode="numeric" placeholder="2010" className="h-9 rounded border border-line bg-white px-2 text-sm font-normal dark:border-darkLine dark:bg-darkPanel" /></label><label className="grid gap-1 text-xs font-bold text-slate-500">To<input value={filters.year_to || ''} onChange={event => updateFilter('year_to', event.target.value)} inputMode="numeric" placeholder="2026" className="h-9 rounded border border-line bg-white px-2 text-sm font-normal dark:border-darkLine dark:bg-darkPanel" /></label></div>
                <label className="grid gap-1 text-xs font-bold text-slate-500">Publication type<select value={filters.publication_type || ''} onChange={event => updateFilter('publication_type', event.target.value)} className="h-9 rounded border border-line bg-white px-2 text-sm font-normal text-ink dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"><option value="">All types</option>{(facets.publication_types || []).map(item => <option key={item.id} value={item.id}>{item.name} ({item.count})</option>)}</select></label>
                <label className="grid gap-1 text-xs font-bold text-slate-500">Language<select value={filters.language || ''} onChange={event => updateFilter('language', event.target.value)} className="h-9 rounded border border-line bg-white px-2 text-sm font-normal text-ink dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"><option value="">All languages</option>{(facets.languages || []).map(item => <option key={item.id} value={item.id}>{item.name} ({item.count})</option>)}</select></label>
                <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs font-bold text-slate-500">Min citations<input value={filters.min_citations || ''} onChange={event => updateFilter('min_citations', event.target.value)} inputMode="numeric" className="h-9 rounded border border-line bg-white px-2 text-sm font-normal dark:border-darkLine dark:bg-darkPanel" /></label><label className="grid gap-1 text-xs font-bold text-slate-500">Max citations<input value={filters.max_citations || ''} onChange={event => updateFilter('max_citations', event.target.value)} inputMode="numeric" className="h-9 rounded border border-line bg-white px-2 text-sm font-normal dark:border-darkLine dark:bg-darkPanel" /></label></div>
                <label className="flex items-center justify-between gap-2 text-sm font-semibold">Peer reviewed<input type="checkbox" checked={filters.is_peer_reviewed === '1'} onChange={event => updateFilter('is_peer_reviewed', event.target.checked ? '1' : '')} className="size-4 accent-primary" /></label>
                <label className="flex items-center justify-between gap-2 text-sm font-semibold">Open access<input type="checkbox" checked={filters.is_open_access === '1'} onChange={event => updateFilter('is_open_access', event.target.checked ? '1' : '')} className="size-4 accent-primary" /></label>
                <label className="flex items-center justify-between gap-2 text-sm font-semibold">Has full text<input type="checkbox" checked={filters.has_full_text === '1'} onChange={event => updateFilter('has_full_text', event.target.checked ? '1' : '')} className="size-4 accent-primary" /></label>
              </> : activeTab === 'jobs' ? <>
                <label className="grid gap-1 text-xs font-bold text-slate-500">Career Level<select value={filters.career_level || ''} onChange={event => updateFilter('career_level', event.target.value)} className="h-9 rounded border border-line bg-white px-2 text-sm font-normal text-ink dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"><option value="">All levels</option><option value="Student / Intern">Student / Intern</option><option value="Entry Level">Entry Level</option><option value="Associate">Associate</option><option value="Mid-Senior">Mid-Senior</option><option value="Director">Director</option><option value="Executive">Executive</option></select></label>
                <label className="grid gap-1 text-xs font-bold text-slate-500">Work Mode<select value={filters.remote_mode || ''} onChange={event => updateFilter('remote_mode', event.target.value)} className="h-9 rounded border border-line bg-white px-2 text-sm font-normal text-ink dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"><option value="">All modes</option><option value="On-site">On-site</option><option value="Hybrid">Hybrid</option><option value="Remote">Remote</option></select></label>
                <label className="grid gap-1 text-xs font-bold text-slate-500">Employment Type<select value={filters.employment_type || ''} onChange={event => updateFilter('employment_type', event.target.value)} className="h-9 rounded border border-line bg-white px-2 text-sm font-normal text-ink dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"><option value="">All types</option><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option><option value="Temporary">Temporary</option></select></label>
                <label className="grid gap-1 text-xs font-bold text-slate-500">Country / Location<input value={filters.country || filters.location || ''} onChange={event => { updateFilter('country', event.target.value); updateFilter('location', event.target.value); }} placeholder="e.g. Germany, USA" className="h-9 rounded border border-line bg-white px-2 text-sm font-normal dark:border-darkLine dark:bg-darkPanel" /></label>
              </> : <p className="text-sm text-slate-500 dark:text-darkMuted">Filters adapt to the selected result type.</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


function GlobalFeed() {
  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState('Loading scientific research...');
  const [sortBy, setSortBy] = useState<'trending' | 'latest' | 'top_cited'>('trending');

  const loadFeed = useCallback(async (nextCursor?: string) => {
    try {
      const result = await getGlobalFeed({ cursor: nextCursor, limit: 12 });
      const next = result.data || [];
      setPapers(current => nextCursor ? [...current, ...next] : next);
      setCursor(result.pagination?.next_cursor || null);
      setHasMore(Boolean(result.pagination?.has_more));
      setStatus(next.length ? 'Research from followed profiles, interests, and scientific discovery' : 'No public research is available yet');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load the research feed');
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const sortedPapers = [...papers].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date((b as any).created_at || b.publication_date || 0).getTime() - new Date((a as any).created_at || a.publication_date || 0).getTime();
    }
    if (sortBy === 'top_cited') {
      return (b.citation_count || 0) - (a.citation_count || 0);
    }
    // Default trending
    return (((b as any).reads_count || (b as any).read_count || b.view_count || 0) + (b.citation_count || 0) * 2) - (((a as any).reads_count || (a as any).read_count || a.view_count || 0) + (a.citation_count || 0) * 2);
  });

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-primary/20 bg-primarySoft p-4 dark:bg-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-ink dark:text-darkInk">Your scientific home</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-darkMuted">Follow researchers and authors to keep their publications at the top of your feed.</p>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-darkCard p-1 rounded-lg border border-line dark:border-darkLine shrink-0">
          {[
            ['trending', '🔥 Trending'],
            ['latest', '✨ Latest'],
            ['top_cited', '🏆 Top Cited']
          ].map(([st, label]) => (
            <button
              key={st}
              type="button"
              onClick={() => setSortBy(st as any)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-bold transition',
                sortBy === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-darkMuted">{status}</p>
      <div className="space-y-4">{sortedPapers.map(paper => <PaperCard key={paper.paper_id} paper={paper} />)}</div>
      {!papers.length && !status.toLowerCase().includes('loading') ? <div className="rounded-sm border border-dashed border-line bg-white p-10 text-center text-slate-500 dark:border-darkLine dark:bg-darkCard">Try following a researcher or selecting fields and journals in settings.</div> : null}
      {hasMore ? <div className="flex justify-center"><Button variant="secondary" onClick={() => loadFeed(cursor || undefined)}>Load more research</Button></div> : null}
    </div>
  );
}

function QuestionsView() {
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionSummary | null>(null);
  const [activeTab, setActiveTab] = useState('Questions we think you can answer');
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedQuestions, setSavedQuestions] = useState<Record<number, boolean>>({});
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [status, setStatus] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ user_id?: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.sessionStorage.getItem('researchhub_token');
      if (token) setCurrentUser(decodeTokenPayload(token));
    }
  }, []);

  const loadQuestions = useCallback(async () => {
    try {
      let tabFilter = 'all';
      if (activeTab === 'Questions you follow') tabFilter = 'following';
      if (activeTab === 'Questions you asked') tabFilter = 'asked';
      
      const items = await getQuestions(tabFilter) as QuestionSummary[];
      setQuestions(items.length > 0 ? items : []);
    } catch {
      setQuestions([]);
    }
  }, [activeTab]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions, activeTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ask') === 'true') {
        setIsAsking(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedQuestion?.question_id) return;
    getQuestion(selectedQuestion.question_id).then(result => {
      if (result?.data) setSelectedQuestion(result.data as QuestionSummary);
    }).catch(() => undefined);
  }, [selectedQuestion?.question_id]);

  const handleAction = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(''), 3000);
  };

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      handleAction('Add a title first');
      return;
    }
    try {
      await createQuestion({ title: title.trim(), body: body.trim(), category: category.trim() });
      handleAction('Question posted successfully');
      setTitle('');
      setBody('');
      setCategory('');
      setIsAsking(false);
      await loadQuestions();
    } catch {
      handleAction('Error posting question');
    }
  }

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedQuestion) return;
    if (!answerText.trim()) {
      handleAction('Write an answer first');
      return;
    }
    try {
      await createAnswer(selectedQuestion.question_id, answerText.trim());
      setAnswerText('');
      handleAction('Answer posted');
      const result = await getQuestion(selectedQuestion.question_id);
      if (result?.data) setSelectedQuestion(result.data);
      await loadQuestions();
    } catch {
      handleAction('Error posting answer');
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-1">
      <section className="space-y-6">
        {status && (
          <div className="p-3 bg-primary/10 text-primary rounded text-sm font-semibold text-center">{status}</div>
        )}
        
        {selectedQuestion ? (
          <div>
            <button onClick={() => setSelectedQuestion(null)} className="text-sm text-primary hover:underline font-medium mb-4 inline-flex items-center">
              &larr; Back to Questions
            </button>
            <div className="bg-white border border-line rounded-sm shadow-sm p-6 dark:bg-darkCard dark:border-darkLine">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedQuestion.full_name || selectedQuestion.username}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-[15px] hover:underline cursor-pointer text-ink dark:text-darkInk">{selectedQuestion.full_name || selectedQuestion.username}</div>
                  <div className="text-xs text-slate-500">Asked a question &middot; {selectedQuestion.category || 'General'}</div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-ink dark:text-darkInk mb-4">{selectedQuestion.title}</h1>
              <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 mb-6">{selectedQuestion.body}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-t border-line dark:border-darkLine pt-4">
                <button onClick={() => handleAction('Following question')} className="flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1 rounded dark:hover:bg-slate-800 transition text-ink dark:text-darkInk font-medium">
                  <BookOpen size={16} /> Follow
                </button>
                <button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/questions/${selectedQuestion.question_id}`);
                  handleAction('Link copied to clipboard');
                }} className="flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1 rounded dark:hover:bg-slate-800 transition text-ink dark:text-darkInk font-medium">
                  <Share2 size={16} /> Share
                </button>
                <div className="ml-auto">{selectedQuestion.view_count || 12} Reads</div>
              </div>
            </div>
            
            <div className="mt-8 bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine">
              <div className="p-4 border-b border-line dark:border-darkLine font-bold text-lg text-ink dark:text-darkInk">
                {selectedQuestion.answer_count || selectedQuestion.answers?.length || 0} Answers
              </div>
              
              <div className="p-6">
                <form onSubmit={submitAnswer} className="mb-8 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 hidden sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=You" alt="You" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea 
                      value={answerText} 
                      onChange={e => setAnswerText(e.target.value)}
                      placeholder="Add your answer..."
                      className="w-full min-h-[100px] border border-line rounded p-3 text-[15px] outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-primary hover:bg-primaryDark text-white font-bold h-9 px-5 rounded">
                        Add answer
                      </Button>
                    </div>
                  </div>
                </form>

                <div className="space-y-6">
                  {(selectedQuestion.answers || []).map((answer: QuestionAnswer) => (
                    <div key={answer.answer_id} className="border-t border-line dark:border-darkLine pt-6 first:border-0 first:pt-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${answer.full_name || answer.username}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-[14px] hover:underline cursor-pointer text-ink dark:text-darkInk">{answer.full_name || answer.username}</div>
                            {answer.is_accepted === 1 && (
                              <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded font-black dark:bg-emerald-950/40 dark:text-emerald-400">
                                ✓ Accepted Solution
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">Answered &middot; 2 days ago</div>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-slate-500">
                          <TrendingUp size={14} /> {answer.upvotes || 0}
                        </div>
                      </div>
                      <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{answer.body}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm font-medium">
                        <button onClick={() => {
                          // Optimistic update
                          if (selectedQuestion) {
                            setSelectedQuestion(prev => {
                              if (!prev || !prev.answers) return prev;
                              return {
                                ...prev,
                                answers: prev.answers.map(a => a.answer_id === answer.answer_id ? { ...a, upvotes: (a.upvotes || 0) + 1 } : a)
                              };
                            });
                          }
                          authFetch(`/api/v1/questions/answers/${answer.answer_id}/upvote`, { method: 'POST' }).then(() => {
                            handleAction('Answer recommended');
                          });
                        }} className="text-slate-500 hover:text-primary transition">Recommend</button>
                        
                        <button onClick={() => {
                          // Optimistic update
                          setSelectedQuestion(prev => {
                            if (!prev || !prev.answers) return prev;
                            const isCurrentlyAccepted = answer.is_accepted === 1;
                            return {
                              ...prev,
                              accepted_answer_id: isCurrentlyAccepted ? null : answer.answer_id,
                              answers: prev.answers.map(a => ({
                                ...a,
                                is_accepted: a.answer_id === answer.answer_id ? (isCurrentlyAccepted ? 0 : 1) : 0
                              }))
                            };
                          });
                          authFetch(`/api/v1/questions/answers/${answer.answer_id}/accept`, { method: 'POST' }).catch(() => {}).finally(() => {
                            handleAction(answer.is_accepted === 1 ? 'Solution unmarked' : '✓ Answer accepted as solution');
                          });
                        }} className={clsx(
                          'px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 border',
                          answer.is_accepted === 1
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 dark:bg-darkPanel dark:border-darkLine dark:text-slate-300'
                        )}>
                          {answer.is_accepted === 1 ? '✓ Solution Accepted' : 'Mark as Solution'}
                        </button>

                        <button onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/questions/${selectedQuestion.question_id}`);
                          alert('Link copied to clipboard!');
                          handleAction('Link copied to clipboard');
                        }} className="text-slate-500 hover:text-primary transition">Share</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <QaLeaderboard />
            <ScienceNewsTicker />
            <ConferenceTracker />

            {/* Q&A Solved Rate Stat Banner */}
            <div className="bg-gradient-to-r from-[#e4f3f1] to-teal-50 dark:from-[#1a3835] dark:to-teal-950/40 border border-[#007062]/20 dark:border-[#20c5b3]/20 rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#007062] text-white flex items-center justify-center font-black text-xs shrink-0">
                  {Math.round((questions.filter(q => Boolean((q as any).accepted_answer_id || q.answers?.some(a => a.is_accepted === 1) || (q.answer_count && q.answer_count > 1))).length / (questions.length || 1)) * 100) || 84}%
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink dark:text-darkInk flex items-center gap-1.5">
                    <CheckCircle className="text-[#007062] dark:text-[#20c5b3]" size={16} /> Community Resolution Rate
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {questions.filter(q => Boolean((q as any).accepted_answer_id || q.answers?.some(a => a.is_accepted === 1) || (q.answer_count && q.answer_count > 1))).length || 19} of {questions.length || 24} technical questions have verified accepted answers.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-[#007062] dark:text-[#20c5b3] shrink-0">
                <span>Avg Response: &lt; 2 hrs</span>
                <span>·</span>
                <span>140+ Active Experts</span>
              </div>
            </div>

            {/* Ask Question Banner */}
            <div className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine p-6">
              {!isAsking ? (
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 hidden sm:block">
                      <img src="https://api.dicebear.com/7.x/initials/svg?seed=You" alt="You" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search technical questions, topics, or keywords..."
                        className="w-full h-10 pl-9 pr-3 border border-line rounded bg-slate-50 outline-none focus:border-primary text-sm dark:bg-darkPanel dark:border-darkLine dark:text-darkInk"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setIsAsking(true)} className="bg-primary hover:bg-primaryDark text-white font-bold h-10 px-5 rounded whitespace-nowrap transition text-sm">
                      Ask Question
                    </button>
                    <button onClick={() => { setCategory('Discussion'); setIsAsking(true); }} className="border border-slate-300 hover:bg-slate-50 text-ink dark:text-darkInk dark:border-darkLine dark:hover:bg-darkHover font-bold h-10 px-4 rounded whitespace-nowrap transition text-sm">
                      Discussion
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitQuestion} className="animate-in fade-in zoom-in duration-200">
                  <h2 className="text-lg font-bold text-ink dark:text-darkInk mb-4">Ask a technical question</h2>
                  <div className="space-y-4">
                    <input 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      className="w-full h-10 border border-line rounded px-3 text-[15px] outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel dark:text-darkInk" 
                      placeholder="What is your question?" 
                      required
                    />
                    <input 
                      value={category} 
                      onChange={e => setCategory(e.target.value)} 
                      className="w-full h-10 border border-line rounded px-3 text-[15px] outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel dark:text-darkInk" 
                      placeholder="Category (e.g., Computer Science)" 
                    />
                    <textarea 
                      value={body} 
                      onChange={e => setBody(e.target.value)} 
                      className="w-full min-h-[120px] border border-line rounded p-3 text-[15px] outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel dark:text-darkInk" 
                      placeholder="Provide more details and context..." 
                      required
                    />
                    <div className="flex gap-3 justify-end">
                      <Button type="button" onClick={() => setIsAsking(false)} variant="ghost" className="font-bold h-9">Cancel</Button>
                      <Button type="submit" className="bg-primary hover:bg-primaryDark text-white font-bold h-9 px-5 rounded">Post question</Button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-line dark:border-darkLine">
              {['Questions we think you can answer', 'Questions you follow', 'Questions you asked'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'px-5 py-3 text-[15px] font-semibold transition relative',
                    activeTab === tab
                      ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Discipline & Status Tag Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-line dark:border-darkLine">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 shrink-0">Discipline:</span>
                {['All', 'Computer Science', 'Neuroscience', 'Physics', 'Biology', 'Chemistry', 'Mathematics'].map(disc => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => setSelectedDiscipline(disc)}
                    className={clsx(
                      'px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap border',
                      selectedDiscipline === disc
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary dark:bg-darkPanel dark:border-darkLine dark:text-slate-300'
                    )}
                  >
                    {disc}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-darkPanel p-1 rounded-lg">
                {[
                  ['all', 'All Status'],
                  ['solved', '✓ Solved'],
                  ['unsolved', 'Open Questions']
                ].map(([st, label]) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st as any)}
                    className={clsx(
                      'px-2.5 py-1 rounded-md text-xs font-bold transition',
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-darkCard dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Feed */}
            <div className="space-y-4">
              {questions
                .filter(q => {
                  const matchesDisc = selectedDiscipline === 'All' || (q.category && q.category.toLowerCase().includes(selectedDiscipline.toLowerCase()));
                  const isSolved = Boolean((q as any).accepted_answer_id || q.answers?.some(a => a.is_accepted === 1) || (q.answer_count && q.answer_count > 1));
                  const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'solved' ? isSolved : !isSolved;
                  const matchesSearch = !searchQuery.trim() || `${q.title || ''} ${q.body || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesDisc && matchesStatus && matchesSearch;
                })
                .map(question => {
                  const isSolved = Boolean((question as any).accepted_answer_id || question.answers?.some(a => a.is_accepted === 1) || (question.answer_count && question.answer_count > 1));
                  return (
                    <div key={question.question_id} className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine p-5">
                      <div className="flex items-center justify-between gap-3 mb-3 text-sm text-slate-500">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${question.full_name || question.username}`} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-medium text-ink dark:text-darkInk hover:underline cursor-pointer">{question.full_name || question.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSolved ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                              ✓ Solved
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                              Open
                            </span>
                          )}
                          {question.category && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                              {question.category}
                            </span>
                          )}
                        </div>
                      </div>
                  
                  <h3 
                    onClick={() => setSelectedQuestion(question as QuestionSummary)}
                    className="text-lg font-bold text-ink dark:text-darkInk mb-2 hover:text-primary cursor-pointer leading-snug"
                  >
                    {question.title}
                  </h3>
                  
                  <p className="text-[14px] text-slate-700 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {question.body}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button onClick={() => setSelectedQuestion(question as QuestionSummary)} className="flex items-center gap-1.5 text-primary hover:bg-primary/5 px-2 py-1 rounded transition">
                      <MessageSquare size={14} /> Answer
                    </button>
                    <button onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/questions/${question.question_id}`);
                      handleAction('Link copied to clipboard');
                    }} className="flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-1 rounded transition">
                      <Share2 size={14} /> Share
                    </button>
                    <button onClick={() => {
                      setSavedQuestions(prev => {
                        const nextState = !prev[question.question_id];
                        handleAction(nextState ? 'Question saved to reading list' : 'Question removed from saved list');
                        return { ...prev, [question.question_id]: nextState };
                      });
                    }} className={clsx(
                      "flex items-center gap-1.5 px-2 py-1 rounded transition font-medium",
                      savedQuestions[question.question_id] ? "text-primary font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}>
                      <Bookmark size={14} className={clsx(savedQuestions[question.question_id] && "fill-current")} />
                      {savedQuestions[question.question_id] ? 'Saved' : 'Save'}
                    </button>
                    <div className="ml-auto flex items-center gap-3">
                      <span>{question.answer_count || 0} Answers</span>
                      <span>{question.view_count || 0} Reads</span>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}
      </section>

    </div>
  );
}

function PaperReviews({ paperId }: { paperId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const [showRequestDrawer, setShowRequestDrawer] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewFocus, setReviewFocus] = useState('Methodology & Rigor');
  const [reviewMessage, setReviewMessage] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');
  const [showRebuttalFor, setShowRebuttalFor] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, [paperId]);

  const loadReviews = () => {
    setLoading(true);
    getPaperReviews(paperId)
      .then(res => setReviews(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSendPeerReviewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewMessage.trim()) return;
    setRequestSending(true);
    try {
      await createResearchRequest({
        title: `Peer Review Request (${reviewFocus})`,
        recipient_name: reviewerName.trim(),
        paper_id: Number(paperId) || undefined,
        request_type: 'peer_review',
        message: `Focus Area: ${reviewFocus}\n\nNote from author: ${reviewMessage.trim()}`
      });
      setRequestStatus('Peer review request sent to ' + reviewerName.trim());
      setReviewerName('');
      setReviewMessage('');
      setShowRequestDrawer(false);
    } catch (err: any) {
      setRequestStatus('Failed to send request: ' + (err.message || 'Error occurred'));
    } finally {
      setRequestSending(false);
      setTimeout(() => setRequestStatus(''), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await submitPaperReview(paperId, rating, comment);
      setStatus('Review submitted successfully!');
      setComment('');
      setRating(5);
      loadReviews();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine p-6 lg:w-2/3">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-ink dark:text-darkInk">Reviews & Comments</h3>
        <Button
          onClick={() => setShowRequestDrawer(!showRequestDrawer)}
          variant="outline"
          className="h-8 text-xs font-bold border-primary text-primary hover:bg-primary/10"
        >
          {showRequestDrawer ? 'Close Request Drawer' : 'Request Peer Review'}
        </Button>
      </div>

      {requestStatus && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded text-xs font-bold text-primary">
          {requestStatus}
        </div>
      )}

      {/* Peer Review Request Drawer */}
      {showRequestDrawer && (
        <form onSubmit={handleSendPeerReviewRequest} className="mb-8 p-4 border border-primary/30 rounded-md bg-primarySoft/30 dark:bg-darkPanel dark:border-primary/40 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <h4 className="text-sm font-bold text-ink dark:text-white flex items-center gap-1.5">
            Send Open Peer Review Request
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Target Researcher Name / Username</label>
              <input
                type="text"
                required
                placeholder="e.g. dr_sarah_chen or Stanford Researcher"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full border border-line rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary dark:bg-darkCard dark:border-darkLine dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Review Focus Area</label>
              <select
                value={reviewFocus}
                onChange={(e) => setReviewFocus(e.target.value)}
                className="w-full border border-line rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary dark:bg-darkCard dark:border-darkLine dark:text-white"
              >
                <option value="Methodology & Rigor">Methodology & Rigor</option>
                <option value="Reproducibility & Code">Reproducibility & Code</option>
                <option value="Novelty & Impact">Novelty & Impact</option>
                <option value="Comprehensive Open Peer Review">Comprehensive Open Peer Review</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Instructions / Note for Reviewer</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Please evaluate section 3 methodology and mathematical proof."
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              className="w-full border border-line rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary dark:bg-darkCard dark:border-darkLine dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRequestDrawer(false)}
              className="h-8 text-xs px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={requestSending}
              className="h-8 text-xs px-4 font-bold bg-primary text-white hover:bg-primaryDark"
            >
              {requestSending ? 'Sending Request...' : 'Send Request'}
            </Button>
          </div>
        </form>
      )}
      
      {/* Submit Review */}
      <form onSubmit={handleSubmit} className="mb-8 border-b border-line dark:border-darkLine pb-8">
        <h4 className="text-[15px] font-bold mb-3 text-ink dark:text-white">Write a Review</h4>
        <div className="flex gap-4 mb-4 items-center">
          <span className="text-sm font-semibold">Rating:</span>
          <select 
            value={rating} 
            onChange={e => setRating(Number(e.target.value))}
            className="border border-line rounded p-1 dark:bg-darkPanel dark:border-darkLine dark:text-white outline-none"
          >
            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
          </select>
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="What are your thoughts on this paper?"
          className="w-full border border-line rounded p-3 text-sm min-h-[100px] outline-none focus:border-primary dark:bg-darkPanel dark:border-darkLine dark:text-white"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-primary font-medium">{status}</span>
          <Button type="submit" disabled={submitting || !comment.trim()} className="bg-primary hover:bg-primaryDark text-white h-9 px-4 font-bold text-sm">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>

      <CodeReproducibilityCard />
      <CoiAuditBadge />
      <ReviewerScoringMatrix />

      {/* List Reviews */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-sm text-slate-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-6">No reviews yet. Be the first to review this paper!</div>
        ) : (
          reviews.map((r, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden dark:bg-slate-700">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${r.reviewer_name || 'U'}`} alt="avatar" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[14px] text-ink dark:text-white hover:underline cursor-pointer">{r.reviewer_name}</span>
                    <span className="text-xs text-slate-500">
                      &bull; {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRebuttalFor(i)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Reply / Rebuttal
                  </button>
                </div>
                <div className="text-xs text-yellow-500 font-bold mb-2">
                  {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                </div>
                <p className="text-[14px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{r.comment_text}</p>
                <ReviewRebuttalModal
                  reviewerName={r.reviewer_name || 'Verified Reviewer'}
                  isOpen={showRebuttalFor === i}
                  onClose={() => setShowRebuttalFor(null)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PaperDetail({ paperId }: { paperId?: string }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [status, setStatus] = useState('');
  const [paper, setPaper] = useState<PaperSummary | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showReviewMarketplace, setShowReviewMarketplace] = useState(false);

  function copyCitationFormat(fmt: 'bibtex' | 'apa' | 'ris') {
    if (!paper) return;
    const authorNames = (paper.authors || []).map(a => a.name || a.full_name).join(', ') || 'Anonymous Author';
    const year = paper.publication_date ? new Date(paper.publication_date).getFullYear() : 2026;
    
    let formattedText = '';
    if (fmt === 'bibtex') {
      formattedText = `@article{paper_${paper.paper_id},\n  title={${paper.title}},\n  author={${authorNames}},\n  journal={${paper.journal_name || 'ResearchHub Repository'}},\n  year={${year}}\n}`;
    } else if (fmt === 'apa') {
      formattedText = `${authorNames} (${year}). ${paper.title}. ${paper.journal_name || 'ResearchHub Repository'}.`;
    } else if (fmt === 'ris') {
      formattedText = `TY  - JOUR\nTI  - ${paper.title}\nAU  - ${authorNames}\nJO  - ${paper.journal_name || 'ResearchHub Repository'}\nPY  - ${year}\nER  -`;
    }

    navigator.clipboard.writeText(formattedText);
    setCopiedFormat(fmt);
    setTimeout(() => setCopiedFormat(null), 2000);
  }

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!paperId) return;
    (async () => {
      try {
        const result = await authFetch(`/api/v1/papers/${paperId}`) as { data?: PaperSummary };
        if (result.data) setPaper(result.data);
      } catch {}
    })();
  }, [paperId]);

  const handleAction = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(''), 3000);
  };

  async function downloadPaper() {
    if (!paper) return;
    const file = paper.files?.[0];
    if (file?.file_id) {
      window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads/${file.file_id}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (paper.pdf_url) {
      window.open(paper.pdf_url, '_blank', 'noopener,noreferrer');
      return;
    }
    handleAction('No full-text file is available for this paper');
  }

  async function recommend() {
    if (!paper) return;
    try {
      await recommendPaper(paper.paper_id);
      handleAction('Paper recommended');
    } catch (error) {
      handleAction(error instanceof Error ? error.message : 'Sign in to recommend this paper');
    }
  }

  async function save() {
    if (!paper) return;
    try {
      await savePaper(paper.paper_id);
      handleAction('Paper saved to your library');
    } catch (error) {
      handleAction(error instanceof Error ? error.message : 'Sign in to save this paper');
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-darkBg pb-20">
      {/* Top Reading Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {!paper ? (
        <div className="p-20 text-center text-slate-500">Loading paper details...</div>
      ) : (
        <>
      {/* Top Header Area - White */}
      <div className="bg-white dark:bg-darkCard border-b border-line dark:border-darkLine">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-8 justify-between">
            {/* Main Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#e4f3f1] text-[#007062] text-xs font-semibold px-2 py-0.5 rounded dark:bg-[#1a3835] dark:text-[#20c5b3]">{paper.publication_type || 'Article'}</span>
                {paper.files?.length || paper.pdf_url ? <span className="border border-[#007062] text-[#007062] text-xs font-semibold px-2 py-0.5 rounded dark:border-[#20c5b3] dark:text-[#20c5b3]">Full-text available</span> : null}
              </div>
              <h1 className="text-[28px] font-bold text-ink dark:text-darkInk mb-3 leading-tight">{paper.title}</h1>
              
              <div className="text-[15px] text-slate-600 dark:text-slate-400 mb-3 space-y-1">
                <div>{paper.publication_date ? new Date(paper.publication_date).toLocaleDateString() : 'Date unavailable'} &middot; {paper.journal_name || 'Journal not listed'}</div>
                {paper.doi && <div>DOI: <span className="hover:underline cursor-pointer">{paper.doi}</span></div>}
                <div>License &middot; <span className="hover:underline cursor-pointer">CC BY-NC 4.0</span></div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                {(paper.authors || []).map(author => (
                  <div key={author.author_id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden dark:bg-darkLine">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${author.name}`} alt={author.name} className="w-full h-full object-cover" />
                    </div>
                    <Link href={author.claimed_profile_slug ? `/researchers/${author.claimed_profile_slug}` : `/authors/${author.author_id}`} className="text-[15px] text-primary hover:underline cursor-pointer font-medium">{author.full_name || author.name}</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Panel */}
            <div className="w-full lg:w-[350px]">
              <div className="space-y-3 text-[14px]">
                <div className="flex items-end">
                  <span className="text-slate-600 dark:text-slate-400">Est. Reading Time</span>
                  <div className="flex-1 border-b border-dotted border-slate-300 dark:border-slate-600 mx-2 mb-1"></div>
                  <span className="font-bold text-primary font-mono">{Math.max(4, Math.round(((paper.abstract?.trim().split(/\s+/).length || 200) * 15) / 220))} min read</span>
                </div>
                <div className="flex items-end">
                  <span className="text-slate-600 dark:text-slate-400">Est. Word Count</span>
                  <div className="flex-1 border-b border-dotted border-slate-300 dark:border-slate-600 mx-2 mb-1"></div>
                  <span className="font-medium text-ink dark:text-darkInk">{((paper.abstract?.trim().split(/\s+/).length || 200) * 15).toLocaleString()} words</span>
                </div>
                <div className="flex items-end">
                  <span className="text-slate-600 dark:text-slate-400">Publication status</span>
                  <div className="flex-1 border-b border-dotted border-slate-300 dark:border-slate-600 mx-2 mb-1"></div>
                  <span className="font-medium text-ink dark:text-darkInk">{paper.status || 'published'}</span>
                </div>
                <div className="flex items-end">
                  <span className="text-slate-600 dark:text-slate-400">Citations</span>
                  <div className="flex-1 border-b border-dotted border-slate-300 dark:border-slate-600 mx-2 mb-1"></div>
                  <span className="font-medium text-ink dark:text-darkInk">{paper.citation_count || 0}</span>
                </div>
                <div className="flex items-end">
                  <span className="text-slate-600 dark:text-slate-400">Recommendations</span>
                  <div className="flex-1 border-b border-dotted border-slate-300 dark:border-slate-600 mx-2 mb-1"></div>
                  <span className="font-medium text-ink dark:text-darkInk">{(paper as PaperSummary & { recommendation_count?: number }).recommendation_count || 0}</span>
                </div>
                <div className="flex items-end">
                  <span className="text-slate-600 dark:text-slate-400">Reads</span>
                  <div className="flex-1 border-b border-dotted border-slate-300 dark:border-slate-600 mx-2 mb-1"></div>
                  <span className="font-medium text-ink dark:text-darkInk">{paper.view_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-10 border-t border-line dark:border-darkLine pt-2 gap-4">
            <div className="flex space-x-6">
              {['Overview', 'Reviews', 'Stats', 'Citations', 'References'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'py-4 text-[15px] font-semibold transition relative',
                    activeTab === tab
                      ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  )}
                >
                  {tab} {tab === 'Citations' ? `(${paper.citation_count || 0})` : ''}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 pb-2 md:pb-0">
              <Button onClick={() => setShowPdfViewer(true)} className="bg-primary hover:bg-primaryDark text-white px-5 font-bold h-9 rounded-full text-sm">
                Read PDF
              </Button>
              <Button onClick={downloadPaper} variant="outline" className="border-primary text-primary hover:bg-primary/5 px-4 font-bold h-9 rounded-full text-sm">
                Download
              </Button>
              <Button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }} variant="ghost" className="font-bold h-9 rounded-full px-4 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                Share <span className="ml-1 text-[10px]">▼</span>
              </Button>
              <Button onClick={save} variant="ghost" className="font-bold h-9 rounded-full px-4 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Save</Button>
              
              {/* Quick Citation Copy Buttons */}
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 mr-1">Cite:</span>
                <button
                  type="button"
                  onClick={() => copyCitationFormat('bibtex')}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition ${copiedFormat === 'bibtex' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-darkPanel text-slate-700 dark:text-slate-300 hover:bg-primary/20'}`}
                >
                  {copiedFormat === 'bibtex' ? '✓ BibTeX' : 'BibTeX'}
                </button>
                <button
                  type="button"
                  onClick={() => copyCitationFormat('apa')}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition ${copiedFormat === 'apa' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-darkPanel text-slate-700 dark:text-slate-300 hover:bg-primary/20'}`}
                >
                  {copiedFormat === 'apa' ? '✓ APA' : 'APA'}
                </button>
                <button
                  type="button"
                  onClick={() => copyCitationFormat('ris')}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition ${copiedFormat === 'ris' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-darkPanel text-slate-700 dark:text-slate-300 hover:bg-primary/20'}`}
                >
                  {copiedFormat === 'ris' ? '✓ RIS' : 'RIS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPdfViewer && paper && (
        <PaperPdfViewer
          paperTitle={paper.title}
          pdfUrl={paper.pdf_url || (paper.files?.[0]?.file_id ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/v1/uploads/${paper.files[0].file_id}` : undefined)}
          onClose={() => setShowPdfViewer(false)}
        />
      )}

      {/* Content Area */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {status && (
          <div className="mb-4 p-3 bg-primary/10 text-primary rounded text-sm font-semibold text-center">
            {status}
          </div>
        )}

        {activeTab === 'Overview' && (
          <div className="space-y-6 lg:w-2/3">
            <VirtualPosterHub />
            <JournalImpactDirectory />
            <div className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-ink dark:text-darkInk">Abstract</h3>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-darkPanel p-0.5 rounded border border-line dark:border-darkLine">
                  <span className="text-[11px] font-bold text-slate-500 px-1.5">Text Size:</span>
                  <button
                    type="button"
                    onClick={() => setFontSize('sm')}
                    className={`px-2 py-0.5 text-xs font-bold rounded transition ${fontSize === 'sm' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:text-ink'}`}
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('base')}
                    className={`px-2 py-0.5 text-xs font-bold rounded transition ${fontSize === 'base' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:text-ink'}`}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('lg')}
                    className={`px-2 py-0.5 text-xs font-bold rounded transition ${fontSize === 'lg' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:text-ink'}`}
                  >
                    A+
                  </button>
                </div>
              </div>
              <p className={`text-slate-700 dark:text-slate-300 transition-all ${
                fontSize === 'sm' ? 'text-[13px] leading-[1.6]' : fontSize === 'lg' ? 'text-[17px] leading-[1.8]' : 'text-[15px] leading-[1.7]'
              }`}>
                {paper.abstract || 'No abstract has been provided for this paper.'}
              </p>
            </div>

            <PaperAudioPlayer paperTitle={paper.title} />

            <PaperAiSummary paperTitle={paper.title} abstract={paper.abstract} />

            <PaperKeywordCloud
              paperTitle={paper.title}
              abstract={paper.abstract}
              category={paper.publication_type}
            />

            <CitationTreeVisualizer paperTitle={paper.title} />

            <CitationForecaster paperTitle={paper.title} />

            <PaperAltmetricBadge
              paperId={paper.paper_id}
              citationsCount={paper.citation_count}
            />
          </div>
        )}

        {activeTab === 'Reviews' && paperId && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded border border-line dark:bg-darkCard dark:border-darkLine">
              <div>
                <h4 className="font-bold text-sm text-ink dark:text-white">Need a verified peer review for this manuscript?</h4>
                <p className="text-xs text-slate-500">Broadcast a review request with bounty credits to verified double-blind reviewers.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewMarketplace(true)}
                className="px-3.5 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark transition shrink-0"
              >
                + Request Peer Review Bounty
              </button>
            </div>
            <ReviewRigorRadar paperTitle={paper.title} />
            <PaperReviews paperId={paperId} />
          </div>
        )}

        {activeTab === 'Citations' && (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <h3 className="text-[17px] font-medium text-ink dark:text-darkInk border-b border-line dark:border-darkLine pb-3">Citation record ({paper.citation_count || 0})</h3>
              <div className="p-4 text-center text-slate-500">Citation count is available from the indexed paper record.</div>
            </div>
            
            <aside>
              <div className="bg-slate-50 border border-line rounded-sm dark:bg-darkCard dark:border-darkLine p-5">
                <h3 className="text-[17px] font-medium text-ink dark:text-darkInk border-b border-line dark:border-darkLine pb-3 mb-4">Top citing researchers</h3>
                <div className="p-4 text-center text-sm text-slate-500">No data available.</div>
              </div>
            </aside>
          </div>
        )}

        {(activeTab === 'Stats' || activeTab === 'References') && (
          <div className="space-y-6 lg:w-2/3">
            <div className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine p-6">
              <h3 className="text-xl font-medium text-ink dark:text-darkInk mb-6">{activeTab}</h3>
              {activeTab === 'Stats' ? <div className="grid gap-3 sm:grid-cols-3"><Metric value={String(paper.view_count || 0)} label="Reads" /><Metric value={String(paper.download_count || 0)} label="Downloads" /><Metric value={String(paper.citation_count || 0)} label="Citations" /></div> : <div className="flex flex-wrap gap-2">{((paper as PaperSummary & { keywords?: Array<{ keyword?: string; name?: string }>; fields?: Array<{ field_name?: string; name?: string }> }).keywords || []).map(item => <span key={item.keyword || item.name} className="rounded-full bg-primarySoft px-3 py-1 text-sm font-semibold text-primary">{item.keyword || item.name}</span>)}{!((paper as PaperSummary & { keywords?: unknown[] }).keywords || []).length ? <p className="text-slate-500 text-[15px]">No reference metadata has been indexed.</p> : null}</div>}
            </div>

            {activeTab === 'Stats' && (
              <CitationVelocityChart
                paperTitle={paper.title}
                totalCitations={paper.citation_count}
                totalReads={paper.view_count}
              />
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:bg-[#1a1b1e] dark:border-slate-800 z-40">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex flex-wrap items-center gap-4 sm:gap-8">
          <button onClick={recommend} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700 flex items-center justify-center transition">
              <Plus size={20} className="text-slate-600 dark:text-slate-300" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="font-bold text-[14px] text-ink dark:text-darkInk leading-tight">Recommend</span>
              <span className="text-[12px] text-slate-500 leading-tight">Recommend this work</span>
            </div>
          </button>
          
          <button onClick={() => paper?.authors?.[0] ? followAuthor(paper.authors[0].author_id).then(() => handleAction('Following author')).catch(error => handleAction(error instanceof Error ? error.message : 'Sign in to follow this author')) : handleAction('No author profile is linked')} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700 flex items-center justify-center transition">
              <BookOpen size={18} className="text-slate-600 dark:text-slate-300" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="font-bold text-[14px] text-ink dark:text-darkInk leading-tight">Follow</span>
              <span className="text-[12px] text-slate-500 leading-tight">Get updates</span>
            </div>
          </button>
          
          <button onClick={() => {
            if (navigator.share) {
              navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }} className="flex items-center gap-3 group">
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition dark:bg-darkPanel">
              <Share2 size={18} className="text-slate-600 dark:text-slate-300" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-bold text-[14px] text-ink dark:text-darkInk leading-tight">Share</span>
              <span className="text-[12px] text-slate-500 leading-tight">Share in a message</span>
            </div>
          </button>
        </div>
      </div>
      </>
      )}
      <ReviewMarketplaceModal
        paperTitle={paper?.title || ''}
        isOpen={showReviewMarketplace}
        onClose={() => setShowReviewMarketplace(false)}
      />
    </div>
  );
}
function AnalyticsView() {
  const [stats, setStats] = useState({ total_reads: 0, rg_score: 0, full_text_requests: 0, citations: 0 });

  useEffect(() => {
    getMyStats().then(result => {
      if (result?.data) {
        setStats({
          total_reads: result.data.total_reads || 0,
          rg_score: result.data.rg_score || 0,
          full_text_requests: result.data.full_text_requests || 0,
          citations: 0 // Mocked for now, if no citations available
        });
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {[
        ['Total Reads', stats.total_reads.toString(), 'Across all publications'],
        ['RG Score', stats.rg_score.toString(), 'Current ResearchGate Score'],
        ['Full-Text Requests', stats.full_text_requests.toString(), 'Pending or completed requests']
      ].map(([label, value, detail]) => (
        <section key={label} className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
          <p className="text-sm font-bold text-muted dark:text-darkMuted">{label}</p>
          <p className="mt-3 text-4xl font-black text-primary">{value}</p>
          <p className="mt-2 text-sm text-muted dark:text-darkMuted">{detail}</p>
        </section>
      ))}
      <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard md:col-span-3">
        <div className="grid h-72 place-items-end gap-3 border-b border-line px-4 dark:border-darkLine md:grid-cols-8">
          {/* Simple mock chart for now */}
          {[44, 72, 58, 86, 64, 92, 78, Math.max(10, Math.min(100, stats.rg_score))].map((height, index) => <div key={index} className="w-full rounded-t-lg bg-primary/80 transition-all duration-1000" style={{ height: `${height}%` }} />)}
        </div>
      </section>
    </div>
  );
}

function CollectionsView() {
  const [status, setStatus] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [papers, setPapers] = useState<any[]>([]);

  const loadCollections = () => {
    getCollections().then(res => {
      if (res?.data) setCollections(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      getCollectionPapers(selectedCollection).then(res => {
        if (res?.data) setPapers(res.data);
      }).catch(console.error);
    } else {
      setPapers([]);
    }
  }, [selectedCollection]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createCollection(String(form.get('name') || 'New Collection'), String(form.get('description') || ''));
      setStatus('Collection created');
      event.currentTarget.reset();
      loadCollections();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to create collection');
    }
  }

  if (selectedCollection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedCollection(null)} className="text-muted hover:text-primary"><ArrowLeft size={20} /></button>
            <h2 className="text-2xl font-black">{selectedCollection}</h2>
          </div>
          <span className="text-sm font-bold text-muted">{papers.length} papers</span>
        </div>
        <div className="grid gap-5">
          {papers.length > 0 ? papers.map(paper => (
            <PaperCard key={paper.paper_id || paper.saved_id} paper={paper} />
          )) : (
            <p className="text-muted text-center py-10 border border-dashed border-line rounded-lg">No papers in this collection yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard" onSubmit={create}>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input name="name" className="rounded-lg border border-line bg-slate-50 px-3 py-2 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Collection name" />
          <input name="description" className="rounded-lg border border-line bg-slate-50 px-3 py-2 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Description" />
          <Button type="submit"><Plus size={16} /> Create</Button>
        </div>
        {status && <p className="mt-3 text-sm font-bold text-primary">{status}</p>}
      </form>
      
      <div className="grid gap-5 md:grid-cols-3">
        {collections.map(col => (
          <button key={col.name} onClick={() => setSelectedCollection(col.name)} className="text-left rounded-soft border border-line bg-paper p-5 shadow-stitch transition hover:border-primary dark:border-darkLine dark:bg-darkCard">
            <span className="grid size-12 place-items-center rounded-lg bg-primarySoft text-primary dark:bg-primary/15"><Folder /></span>
            <h3 className="mt-5 font-black truncate">{col.name}</h3>
            <p className="mt-2 text-sm text-muted dark:text-darkMuted truncate">{col.description || 'No description'}</p>
          </button>
        ))}
        {collections.length === 0 && <p className="text-muted col-span-3">No collections found.</p>}
      </div>
    </div>
  );
}

function NotificationsView() {
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const loadUpdates = useCallback(() => { getUpdates().then(result => setItems(result.data || [])).catch(() => undefined); }, []);
  useEffect(() => { loadUpdates(); const timer = window.setInterval(loadUpdates, 30000); return () => window.clearInterval(timer); }, [loadUpdates]);

  async function markRead(eventId: number) {
    if (!eventId) return;
    try {
      await markUpdateRead(eventId);
      setItems(items.map(item => item.event_id === eventId ? { ...item, is_read: 1 } : item));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to update notification');
    }
  }

  async function markAll() { try { await markAllUpdatesRead(); setItems(items.map(item => ({ ...item, is_read: 1 }))); setStatus('All updates marked as read'); } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to update notifications'); } }

  if (items.length === 0) {
    return <div className="space-y-4"><div className="flex justify-end"><Button type="button" variant="secondary" onClick={markAll}>Mark all read</Button></div><div className="rounded-soft border border-dashed border-line bg-paper p-8 text-center text-muted dark:border-darkLine dark:bg-darkCard"><p>You currently have no new updates</p></div></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button type="button" variant="secondary" onClick={markAll}>Mark all read</Button></div>
      {items.map((item, index) => (
        <section key={item.event_id || index} className={`flex items-start justify-between gap-4 rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard ${item.is_read ? 'opacity-60' : ''}`}>
          <div className="flex gap-4">
            <span className="grid size-11 place-items-center rounded-full bg-primarySoft text-primary dark:bg-primary/15"><Bell size={18} /></span>
            <div>
              <h2 className="font-black">{item.title || 'Update'}</h2>
              {item.body ? <p className="mt-1 text-sm text-muted dark:text-darkMuted">{item.body}</p> : null}
              <p className="mt-1 text-sm text-muted dark:text-darkMuted">
                {item.created_at ? new Date(item.created_at).toLocaleString() : (index === 0 ? 'Recently' : 'Earlier')}
              </p>
            </div>
          </div>
          {!item.is_read && (
            <Button type="button" variant="secondary" onClick={() => markRead(item.event_id)}>Mark read</Button>
          )}
        </section>
      ))}
      {status ? <p className="text-sm font-bold text-primary">{status}</p> : null}
    </div>
  );
}

function RequestsView() {
  const [status, setStatus] = useState('');
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [researchers, setResearchers] = useState<PublicResearcherProfile[]>([]);

  const loadRequests = () => {
    getResearchRequests().then(res => setSentRequests(res?.data || [])).catch(console.error);
    getReceivedRequests().then(res => setReceivedRequests(res?.data || [])).catch(console.error);
  };

  useEffect(() => {
    loadRequests();
    getResearchers(100, 0).then(setResearchers).catch(() => undefined);
  }, []);

  async function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createResearchRequest({
        title: String(form.get('title') || ''),
        recipient_user_id: Number(form.get('recipient_user_id') || 0),
        request_type: String(form.get('request_type') || 'other'),
        message: String(form.get('message') || '')
      });
      setStatus('Request sent successfully');
      event.currentTarget.reset();
      loadRequests();
      setActiveTab('sent');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to send request');
    }
  }

  async function handleStatusUpdate(id: number, newStatus: 'approved' | 'declined' | 'cancelled') {
    try {
      await updateRequestStatus(id, newStatus);
      loadRequests();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <form className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard" onSubmit={sendRequest}>
        <div className="grid gap-4">
          <input name="title" className="rounded-lg border border-line bg-slate-50 px-3 py-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Request title (e.g. Full-text request for 'Attention Is All You Need')" />
          <div className="grid gap-4 md:grid-cols-2"><select name="recipient_user_id" required className="min-w-0 rounded-lg border border-line bg-slate-50 px-3 py-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel"><option value="">Select a researcher</option>{researchers.map(researcher => <option key={researcher.user_id} value={researcher.user_id}>{researcher.full_name || researcher.username}{researcher.affiliation ? ` · ${researcher.affiliation}` : ''}</option>)}</select><select name="request_type" defaultValue="other" className="min-w-0 rounded-lg border border-line bg-slate-50 px-3 py-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel"><option value="full_text">Full-text request</option><option value="collaboration">Collaboration</option><option value="introduction">Introduction</option><option value="dataset">Dataset or material</option><option value="other">Other</option></select></div>
          <textarea name="message" className="min-h-36 rounded-lg border border-line bg-slate-50 px-3 py-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Message" />
          <Button type="submit"><Send size={16} /> Send request</Button>
          {status && <p className="text-sm font-bold text-primary">{status}</p>}
        </div>
      </form>

      <div className="flex gap-4 border-b border-line dark:border-darkLine">
        <button className={`pb-2 font-bold ${activeTab === 'received' ? 'border-b-2 border-primary text-primary' : 'text-muted hover:text-ink dark:hover:text-darkInk'}`} onClick={() => setActiveTab('received')}>
          Received Requests
        </button>
        <button className={`pb-2 font-bold ${activeTab === 'sent' ? 'border-b-2 border-primary text-primary' : 'text-muted hover:text-ink dark:hover:text-darkInk'}`} onClick={() => setActiveTab('sent')}>
          Sent Requests
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'sent' ? (
          sentRequests.length > 0 ? sentRequests.map(req => (
            <div key={req.request_id} className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg">{req.title}</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">{req.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">To: {req.recipient_full_name || req.recipient_name}</p>
              <p className="mt-2 text-sm text-muted line-clamp-2">{req.message}</p>
              {req.status === 'pending' && <Button type="button" variant="secondary" className="mt-3" onClick={() => handleStatusUpdate(req.request_id, 'cancelled')}>Cancel request</Button>}
              {req.status === 'approved' && <div className="mt-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">Your request was approved. The author can now share the full text through ResearchHub messages.</div>}
            </div>
          )) : <p className="text-muted text-center py-5">No sent requests.</p>
        ) : (
          receivedRequests.length > 0 ? receivedRequests.map(req => (
            <div key={req.request_id} className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg">{req.title}</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">{req.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">From: {req.sender_full_name || `User ${req.user_id}`}</p>
              <p className="mt-2 text-sm text-muted">{req.message}</p>
              
              {req.status === 'pending' && (
                <div className="mt-4 flex gap-3">
                  <Button type="button" onClick={() => handleStatusUpdate(req.request_id, 'approved')} className="bg-green-600 hover:bg-green-700">Approve & Send PDF</Button>
                  <Button type="button" onClick={() => handleStatusUpdate(req.request_id, 'declined')} variant="secondary">Decline</Button>
                </div>
              )}
            </div>
          )) : <p className="text-muted text-center py-5">No received requests.</p>
        )}
      </div>
    </div>
  );
}

function AuthPanel({ kind }: { kind: 'login' | 'signup' }) {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [forgot, setForgot] = useState(false);

  async function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await forgotPassword(String(form.get('email') || ''));
      setStatus('If that email exists, reset instructions have been sent.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to request a password reset');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get('username') || '');
    const password = String(form.get('password') || '');
    const fullName = String(form.get('full_name') || username);
    try {
      if (kind === 'login') {
        await login(username, password);
        router.replace('/feed');
      } else {
        await register({ username, email: String(form.get('email') || ''), password, full_name: fullName });
        router.replace('/feed');
      }
      setStatus(kind === 'login' ? 'Signed in' : 'Account created');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Authentication failed');
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-soft border border-line bg-paper p-8 shadow-glow dark:border-darkLine dark:bg-darkCard">
      {forgot ? (
        <form className="space-y-4" onSubmit={handleForgot}>
          <h2 className="text-xl font-black">Reset your password</h2>
          <input name="email" type="email" required className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Account email" />
          <Button className="w-full" type="submit">Send reset link</Button>
          <button type="button" className="text-sm font-bold text-primary" onClick={() => setForgot(false)}>Back to sign in</button>
          {status ? <p className="text-sm font-bold text-primary" role="status">{status}</p> : null}
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {kind === 'signup' ? <input name="full_name" required className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Full name" /> : null}
          {kind === 'signup' ? <input name="email" type="email" required className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Email address" /> : null}
          <input name="username" required className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Username or email" />
          <input name="password" required minLength={8} type="password" className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Password" />
          <Button className="w-full" type="submit">{kind === 'login' ? <Lock size={16} /> : <UserPlus size={16} />}{kind === 'login' ? 'Sign in' : 'Create account'}</Button>
          {kind === 'login' ? <button type="button" className="text-sm font-bold text-primary" onClick={() => setForgot(true)}>Forgot password?</button> : null}
          {kind === 'login' ? (
            <p className="mt-4 text-center text-sm text-slate-500">
              Don't have an account? <Link href="/signup" className="font-bold text-primary hover:underline">Sign up</Link>
            </p>
          ) : (
            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account? <Link href="/login" className="font-bold text-primary hover:underline">Sign in</Link>
            </p>
          )}
          {status ? <p className="text-sm font-bold text-primary" role="status">{status}</p> : null}
        </form>
      )}
    </div>
  );
}


function CitationPanel() {
  const [paperId, setPaperId] = useState(1);
  const [format, setFormat] = useState<'bib' | 'txt'>('bib');
  const [citation, setCitation] = useState('');
  const [showBatchExport, setShowBatchExport] = useState(false);
  const [showBibtexCleaner, setShowBibtexCleaner] = useState(false);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await exportCitation(paperId, format);
      const text = result?.data?.citation || result?.citation || `ResearchHub Citation for Paper ${paperId}.`;
      setCitation(text);
      await navigator.clipboard.writeText(text);
    } catch {
      const text = `ResearchHub Citation for Paper ${paperId}.`;
      setCitation(text);
    }
  }

  return (
    <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-line dark:border-darkLine">
        <h3 className="font-bold text-sm text-ink dark:text-white">Citation Exporter & Bibliography Tools</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBibtexCleaner(true)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-darkPanel text-slate-800 dark:text-slate-200 border border-line dark:border-darkLine rounded text-xs font-bold hover:bg-slate-200 transition"
          >
            🧹 Clean BibTeX Syntax
          </button>
          <button
            onClick={() => setShowBatchExport(true)}
            className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark transition"
          >
            + Batch Bibliography Exporter (.bib / .ris)
          </button>
        </div>
      </div>

      <form className="grid gap-4 md:grid-cols-[1fr_12rem_auto]" onSubmit={generate}>
        <input type="number" min="1" value={paperId} onChange={event => setPaperId(Number(event.target.value))} className="h-12 rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" />
        <select value={format} onChange={event => setFormat(event.target.value as 'bib' | 'txt')} className="h-12 rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel">
          <option value="bib">BibTeX</option>
          <option value="txt">Text</option>
        </select>
        <Button type="submit"><Quote size={16} /> Export</Button>
      </form>
      <pre className="mt-5 overflow-auto rounded-lg bg-slate-950 p-4 text-sm leading-6 text-blue-100">{citation || 'Citation output will appear here and copy to clipboard.'}</pre>
      <LibraryExportWidget />
      <BatchCitationExportModal isOpen={showBatchExport} onClose={() => setShowBatchExport(false)} />
      <BibtexNormalizerModal isOpen={showBibtexCleaner} onClose={() => setShowBibtexCleaner(false)} />
    </section>
  );
}

function Stats() {
  const [stats, setStats] = useState({ saved_papers: 0, following: 0, followers: 0, reviews: 0, questions: 0, answers: 0, rg_score: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMyStats().then(result => {
      if (result?.data) {
        setStats({
          saved_papers: result.data.saved_papers ?? 0,
          following: result.data.following ?? 0,
          followers: result.data.followers ?? 0,
          reviews: result.data.reviews ?? 0,
          questions: result.data.questions ?? 0,
          answers: result.data.answers ?? 0,
          rg_score: result.data.rg_score ?? 0
        });
        setLoaded(true);
      }
    }).catch(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-5 md:grid-cols-4">
      <StatCard label="Papers Saved" value={loaded ? String(stats.saved_papers) : '...'} icon={<BookOpen />} tone="blue" />
      <StatCard label="Following" value={loaded ? String(stats.following) : '...'} icon={<UserPlus />} tone="green" />
      <StatCard label="Followers" value={loaded ? String(stats.followers) : '...'} icon={<Sparkles />} tone="violet" />
      <StatCard label="Q&A Posts" value={loaded ? String((stats.questions || 0) + (stats.answers || 0)) : '...'} icon={<MessageSquare />} tone="blue" />
      </div>
      <p className="text-sm font-bold text-primary">Research Interest Score: {loaded ? stats.rg_score : '...'}</p>
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: string; icon: ReactNode; tone: 'blue' | 'green' | 'violet' }) {
  const tones = {
    blue: 'bg-primarySoft text-primary dark:bg-primary/15',
    green: 'bg-green-50 text-success dark:bg-success/15',
    violet: 'bg-violet-50 text-violet dark:bg-violet/15'
  };
  return (
    <section className="flex items-center justify-between rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
      <div>
        <p className="text-sm font-medium text-muted dark:text-darkMuted">{label}</p>
        <p className="mt-1 text-4xl font-black">{value}</p>
      </div>
      <span className={`grid size-12 place-items-center rounded-lg ${tones[tone]}`}>{icon}</span>
    </section>
  );
}

function ActivityColumn() {
  return (
    <aside className="space-y-6">
      <TrendingFields />
      <section className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard">
        <h2 className="text-xl font-black">Following Activity</h2>
        <div className="mt-5 space-y-5">
          {['Dr. Elena Rodriguez published a new paper', 'Prof. Kenji Sato recommended your paper', 'AI Safety Group added 5 new discussions'].map(item => (
            <Link key={item} href="/notifications" className="flex gap-3 text-sm leading-6 transition hover:text-primary">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-primary dark:bg-darkPanel"><Bell size={16} /></span>
              <span>{item}</span>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}

function TrendingFields() {
  const [fields, setFields] = useState<{ field_name: string; paper_count: number }[]>([]);

  useEffect(() => {
    getTrendingFields().then(setFields).catch(() => {});
  }, []);

  return (
    <div className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard">
      <h2 className="font-black">Trending Fields</h2>
      <p className="mb-4 mt-1 text-xs text-muted dark:text-darkMuted">Popular research areas this month</p>
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.field_name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 text-white shadow-sm">
                <Sparkles className="size-3.5" />
              </span>
              <p className="text-sm font-bold">{field.field_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted dark:text-darkMuted">{field.paper_count}</span>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectionsGrid() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black">Saved Collections</h2>
        <Link href="/collections" className="text-sm font-bold text-primary hover:underline">Create Collection</Link>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {['Deep Learning Research', 'Graphene Synthesis', 'Cognitive Bias Studies'].map((name, index) => (
          <Link key={name} href="/collections" className="rounded-soft border border-line bg-paper p-5 shadow-stitch transition hover:border-primary dark:border-darkLine dark:bg-darkCard">
            <span className="grid size-12 place-items-center rounded-lg bg-primarySoft text-primary dark:bg-primary/15"><Folder /></span>
            <h3 className="mt-5 font-black">{name}</h3>
            <p className="mt-2 text-sm text-muted dark:text-darkMuted">{[42, 18, 89][index]} papers • {index === 1 ? 'Private' : `${index + 3} collaborators`}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FilterPanel({ selectedFields, onFieldsChange, activeTab }: { selectedFields: string[]; onFieldsChange: (fields: string[]) => void; activeTab?: string }) {
  if (activeTab !== 'Publications') {
    return (
      <aside className="hidden md:block">
        <div className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine p-5">
          <h3 className="font-bold text-[15px] text-ink dark:text-darkInk border-b border-line pb-3 mb-3">Filters</h3>
          <p className="text-sm text-slate-500">No filters available for {activeTab}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:block space-y-4">
      <div className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine">
        <h3 className="font-bold text-[15px] text-ink dark:text-darkInk border-b border-line p-4 dark:border-darkLine">Publication type</h3>
        <div className="p-4 flex flex-col gap-3">
          {[
            { id: 'article', label: 'Article', count: 1245 },
            { id: 'preprint', label: 'Preprint', count: 342 },
            { id: 'chapter', label: 'Chapter', count: 89 },
            { id: 'conference', label: 'Conference Paper', count: 456 }
          ].map(field => (
            <label key={field.id} className="group flex cursor-pointer items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="relative flex size-5 shrink-0 items-center justify-center rounded border border-line bg-white transition group-hover:border-primary dark:border-darkLine dark:bg-darkPanel">
                  <input type="checkbox" className="peer absolute h-full w-full cursor-pointer opacity-0" checked={selectedFields.includes(field.id)} onChange={e => {
                    if (e.target.checked) onFieldsChange([...selectedFields, field.id]);
                    else onFieldsChange(selectedFields.filter(f => f !== field.id));
                  }} />
                  <svg className="pointer-events-none hidden size-3.5 text-primary peer-checked:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-[14px] leading-tight text-slate-700 transition group-hover:text-primary dark:text-slate-300">{field.label}</span>
              </div>
              <span className="text-xs text-slate-400">{field.count}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="bg-white border border-line rounded-sm shadow-sm dark:bg-darkCard dark:border-darkLine">
        <h3 className="font-bold text-[15px] text-ink dark:text-darkInk border-b border-line p-4 dark:border-darkLine">Date</h3>
        <div className="p-4 flex flex-col gap-3">
          {[
            { id: 'any', label: 'Any time' },
            { id: '2024', label: 'Since 2024' },
            { id: '2023', label: 'Since 2023' },
            { id: '2020', label: 'Since 2020' }
          ].map(field => (
            <label key={field.id} className="group flex cursor-pointer items-start gap-3">
              <input type="radio" name="date_filter" defaultChecked={field.id === 'any'} className="mt-0.5" />
              <span className="text-[14px] leading-tight text-slate-700 transition group-hover:text-primary dark:text-slate-300">{field.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-40 flex-1 rounded-soft bg-slate-100 p-5 text-center dark:bg-darkCard">
      <p className="text-2xl font-black text-primary">{value}</p>
      <p className="text-xs font-black uppercase tracking-widest text-muted dark:text-darkMuted">{label}</p>
    </div>
  );
}

function AuthorCard() {
  const [following, setFollowing] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    isFollowingAuthor(1).then(result => setFollowing(result?.data?.is_following ?? false)).catch(() => undefined);
  }, []);

  async function toggleFollow() {
    try {
      if (following) {
        await unfollowAuthor(1);
        setFollowing(false);
        setStatus('Unfollowed');
      } else {
        await followAuthor(1);
        setFollowing(true);
        setStatus('Following');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to update follow status');
    }
  }

  return (
    <section className="rounded-soft border border-line bg-paper p-5 text-center shadow-stitch dark:border-darkLine dark:bg-darkCard">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-slate-900 to-primary text-xl font-black text-white">SC</span>
      <h2 className="mt-4 text-xl font-black">Dr. Sarah Connor</h2>
      <p className="text-sm text-muted dark:text-darkMuted">Lead Researcher, CSAIL</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric value="4.2k" label="Citations" />
        <Metric value="128" label="Papers" />
      </div>
      <Button className="mt-5 w-full" type="button" onClick={toggleFollow}>{following ? 'Following' : 'Follow'}</Button>
      <Link href="/profile" className="mt-3 inline-flex w-full justify-center rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:border-primary hover:text-primary dark:border-darkLine">View Profile</Link>
      {status ? <p className="mt-3 text-sm font-bold text-primary">{status}</p> : null}
    </section>
  );
}

function DiscussionBox({ paperId = 1 }: { paperId?: number }) {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    getPaperReviews(paperId).then(result => {
      if (Array.isArray(result?.data)) setReviews(result.data as ReviewSummary[]);
    }).catch(() => undefined);
  }, [paperId]);

  async function postReview(event: React.FormEvent) {
    event.preventDefault();
    if (!reviewText.trim()) { setStatus('Write a comment first'); return; }
    try {
      const result = await createReview(paperId, rating, reviewText.trim());
      if (result.success) {
        const updated = await getPaperReviews(paperId);
        if (Array.isArray(updated?.data)) setReviews(updated.data);
        setStatus('Review posted');
        setReviewText('');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to post review');
    }
  }

  return (
    <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
      <h2 className="flex items-center gap-2 text-2xl font-black"><MailPlus className="text-primary" /> Discussion & Reviews</h2>
      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-muted dark:bg-darkPanel dark:text-darkMuted">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          reviews.map((item, index) => (
            <div key={item.review_id ?? index} className="rounded-lg bg-slate-50 p-4 text-sm leading-6 dark:bg-darkPanel">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-ink dark:text-darkInk">{item.full_name || item.username}</span>
                <span className="text-xs text-muted dark:text-darkMuted">{'★'.repeat(Math.max(0, Math.min(item.rating ?? 0, 5)))}{'☆'.repeat(5 - Math.max(0, Math.min(item.rating ?? 0, 5)))}</span>
              </div>
              <p className="text-muted dark:text-darkMuted">{item.review_text}</p>
            </div>
          ))
        )}
      </div>
      <form className="mt-5 space-y-3" onSubmit={postReview}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted dark:text-darkMuted">Rating:</span>
          <select value={rating} onChange={e => setRating(Number(e.target.value))} className="rounded-lg border border-line bg-slate-50 px-2 py-1 text-sm outline-none dark:border-darkLine dark:bg-darkPanel">
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}★</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <input value={reviewText} onChange={e => setReviewText(e.target.value)} className="h-12 flex-1 rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" placeholder="Share your review..." />
          <Button type="submit">Post</Button>
        </div>
      </form>
      {status ? <p className="mt-3 text-sm font-bold text-primary">{status}</p> : null}
    </section>
  );
}

interface JobMock { id: string; title: string; institution: string; location: string; salaryMin?: number; salaryMax?: number; isEarlyApplicant: boolean; isNew: boolean; logoUrl: string; isBookmarked?: boolean; }
interface FilterMock { name: string; count: number; }

export function JobsView() {
  const [jobs, setJobs] = useState<JobMock[]>([]);
  const [filters, setFilters] = useState<{countries: FilterMock[], disciplines: FilterMock[], employmentTypes: FilterMock[], remoteModes: FilterMock[], careerLevels: FilterMock[]}>({ countries: [], disciplines: [], employmentTypes: [], remoteModes: [], careerLevels: [] });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [employmentType, setEmploymentType] = useState('');
  const [remoteMode, setRemoteMode] = useState('');
  const [careerLevel, setCareerLevel] = useState('');
  const [sort, setSort] = useState('newest');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [minSalary, setMinSalary] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('q') || '');
    setCountry(params.get('location') || '');
    setDiscipline(params.get('discipline') || '');
    setSelectedCountries((params.get('country') || '').split(',').filter(Boolean));
    setSelectedDisciplines((params.get('disciplines') || '').split(',').filter(Boolean));
    setEmploymentType(params.get('employment_type') || ''); setRemoteMode(params.get('remote_mode') || ''); setCareerLevel(params.get('career_level') || ''); setSort(params.get('sort') || 'newest');
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getJobs(query, country, discipline, 1, 20, { country: selectedCountries, disciplines: selectedDisciplines, employment_type: employmentType, remote_mode: remoteMode, career_level: careerLevel, sort });
      setJobs((response.data || []).map((job: any, idx: number) => ({
        id: String(job.job_id || job.JOB_ID),
        title: job.title || job.TITLE || '',
        institution: job.employer || job.EMPLOYER || job.posted_by_name || '',
        location: job.location || job.LOCATION || '',
        salaryMin: job.salary_min || (85000 + (idx % 4) * 20000),
        salaryMax: job.salary_max || (130000 + (idx % 4) * 25000),
        isEarlyApplicant: !!(job.is_early_applicant || job.IS_EARLY_APPLICANT),
        isNew: !!(job.is_new || job.IS_NEW),
        logoUrl: job.logo_url || job.LOGO_URL || `https://api.dicebear.com/7.x/initials/svg?seed=${job.employer || 'U'}`,
        isBookmarked: Boolean(job.is_bookmarked || job.IS_BOOKMARKED)
      })));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [query, country, discipline, selectedCountries, selectedDisciplines, employmentType, remoteMode, careerLevel, sort]);

  useEffect(() => {
    async function loadData() {
      try {
        const filtersResponse = await getJobFilters();
        if (filtersResponse) {
          setFilters({
            countries: (filtersResponse.countries || []).map((f: any) => ({ name: f.name || f.NAME || '', count: f.count || f.COUNT || 0 })),
            disciplines: (filtersResponse.disciplines || []).map((f: any) => ({ name: f.name || f.NAME || '', count: f.count || f.COUNT || 0 })),
            employmentTypes: (filtersResponse.employment_types || []).map((f: any) => ({ name: f.name || f.NAME || '', count: f.count || f.COUNT || 0 })),
            remoteModes: (filtersResponse.remote_modes || []).map((f: any) => ({ name: f.name || f.NAME || '', count: f.count || f.COUNT || 0 })),
            careerLevels: (filtersResponse.career_levels || []).map((f: any) => ({ name: f.name || f.NAME || '', count: f.count || f.COUNT || 0 }))
          });
        }
      } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Failed to load job filters'); }
    }
    loadData();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadJobs(); }, 250);
    return () => window.clearTimeout(timer);
  }, [loadJobs]);

  const toggle = (list: string[], val: string, setter: (next: string[]) => void) => {
    if (list.includes(val)) setter(list.filter(item => item !== val));
    else setter([...list, val]);
  };

  const clearFilters = () => {
    setQuery(''); setCountry(''); setDiscipline(''); setSelectedCountries([]); setSelectedDisciplines([]); setEmploymentType(''); setRemoteMode(''); setCareerLevel(''); setMinSalary(0);
  };

  const handleBookmark = async (id: string, currentlyBookmarked: boolean) => {
    const result = await toggleJobBookmark(id);
    return result?.data?.saved ?? !currentlyBookmarked;
  };

  const filteredJobs = jobs.filter(j => !minSalary || (j.salaryMin && j.salaryMin >= minSalary));

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query); if (country) params.set('location', country); if (discipline) params.set('discipline', discipline); if (selectedCountries.length) params.set('country', selectedCountries.join(',')); if (selectedDisciplines.length) params.set('disciplines', selectedDisciplines.join(',')); if (employmentType) params.set('employment_type', employmentType); if (remoteMode) params.set('remote_mode', remoteMode); if (careerLevel) params.set('career_level', careerLevel); if (sort !== 'newest') params.set('sort', sort);
    window.history.replaceState(null, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
  }, [query, country, discipline, selectedCountries, selectedDisciplines, employmentType, remoteMode, careerLevel, sort]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Academic & Research Jobs</h1>
      <p className="text-gray-600 dark:text-slate-300 mb-6">Discover postdoctoral, tenure-track, and industry research opportunities worldwide.</p>
      
      <JobSearchBar query={query} country={country} discipline={discipline} onQueryChange={setQuery} onCountryChange={setCountry} onDisciplineChange={setDiscipline} countries={filters.countries} disciplines={filters.disciplines} />

      {error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="w-full lg:w-2/3">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-sm w-full dark:bg-darkCard"></div>)}
            </div>
          ) : filteredJobs.length ? (
            filteredJobs.map(job => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                institution={job.institution}
                location={job.location}
                salaryMin={job.salaryMin}
                salaryMax={job.salaryMax}
                currency={currency}
                isEarlyApplicant={job.isEarlyApplicant}
                isNew={job.isNew}
                logoUrl={job.logoUrl}
                isBookmarked={job.isBookmarked}
                onBookmark={handleBookmark}
              />
            ))) : <p className="rounded-soft border border-dashed border-line bg-paper p-8 text-center text-sm text-muted dark:border-darkLine dark:bg-darkCard">No jobs match these filters.</p>}
        </div>
        <div className="w-full lg:w-1/3">
          <JobSidebar
            countries={filters.countries}
            disciplines={filters.disciplines}
            employmentTypes={filters.employmentTypes}
            remoteModes={filters.remoteModes}
            careerLevels={filters.careerLevels}
            selectedCountries={selectedCountries}
            selectedDisciplines={selectedDisciplines}
            employmentType={employmentType}
            remoteMode={remoteMode}
            careerLevel={careerLevel}
            currency={currency}
            minSalary={minSalary}
            onCurrencyChange={setCurrency}
            onMinSalaryChange={setMinSalary}
            onCountryToggle={value => toggle(selectedCountries, value, setSelectedCountries)}
            onDisciplineToggle={value => toggle(selectedDisciplines, value, setSelectedDisciplines)}
            onEmploymentTypeChange={setEmploymentType}
            onRemoteModeChange={setRemoteMode}
            onCareerLevelChange={setCareerLevel}
            onClear={clearFilters}
          />
        </div>
      </div>
    </div>
  );
}
type ThemeChoice = 'light' | 'dark' | 'system';
const tabs = [['Appearance', Palette], ['Notifications', Bell], ['Privacy', Lock]] as const;

export function SettingsView({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<ThemeChoice>('system');
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number][0]>('Appearance');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem('researchhub_theme') as ThemeChoice | null;
    const initial = stored || 'system';
    setTheme(initial);
    getSettings()
      .then(result => {
        const nextTheme = result?.data?.theme as ThemeChoice | undefined;
        if (nextTheme) {
          setTheme(nextTheme);
          window.localStorage.setItem('researchhub_theme', nextTheme);
        }
      })
      .catch(() => undefined);
  }, []);

  async function chooseTheme(nextTheme: ThemeChoice) {
    setTheme(nextTheme);
    window.localStorage.setItem('researchhub_theme', nextTheme);
    try {
      await updateSettings({ theme: nextTheme, email_notifications: true, paper_recommendations: true, profile_visibility: 'public' });
      setStatus('Settings saved');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save settings');
    }
  }

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await updateSettings({
        theme,
        email_notifications: form.get('email_notifications') === 'on',
        paper_recommendations: form.get('paper_recommendations') === 'on',
        profile_visibility: String(form.get('profile_visibility') || 'public')
      });
      setStatus('Preferences updated');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save preferences');
    }
  }

  return (
    <section className={clsx('rounded-soft border border-line bg-paper shadow-stitch dark:border-darkLine dark:bg-darkCard', compact ? 'p-5' : 'p-6')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={clsx('font-black text-ink dark:text-darkInk', compact ? 'text-lg' : 'text-2xl')}>Settings</h2>
          <p className="mt-1 text-sm leading-6 text-muted dark:text-darkMuted">Appearance, alerts, privacy, and library preferences.</p>
        </div>
      </div>
      {!compact ? (
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {tabs.map(([label, Icon]) => (
            <button key={label as string} className={clsx('flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold transition', activeTab === label ? 'border-primary bg-primary text-white' : 'border-line text-muted hover:border-primary hover:text-primary dark:border-darkLine dark:text-darkMuted')} type="button" onClick={() => setActiveTab(label as any)}>
              <Icon size={17} />{label as string}
            </button>
          ))}
        </div>
      ) : null}
      <form className="mt-5 space-y-5" onSubmit={savePreferences}>
        {(activeTab === 'Appearance' || compact) ? (
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted dark:text-darkMuted">Theme</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map(option => (
                <button key={option} type="button" className={clsx('rounded-lg border px-3 py-2 text-sm font-bold capitalize transition', theme === option ? 'border-primary bg-primary text-white' : 'border-line bg-slate-50 text-muted hover:text-primary dark:border-darkLine dark:bg-darkPanel dark:text-darkMuted')} onClick={() => chooseTheme(option)}>
                  {option === 'dark' ? <Moon className="mx-auto mb-1 size-4" /> : <Sun className="mx-auto mb-1 size-4" />}
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {(activeTab === 'Notifications' || compact) ? (
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 text-sm font-semibold dark:border-darkLine">
              Email notifications <input name="email_notifications" type="checkbox" defaultChecked className="size-4 accent-primary" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 text-sm font-semibold dark:border-darkLine">
              Paper recommendations <input name="paper_recommendations" type="checkbox" defaultChecked className="size-4 accent-primary" />
            </label>
          </div>
        ) : null}
        {activeTab === 'Privacy' ? (
          <label className="block">
            <span className="text-xs font-black uppercase tracking-widest text-muted dark:text-darkMuted">Profile visibility</span>
            <select name="profile_visibility" className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel">
              <option value="public">Public</option><option value="followers">Followers only</option><option value="private">Private</option>
            </select>
          </label>
        ) : null}
        {!compact ? <Button type="submit">Save preferences</Button> : null}
        {status ? <p className="text-sm font-bold text-primary">{status}</p> : null}
      </form>
    </section>
  );
}


const RESEARCH_TYPES = [
  { id: 'article', name: 'Article', desc: 'A peer-reviewed publication.', icon: <FileText size={24} className="text-blue-500" /> },
  { id: 'preprint', name: 'Preprint', desc: 'Draft or early version.', icon: <BookOpen size={24} className="text-green-500" /> },
  { id: 'conference', name: 'Conference Paper', desc: 'Presented at a conference.', icon: <Presentation size={24} className="text-orange-500" /> },
  { id: 'data', name: 'Data', desc: 'Dataset, spreadsheet, or raw data.', icon: <Database size={24} className="text-purple-500" /> },
];

export function SubmitView() {
  const [step, setStep] = useState(1);
  const [researchType, setResearchType] = useState('article');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [doi, setDoi] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [language, setLanguage] = useState('English');
  const [isPeerReviewed, setIsPeerReviewed] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [authorsText, setAuthorsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const userChangedDraft = useRef(false);

  useEffect(() => {
    let localDraft: Record<string, any> = {};
    try {
      localDraft = JSON.parse(window.localStorage.getItem('researchhub_submit_draft') || '{}');
    } catch { localDraft = {}; }
    if (localDraft.title) setTitle(localDraft.title);
    if (localDraft.abstract) setAbstract(localDraft.abstract);
    if (localDraft.doi) setDoi(localDraft.doi);
    if (localDraft.authorsText) setAuthorsText(localDraft.authorsText);
    if (localDraft.date) setDate(localDraft.date);
    if (localDraft.researchType) setResearchType(localDraft.researchType);
    if (localDraft.visibility) setVisibility(localDraft.visibility);
    if (localDraft.step && Number(localDraft.step) < 4) setStep(Number(localDraft.step));
    void loadSubmitDraft().then(draft => {
      if (!draft || userChangedDraft.current) return;
      if (draft.title) setTitle(draft.title);
      if (draft.abstract) setAbstract(draft.abstract);
      if (draft.doi) setDoi(draft.doi);
      if (draft.authorsText) setAuthorsText(draft.authorsText);
      if (draft.date) setDate(draft.date);
      if (draft.language) setLanguage(draft.language);
      if (draft.researchType) setResearchType(draft.researchType);
      if (typeof draft.isPeerReviewed === 'boolean') setIsPeerReviewed(draft.isPeerReviewed);
      if (draft.visibility) setVisibility(draft.visibility);
      if (draft.step && Number(draft.step) < 4) setStep(Number(draft.step));
      if (draft.pdf) setFile(draftFileToFile(draft.pdf));
      if (draft.coverImage) setCoverImage(draftFileToFile(draft.coverImage));
    });
  }, []);

  useEffect(() => {
    if (step >= 4) return;
    const draft = { title, abstract, doi, authorsText, date, language, researchType, isPeerReviewed, visibility, step };
    window.localStorage.setItem('researchhub_submit_draft', JSON.stringify(draft));
    void updateSubmitDraft(draft);
  }, [title, abstract, doi, authorsText, date, language, researchType, isPeerReviewed, visibility, step]);


  function chooseCover(nextFile: File | null) {
    if (!nextFile) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(nextFile.type)) { setError('Cover image must be JPG, PNG, or WebP.'); return; }
    if (nextFile.size > 10 * 1024 * 1024) { setError('Cover image must be 10 MB or smaller.'); return; }
    userChangedDraft.current = true;
    setError(''); setCoverImage(nextFile);
    void fileToDraftFile(nextFile).then(snapshot => updateSubmitDraft({ coverImage: snapshot }));
  }

  function choosePdf(nextFile: File | null) {
    if (!nextFile) return;
    if (nextFile.type !== 'application/pdf' && !nextFile.name.toLowerCase().endsWith('.pdf')) { setError('Research file must be a PDF.'); return; }
    userChangedDraft.current = true;
    setError(''); setFile(nextFile);
    void fileToDraftFile(nextFile).then(snapshot => updateSubmitDraft({ pdf: snapshot }));
  }

  const handleNext = () => { userChangedDraft.current = true; setStep(s => s + 1); };
  const handleBack = () => { userChangedDraft.current = true; setStep(s => s - 1); };
  
  const handleReset = () => {
    setStep(1);
    setResearchType('article');
    setFile(null);
    setTitle('');
    setAbstract('');
    setDoi('');
    setCoverImage(null);
    setDate(new Date().toISOString().slice(0, 10));
    setLanguage('English');
    setIsPeerReviewed(false);
    setVisibility('public');
    setAuthorsText('');
    userChangedDraft.current = true;
    window.localStorage.removeItem('researchhub_submit_draft');
    void clearSubmitDraft();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); setError('');
    try {
      const authors = authorsText.split('\n').map(full_name => full_name.trim()).filter(Boolean).map((full_name, index) => ({ full_name, author_order: index + 1 }));
      const result = await submitResearch({
        title,
        abstract,
        doi,
        publication_date: date,
        language,
        is_peer_reviewed: isPeerReviewed,
        publication_type: researchType,
        visibility,
        status: 'published',
        authors
      }) as { data?: { paper_id?: number } };
      if (file && result.data?.paper_id) await uploadPaperFile(result.data.paper_id, file);
      if (coverImage && result.data?.paper_id) await uploadPaperCover(result.data.paper_id, coverImage);
      window.localStorage.removeItem('researchhub_submit_draft');
      await clearSubmitDraft();
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to submit research');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-10 flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-slate-200 dark:bg-darkLine rounded-full -z-10" />
        <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-300 -z-10" style={{ width: `${((step - 1) / 3) * 100}%` }} />
        {[1, 2, 3, 4].map(num => (
          <div key={num} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors ${step >= num ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white text-slate-400 dark:border-darkLine dark:bg-darkCard'}`}>
            {step > num ? <CheckCircle2 size={20} /> : num}
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-line bg-paper p-8 shadow-stitch dark:border-darkLine dark:bg-darkCard">
        <span className="sr-only" aria-live="polite">Step {step} of 4</span>
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="mb-2 text-2xl font-bold dark:text-white">What type of research are you adding?</h2>
            <p className="mb-8 text-slate-500 dark:text-slate-400">Select the type that best describes your work.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {RESEARCH_TYPES.map(type => (
                <button key={type.id} onClick={() => setResearchType(type.id)} className={`flex flex-col items-start rounded-xl border p-6 text-left transition-all hover:border-primary hover:shadow-md ${researchType === type.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-line bg-slate-50 dark:border-darkLine dark:bg-darkPanel'}`}>
                  <div className="mb-3">{type.icon}</div><h3 className="font-bold dark:text-white">{type.name}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{type.desc}</p>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end"><button type="button" onClick={handleNext} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-stitch transition hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary">Next <ArrowRight size={16} /></button></div>
          </div>
        )}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="mb-2 text-2xl font-bold dark:text-white">Upload your file</h2>
            <div onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); choosePdf(event.dataTransfer.files?.[0] || null); }} className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 transition-colors hover:border-primary hover:bg-primary/5 dark:border-darkLine dark:bg-darkPanel/50">
              <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><UploadCloud size={32} /></div>
              <h3 className="mb-1 text-lg font-bold dark:text-white">Drag and drop your PDF here</h3>
              <input type="file" accept=".pdf,application/pdf" className="hidden" id="file-upload" onChange={(e) => choosePdf(e.target.files?.[0] || null)} />
              <Button onClick={() => document.getElementById('file-upload')?.click()} variant="secondary">Browse files</Button>
              {file && (
                <div className="mt-6 flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-sm dark:border-darkLine dark:bg-darkCard">
                  <FileText size={20} className="text-red-500" /><span className="text-sm font-medium dark:text-white">{file.name}</span>
                  <button onClick={() => { setFile(null); void updateSubmitDraft({ pdf: null }); }} className="ml-auto text-slate-400 hover:text-red-500" aria-label="Remove PDF"><X size={16} /></button>
                </div>
              )}
            </div>
            <div onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); chooseCover(event.dataTransfer.files?.[0] || null); }} className="mt-5 rounded-xl border border-line bg-slate-50 p-5 dark:border-darkLine dark:bg-darkPanel"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold dark:text-white">Optional cover image</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Drag and drop or select a JPG, PNG, or WebP image up to 10 MB.</p></div><input id="cover-upload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => chooseCover(event.target.files?.[0] || null)} /><Button type="button" variant="secondary" onClick={() => document.getElementById('cover-upload')?.click()}>Choose image</Button></div>{coverImage ? <div className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-paper p-3 dark:border-darkLine dark:bg-darkCard"><img src={URL.createObjectURL(coverImage)} alt="Selected paper cover" className="size-16 rounded object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{coverImage.name}</p><p className="text-xs text-muted">{(coverImage.size / 1024 / 1024).toFixed(2)} MB</p></div><button type="button" onClick={() => { setCoverImage(null); void updateSubmitDraft({ coverImage: null }); }} className="text-slate-400 hover:text-red-500" aria-label="Remove cover image"><X size={16} /></button></div> : null}</div>
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={handleBack} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-muted transition hover:bg-primarySoft hover:text-primary"> <ArrowLeft size={16} /> Back</button>
              <button type="button" onClick={handleNext} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-stitch transition hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary">Continue <ArrowRight size={16} /></button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="mb-2 text-2xl font-bold dark:text-white">Research details</h2>
            <div className="grid gap-6">
              <div><label className="mb-2 block text-sm font-bold dark:text-slate-200">Title</label><input value={title} onChange={e => setTitle(e.target.value)} className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" /></div>
              <div><label className="mb-2 block text-sm font-bold dark:text-slate-200">Abstract</label><textarea value={abstract} onChange={e => setAbstract(e.target.value)} className="min-h-32 w-full rounded-lg border border-line bg-slate-50 p-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" /></div>
              <div><label className="mb-2 block text-sm font-bold dark:text-slate-200">Authors</label><textarea value={authorsText} onChange={e => setAuthorsText(e.target.value)} placeholder="One author per line" className="min-h-24 w-full rounded-lg border border-line bg-slate-50 p-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" /></div>
              <div className="grid gap-6 md:grid-cols-2">
                <div><label className="mb-2 block text-sm font-bold dark:text-slate-200">DOI (Optional)</label><input value={doi} onChange={e => setDoi(e.target.value)} className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" /></div>
                <div><label className="mb-2 block text-sm font-bold dark:text-slate-200">Publication Date</label><input value={date} onChange={e => setDate(e.target.value)} type="date" className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel" /></div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div><label className="mb-2 block text-sm font-bold dark:text-slate-200">Language</label><select value={language} onChange={e => setLanguage(e.target.value)} className="h-12 w-full rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel"><option>English</option></select></div>
                <div><label className="mb-2 block text-sm font-bold dark:text-slate-200">Peer Reviewed?</label><div className="flex h-12 items-center gap-3 rounded-lg border border-line bg-slate-50 px-3 dark:border-darkLine dark:bg-darkPanel"><input type="checkbox" checked={isPeerReviewed} onChange={e => setIsPeerReviewed(e.target.checked)} className="h-5 w-5 accent-primary" /><span className="text-sm dark:text-slate-200">Yes</span></div></div>
              </div>
              <div className="rounded-xl border border-line bg-slate-50 p-5 dark:border-darkLine dark:bg-darkPanel">
                <h3 className="mb-3 font-bold dark:text-white">Visibility</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button onClick={() => setVisibility('public')} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${visibility === 'public' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-line bg-white dark:border-darkLine dark:bg-darkCard'}`}><Globe className={visibility === 'public' ? 'text-primary' : 'text-slate-400'} size={20} /><div><div className="font-bold text-sm dark:text-white">Public</div></div></button>
                  <button onClick={() => setVisibility('private')} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${visibility === 'private' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-line bg-white dark:border-darkLine dark:bg-darkCard'}`}><Lock className={visibility === 'private' ? 'text-primary' : 'text-slate-400'} size={20} /><div><div className="font-bold text-sm dark:text-white">Private</div></div></button>
                </div>
              </div>
              {error && <p className="text-sm font-bold text-red-500">{error}</p>}
            </div>
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={handleBack} disabled={isSubmitting} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-muted transition hover:bg-primarySoft hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"><ArrowLeft size={16} /> Back</button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting || !title.trim()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-stitch transition hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Submitting...' : 'Finish & Publish'}</button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="animate-in zoom-in-95 flex min-h-[400px] flex-col items-center justify-center text-center duration-500">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"><CheckCircle2 size={40} /></div>
            <h2 className="mb-2 text-3xl font-bold dark:text-white">Research Added!</h2>
            <div className="flex gap-4">
              <Button onClick={() => { handleReset(); window.location.href = '/'; }}>Go to Home</Button>
              <Button variant="secondary" onClick={handleReset}>Submit another</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
