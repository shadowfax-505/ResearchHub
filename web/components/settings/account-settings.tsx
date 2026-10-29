'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { getSettings, updateSettings, type SettingsSummary } from '@/lib/api';
type Theme = 'light' | 'dark' | 'system';
function applyTheme(theme: Theme) {
  localStorage.setItem('researchhub_theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches));
  window.dispatchEvent(new Event('researchhub-theme-changed'));
}
export function AccountSettings({ compact = false }: { compact?: boolean }) {
  const [settings, setSettings] = useState<SettingsSummary>({theme:'system', email_notifications:true,paper_recommendations:true,profile_visibility:'public'});
  const [tab, setTab] = useState('Appearance'), [pending, setPending] = useState(false), [loading, setLoading] = useState(true), [status, setStatus] = useState('');
  useEffect(() => { let active=true;getSettings().then(result=>{if(active&&result.data){setSettings(result.data);applyTheme((result.data.theme||'system') as Theme);}}).catch(error=>{if(active)setStatus(error.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;}; }, []);
  async function save(event: FormEvent) { event.preventDefault();setPending(true);setStatus('');try{await updateSettings({theme:settings.theme,email_notifications:settings.email_notifications,paper_recommendations:settings.paper_recommendations,profile_visibility:settings.profile_visibility});applyTheme((settings.theme||'system') as Theme);setStatus('Your preferences are saved.');}catch(error){setStatus(error instanceof Error?error.message:'Unable to save preferences.');}finally{setPending(false);} }
  if(loading)return <p role="status">Opening your preferences…</p>;
  return <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
    <h2 className="font-serif text-3xl">Make yourself at home.</h2><p className="mt-2 text-sm text-muted">Your workspace, your reading preferences.</p>
    {!compact?<nav className="rh-feed-tabs my-6 flex-wrap" aria-label="Settings sections">{['Appearance','Notifications','Privacy'].map(label=><button key={label} aria-pressed={tab===label} onClick={()=>setTab(label)}>{label}</button>)}</nav>:null}
    <form onSubmit={save} className="mt-5 space-y-6">
      {tab==='Appearance'||compact?<fieldset><legend className="mb-3 text-sm font-semibold">Reading theme</legend><div className="flex flex-wrap gap-3">{(['light','dark','system'] as const).map(theme=><label key={theme} className="flex items-center gap-2 rounded-lg border border-line px-4 py-3 text-sm capitalize"><input type="radio" name="theme" value={theme} checked={settings.theme===theme} onChange={()=>{setSettings(current=>({...current,theme}));applyTheme(theme);}}/>{theme}</label>)}</div></fieldset>:null}
      {tab==='Notifications'||compact?<fieldset className="space-y-4"><legend className="mb-3 text-sm font-semibold">Stay in the conversation</legend>{[['email_notifications','Email notifications'],['paper_recommendations','Paper recommendations']].map(([key,label])=><label key={key} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(settings[key as keyof SettingsSummary])} onChange={event=>setSettings(current=>({...current,[key]:event.target.checked}))}/>{label}</label>)}</fieldset>:null}
      {tab==='Privacy'?<label className="block text-sm font-semibold">Profile visibility<select className="mt-3 block w-full rounded-lg border border-line bg-paper p-3 dark:bg-darkPanel" value={settings.profile_visibility||'public'} onChange={event=>setSettings(current=>({...current,profile_visibility:event.target.value}))}><option value="public">Public</option><option value="followers">Network only</option><option value="private">Private</option></select><span className="mt-2 block text-xs font-normal text-muted">Network and private profiles are excluded from the public directory.</span></label>:null}
      <button type="submit" disabled={pending} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending?'Saving…':'Save preferences ↗'}</button>
      {status?<p role="status" className="text-sm">{status}</p>:null}
    </form>
  </section>;
}
