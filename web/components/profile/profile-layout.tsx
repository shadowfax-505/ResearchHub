'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProfileTabOverview } from './profile-tab-overview';
import { ProfileTabResearch } from './profile-tab-research';
import { ProfileTabStats } from './profile-tab-stats';
import { ProfileTabFollowing } from './profile-tab-following';
import { ProfileTabSaved } from './profile-tab-saved';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { getMyProfile, PublicResearcherProfile } from '@/lib/api';
import { EditProfileModal } from './edit-profile-modal';
import { ScholarBadges } from './scholar-badges';
import { VerificationRequestModal } from './verification-request-modal';
import { ProfileShareModal } from './profile-share-modal';

export function ProfileLayout() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<PublicResearcherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'saved' || tabParam === 'saved list') {
      setActiveTab('saved list');
    } else if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    getMyProfile().then(res => {
      if (res.data) setProfile(res.data as PublicResearcherProfile);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-soft border border-line bg-paper p-6 text-center shadow-stitch dark:border-darkLine dark:bg-darkCard">
        <h2 className="text-xl font-bold">Failed to load profile</h2>
        <p className="text-muted">Please sign in to view your profile.</p>
      </div>
    );
  }

  const initials = (profile.full_name || profile.username || 'RH').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();

  const fetchProfile = () => {
    getMyProfile().then(res => {
      if (res.data) setProfile(res.data as PublicResearcherProfile);
    }).catch(console.error);
  };

  return (
    <div className="space-y-6">
      <EditProfileModal 
        profile={profile} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onUpdate={(updated) => setProfile(updated)} 
      />
      {/* Profile Header Card */}
      <section className="rounded-soft border border-line bg-paper shadow-stitch dark:border-darkLine dark:bg-darkCard">
         {/* Top Section */}
         <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
               <div className="flex gap-5">
                 <span className="grid size-24 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-900 to-primary text-3xl font-black text-white">{initials}</span>
                 <div>
                    <h1 className="flex items-center gap-2 text-2xl font-black">
                      {profile.full_name || profile.username}
                      <BadgeCheck className="text-primary" size={20} />
                    </h1>
                    <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">{profile.headline || profile.position_title}</p>
                    <p className="mt-1 text-sm text-muted dark:text-darkMuted">{[profile.department, profile.affiliation, profile.country].filter(Boolean).join(' · ')}</p>
                    <ScholarBadges profile={profile} />
                    <div className="mt-4 flex gap-6 text-sm font-bold text-slate-700 dark:text-slate-300">
                       <div className="flex flex-col"><span className="text-xl font-black text-ink dark:text-darkInk">{profile.total_reads || 0}</span> Reads</div>
                       <div className="flex flex-col"><span className="text-xl font-black text-ink dark:text-darkInk">{profile.rg_score || 0}</span> RI Score</div>
                    </div>
                 </div>
               </div>
                <div className="flex gap-3">
                  {!(profile.is_verified || profile.researcher_verified_at) && (
                    <Button variant="outline" className="font-bold border-teal-600 text-teal-700 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-950/40" onClick={() => setIsVerifyModalOpen(true)}>
                      Get Verified
                    </Button>
                  )}
                  <Button variant="outline" className="font-bold" onClick={() => setIsShareModalOpen(true)}>Share Profile</Button>
                  <Button variant="secondary" className="font-bold" onClick={() => setIsEditModalOpen(true)}>Edit</Button>
                </div>
             </div>
          </div>

          <VerificationRequestModal
            isOpen={isVerifyModalOpen}
            onClose={() => setIsVerifyModalOpen(false)}
          />

          <ProfileShareModal
            profile={profile}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />

         {/* Tabs Navigation */}
         <div className="flex items-center justify-between border-t border-line px-6 dark:border-darkLine">
            <nav className="flex gap-8 text-sm font-bold">
               {['profile', 'research', 'stats', 'following', 'saved list'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`border-b-[3px] py-4 capitalize transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted hover:border-slate-300 hover:text-ink dark:text-darkMuted dark:hover:border-slate-700 dark:hover:text-darkInk'}`}
                 >
                   {tab}
                 </button>
               ))}
            </nav>
            <Button className="font-bold" onClick={() => router.push('/submit')}>Add research</Button>
         </div>
      </section>

      {/* Main Content Area */}
      <div className="animate-in fade-in duration-300">
         {activeTab === 'profile' && <ProfileTabOverview profile={profile} onUpdate={fetchProfile} />}
         {activeTab === 'research' && <ProfileTabResearch profile={profile} />}
         {activeTab === 'stats' && <ProfileTabStats profile={profile} />}
         {activeTab === 'following' && <ProfileTabFollowing profile={profile} />}
         {activeTab === 'saved list' && <ProfileTabSaved profile={profile} />}
      </div>
    </div>
  );
}
