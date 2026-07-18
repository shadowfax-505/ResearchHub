'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, MessageSquare, MailPlus, User, Edit3, Settings, HelpCircle, LogOut, Bookmark, CheckCircle2 } from 'lucide-react';
import { HeaderDropdown } from '../ui/header-dropdown';
import { getConversations, getMessageRequests, getReceivedRequests, getUpdates, logout } from '@/lib/api';

export function UpdatesMenu() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { getUpdates(5).then(result => setItems(result.data || [])).catch(() => undefined); }, []);
  return <HeaderDropdown trigger={<Bell className="h-5 w-5 text-muted hover:text-primary" />} headerContent={<h3 className="font-semibold text-ink">Updates</h3>} footerContent={<Link href="/notifications" className="block w-full py-3 text-center text-sm text-primary hover:bg-canvas">View all</Link>}>
    {items.length ? items.map(item => <Link key={item.event_id} href={item.route_url || '/notifications'} className="block border-b border-line px-4 py-3 hover:bg-canvas"><p className="text-sm font-semibold text-ink">{item.title}</p><p className="mt-1 line-clamp-1 text-xs text-muted">{item.body}</p></Link>) : <div className="p-8 text-center text-muted"><p className="text-sm">You currently have no new updates</p></div>}
  </HeaderDropdown>;
}

export function MessagesMenu() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { getConversations().then(result => setItems(result.data || [])).catch(() => undefined); }, []);
  return <HeaderDropdown trigger={<MessageSquare className="h-5 w-5 text-muted hover:text-primary" />} headerContent={<><h3 className="font-semibold text-ink">Messages</h3><Link href="/messages" className="text-sm text-primary hover:underline">New</Link></>} footerContent={<Link href="/messages" className="block w-full py-3 text-center text-sm text-primary hover:bg-canvas">View all</Link>}>
    {items.length ? items.slice(0, 4).map(item => <Link key={item.other_user_id} href={`/messages?user=${item.other_user_id}`} className="block border-b border-line px-4 py-3 hover:bg-canvas"><p className="text-sm font-semibold text-ink">{item.other_full_name || item.other_username}</p><p className="mt-1 line-clamp-1 text-xs text-muted">{item.content}</p></Link>) : <div className="p-8 text-center text-muted"><p className="text-sm">You currently have no conversations</p></div>}
  </HeaderDropdown>;
}

export function RequestsMenu() {
  const [count, setCount] = useState(0);
  useEffect(() => { Promise.all([getMessageRequests(), getReceivedRequests()]).then(([messages, requests]) => setCount((messages.data || []).filter((item: any) => item.status === 'pending').length + (requests.data || []).filter((item: any) => item.status === 'pending').length)).catch(() => undefined); }, []);
  return <HeaderDropdown trigger={<span className="relative"><MailPlus className="h-5 w-5 text-muted hover:text-primary" />{count ? <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">{count > 9 ? '9+' : count}</span> : null}</span>} headerContent={<h3 className="font-semibold text-ink">Requests</h3>} footerContent={<Link href="/requests" className="block w-full py-3 text-center text-sm text-primary hover:bg-canvas">View all</Link>}>
    <Link href="/requests" className="block p-8 text-center text-sm text-muted hover:bg-canvas">{count ? `${count} pending request${count === 1 ? '' : 's'}` : 'No pending requests'}</Link>
  </HeaderDropdown>;
}

export function ProfileMenu() {
  const [status, setStatus] = useState('');
  async function handleLogout() { try { await logout(); window.location.assign('/login'); } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to sign out'); } }
  return <HeaderDropdown width="w-64" trigger={<div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-line bg-primary text-white"><User className="h-5 w-5" /></div>}>
    <div className="flex flex-col"><Link href="/settings" className="flex items-center px-4 py-3 text-ink transition-colors hover:bg-canvas"><CheckCircle2 className="mr-3 h-5 w-5 text-primary" /><span className="text-sm">Verify affiliation</span></Link><div className="my-1 h-px w-full bg-line" /><Link href="/profile" className="flex items-center px-4 py-3 text-ink transition-colors hover:bg-canvas"><Edit3 className="mr-3 h-5 w-5 text-muted" /><span className="text-sm">Your profile</span></Link><Link href="/profile?tab=saved" className="flex items-center px-4 py-3 text-ink transition-colors hover:bg-canvas"><Bookmark className="mr-3 h-5 w-5 text-muted" /><span className="text-sm">Your saved list</span></Link><Link href="/submit" className="flex items-center px-4 py-3 text-ink transition-colors hover:bg-canvas"><Edit3 className="mr-3 h-5 w-5 text-muted" /><span className="text-sm">Upload research</span></Link><Link href="/citations" className="flex items-center px-4 py-3 text-ink transition-colors hover:bg-canvas"><Edit3 className="mr-3 h-5 w-5 text-muted" /><span className="text-sm">Export citation</span></Link><div className="my-1 h-px w-full bg-line" /><Link href="/settings" className="flex items-center px-4 py-3 text-ink transition-colors hover:bg-canvas"><Settings className="mr-3 h-5 w-5 text-muted" /><span className="text-sm">Settings</span></Link><a href="/help" className="flex items-center px-4 py-3 text-ink transition-colors hover:bg-canvas"><HelpCircle className="mr-3 h-5 w-5 text-muted" /><span className="text-sm">Help center</span></a><div className="my-1 h-px w-full bg-line" /><button onClick={handleLogout} className="flex w-full items-center px-4 py-3 text-left text-ink transition-colors hover:bg-canvas"><LogOut className="mr-3 h-5 w-5 text-muted" /><span className="text-sm">Log out</span></button>{status ? <p className="px-4 pb-3 text-xs text-red-600">{status}</p> : null}</div>
  </HeaderDropdown>;
}
