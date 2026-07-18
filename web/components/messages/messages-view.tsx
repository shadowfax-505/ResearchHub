'use client';

import { useEffect, useMemo, useState } from 'react';
import { getConversations, getConversationWithUser, sendMessage, markMessageRead, searchMessageUsers, createMessageRequest, getMessageRequests, updateMessageRequest } from '@/lib/api';
import { MessageSquare, Send, User as UserIcon, Search, Check, X } from 'lucide-react';
import { decodeTokenPayload } from '@/lib/session';

export function MessagesView() {
  const [user, setUser] = useState<{ user_id?: number } | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedConversation = useMemo(() => conversations.find(item => Number(item.other_user_id) === selectedUserId), [conversations, selectedUserId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.sessionStorage.getItem('researchhub_token');
      if (token) setUser(decodeTokenPayload(token));
      const to = Number(new URLSearchParams(window.location.search).get('to') || new URLSearchParams(window.location.search).get('user'));
      if (Number.isInteger(to) && to > 0) setSelectedUserId(to);
    }
  }, []);

  async function loadInbox() {
    try { const [conversationResult, requestResult] = await Promise.all([getConversations(), getMessageRequests()]); setConversations(conversationResult.data || []); setRequests(requestResult.data || []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load messages'); }
  }
  useEffect(() => { loadInbox(); }, []);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const timer = window.setTimeout(() => { searchMessageUsers(search).then(result => setResults(result.data || [])).catch(() => setResults([])); }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  async function loadConversation() {
    if (!selectedUserId) return;
    try {
      const result = await getConversationWithUser(selectedUserId);
      const data = result.data || [];
      setMessages(data);
      data.filter((item: any) => item.receiver_id === user?.user_id && !item.is_read).forEach((item: any) => markMessageRead(item.message_id));
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load conversation'); }
  }
  useEffect(() => { loadConversation(); const timer = selectedUserId ? window.setInterval(loadConversation, 15000) : undefined; return () => { if (timer) window.clearInterval(timer); }; }, [selectedUserId, user?.user_id]);

  function selectUser(item: any) { setSelectedUserId(Number(item.user_id || item.other_user_id)); setSelectedName(item.full_name || item.other_full_name || item.username || item.other_username || 'Researcher'); setSearch(''); setResults([]); setMessages([]); }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedUserId || !newMessage.trim()) return;
    setLoading(true); setError('');
    try {
      const existingRequest = requests.find(item => (Number(item.sender_id) === user?.user_id && Number(item.recipient_id) === selectedUserId) || (Number(item.recipient_id) === user?.user_id && Number(item.sender_id) === selectedUserId));
      if (!messages.length && !selectedConversation && existingRequest?.status !== 'accepted') await createMessageRequest(selectedUserId, newMessage.trim());
      else await sendMessage(selectedUserId, newMessage.trim());
      setNewMessage(''); await loadInbox(); await loadConversation();
    } catch (err) { setError(err instanceof Error ? err.message : 'Message could not be sent'); }
    finally { setLoading(false); }
  }

  async function decideRequest(requestId: number, status: 'accepted' | 'declined' | 'blocked') {
    try { await updateMessageRequest(requestId, status); await loadInbox(); if (status === 'accepted') { const request = requests.find(item => item.request_id === requestId); if (request) selectUser({ user_id: request.sender_id, full_name: request.sender_full_name }); } }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to update message request'); }
  }

  return <div className="flex min-h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-soft border border-line bg-paper shadow-stitch dark:border-darkLine dark:bg-darkCard md:flex-row">
    <aside className="w-full border-b border-line dark:border-darkLine md:w-80 md:border-b-0 md:border-r"><div className="border-b border-line bg-slate-50 p-4 dark:border-darkLine dark:bg-darkPanel"><div className="flex items-center gap-2"><MessageSquare className="text-primary" /><h2 className="text-xl font-black">Messages</h2></div><div className="relative mt-3"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a researcher" className="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-primary dark:border-darkLine dark:bg-darkCard" /></div>{results.length ? <div className="absolute z-10 mt-1 w-[calc(100%-2rem)] overflow-hidden rounded-lg border border-line bg-paper shadow-lg dark:border-darkLine dark:bg-darkCard">{results.map(item => <button key={item.user_id} onClick={() => selectUser(item)} className="block w-full border-b border-line px-3 py-2 text-left hover:bg-canvas dark:border-darkLine"><p className="text-sm font-bold">{item.full_name}</p><p className="text-xs text-muted">{item.affiliation || item.headline}</p></button>)}</div> : null}</div>
      {requests.filter(item => item.status === 'pending' && Number(item.recipient_id) === user?.user_id).length ? <div className="border-b border-line p-3 dark:border-darkLine"><p className="mb-2 text-xs font-black uppercase tracking-widest text-primary">Message requests</p>{requests.filter(item => item.status === 'pending' && Number(item.recipient_id) === user?.user_id).map(item => <div key={item.request_id} className="mb-2 rounded-lg bg-slate-50 p-3 dark:bg-darkPanel"><p className="text-sm font-bold">{item.sender_full_name}</p><p className="mt-1 line-clamp-2 text-xs text-muted">{item.first_message}</p><div className="mt-2 flex gap-2"><button onClick={() => decideRequest(item.request_id, 'accepted')} className="grid size-7 place-items-center rounded-full bg-primary text-white" aria-label="Accept message request"><Check size={14} /></button><button onClick={() => decideRequest(item.request_id, 'declined')} className="grid size-7 place-items-center rounded-full border border-line text-muted" aria-label="Decline message request"><X size={14} /></button></div></div>)}</div> : null}
      <div className="divide-y divide-line dark:divide-darkLine">{conversations.length ? conversations.map(conv => <button key={conv.other_user_id} onClick={() => selectUser(conv)} className={`w-full p-4 text-left transition hover:bg-slate-50 dark:hover:bg-darkPanel ${selectedUserId === Number(conv.other_user_id) ? 'bg-slate-100 dark:bg-darkLine/50' : ''}`}><div className="flex items-start justify-between gap-2"><p className="truncate font-bold">{conv.other_full_name || conv.other_username}</p>{conv.unread_count ? <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">{conv.unread_count}</span> : null}</div><p className="mt-1 truncate text-sm text-muted dark:text-darkMuted">{conv.sender_id === user?.user_id ? 'You: ' : ''}{conv.content}</p></button>) : <p className="p-4 text-center text-sm text-muted">No conversations yet. Search for a researcher to start one.</p>}</div>
    </aside>
    <section className="flex min-h-[28rem] flex-1 flex-col">{selectedUserId ? <><div className="flex items-center gap-3 border-b border-line bg-slate-50 p-4 dark:border-darkLine dark:bg-darkPanel"><div className="grid size-10 place-items-center rounded-full bg-primarySoft text-primary"><UserIcon size={20} /></div><div><h2 className="text-lg font-black">{selectedName || selectedConversation?.other_full_name || 'Researcher'}</h2><p className="text-xs text-muted">ResearchHub researcher</p></div></div><div className="flex-1 space-y-4 overflow-y-auto p-4">{messages.length ? messages.map(message => <div key={message.message_id} className={`flex ${message.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] rounded-lg p-3 ${message.sender_id === user?.user_id ? 'bg-primary text-white' : 'bg-slate-100 text-ink dark:bg-darkPanel dark:text-darkInk'}`}><p className="text-sm">{message.content}</p><p className={`mt-1 text-xs ${message.sender_id === user?.user_id ? 'text-white/80' : 'text-muted'}`}>{new Date(message.created_at).toLocaleTimeString()}</p></div></div>) : <p className="py-10 text-center text-sm text-muted">Start the conversation with a message request.</p>}</div><form onSubmit={handleSend} className="flex gap-2 border-t border-line p-4 dark:border-darkLine"><input value={newMessage} onChange={event => setNewMessage(event.target.value)} maxLength={4000} placeholder="Write a message" className="min-w-0 flex-1 rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-darkLine" /><button type="submit" disabled={loading || !newMessage.trim()} className="grid size-10 place-items-center rounded-md bg-primary text-white disabled:opacity-50" aria-label="Send message"><Send size={18} /></button></form></> : <div className="grid flex-1 place-items-center p-8 text-center text-muted"><div><MessageSquare className="mx-auto mb-3 size-10 text-primary" /><p>Select a conversation or search for a researcher</p></div></div>}{error ? <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p> : null}</section>
  </div>;
}
