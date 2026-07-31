'use client';

import { useState, useEffect } from 'react';
import { getMyProjects, getPublicProjects, createProject, updateProjectStatus, getProjectUpdates, addProjectUpdate } from '@/lib/api';
import { Plus, Briefcase, Users, Edit3, MessageSquare, Clipboard, Send, FileText } from 'lucide-react';
import { decodeTokenPayload } from '@/lib/session';
import { ProjectNotesModal } from './project-notes-modal';
import { ProjectResourceTracker } from './project-resource-tracker';
import { GrantFundingFinder } from './grant-funding-finder';
import { LabEquipmentRegistry } from './lab-equipment-registry';

export function ProjectsView() {
  const [user, setUser] = useState<{ user_id?: number; username?: string; role?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.sessionStorage.getItem('researchhub_token');
      if (token) setUser(decodeTokenPayload(token));
    }
  }, []);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-projects'>('discover');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [notesTarget, setNotesTarget] = useState<{ id: number; title: string } | null>(null);

  const filteredProjects = projects.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return p.status === 'completed';
    return p.status !== 'completed';
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // Project Updates Refinement
  const [showUpdatesFor, setShowUpdatesFor] = useState<number | null>(null);
  const [projectUpdates, setProjectUpdates] = useState<Record<number, any[]>>({});
  const [updateInput, setUpdateInput] = useState<Record<number, string>>({});
  const [loadingUpdates, setLoadingUpdates] = useState<Record<number, boolean>>({});

  const loadUpdates = async (projectId: number) => {
    setLoadingUpdates(prev => ({ ...prev, [projectId]: true }));
    try {
      const res = await getProjectUpdates(projectId);
      setProjectUpdates(prev => ({ ...prev, [projectId]: res.data || [] }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUpdates(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const loadProjects = () => {
    if (activeTab === 'discover') {
      getPublicProjects().then(res => setProjects(res.data || []));
    } else {
      getMyProjects().then(res => setProjects(res.data || []));
    }
  };

  useEffect(() => {
    loadProjects();
  }, [activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(newTitle, newDesc);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostUpdate = async (projectId: number) => {
    const text = updateInput[projectId] || '';
    if (!text.trim()) return;
    try {
      await addProjectUpdate(projectId, text.trim());
      setUpdateInput(prev => ({ ...prev, [projectId]: '' }));
      loadUpdates(projectId);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (projectId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'completed' : 'active';
    try {
      await updateProjectStatus(projectId, newStatus);
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-4 border-b border-line dark:border-darkLine w-full sm:w-auto">
          <button
            className={`pb-2 font-bold ${activeTab === 'discover' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </button>
          <button
            className={`pb-2 font-bold ${activeTab === 'my-projects' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('my-projects')}
          >
            My Projects
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-darkPanel p-0.5 rounded border border-line dark:border-darkLine">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition ${statusFilter === 'all' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition ${statusFilter === 'active' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition ${statusFilter === 'completed' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Done
            </button>
          </div>

          {activeTab === 'my-projects' && (
            <button
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Create
            </button>
          )}
        </div>
      </div>

      <GrantFundingFinder />

      <LabEquipmentRegistry />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.length ? filteredProjects.map(p => {
          const isExpanded = showUpdatesFor === p.project_id;
          const updates = projectUpdates[p.project_id] || [];
          return (
            <div key={p.project_id} className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard flex flex-col transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-black">{p.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {p.status}
                </span>
              </div>
              {activeTab === 'discover' && <p className="text-xs text-muted mb-3">Led by {p.username || 'Unknown'}</p>}
              <p className="text-sm text-muted dark:text-darkMuted flex-1">{p.description}</p>

              {/* Compute Resource Tracker */}
              <ProjectResourceTracker projectTitle={p.title} />

              {/* Roadmap & Milestones */}
              <div className="mt-4 pt-3 border-t border-line dark:border-darkLine">
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Target Completion</span>
                  <span className="text-primary font-mono">{p.status === 'completed' ? '100% Done' : `${p.project_id % 2 === 0 ? 75 : 40}% Progress`}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-darkPanel overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-teal-500 transition-all duration-500 rounded-full"
                    style={{ width: p.status === 'completed' ? '100%' : `${p.project_id % 2 === 0 ? 75 : 40}%` }}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-green-500"></span> Phase 1: Data & Literature Setup
                    </span>
                    <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Done</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${p.status === 'completed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span> Phase 2: Experiments & Benchmark
                    </span>
                    <span className={`text-[10px] font-semibold ${p.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{p.status === 'completed' ? 'Done' : 'Active'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${p.status === 'completed' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span> Phase 3: Paper Submission
                    </span>
                    <span className="text-[10px] text-slate-400">{p.status === 'completed' ? 'Done' : 'Dec 2026'}</span>
                  </div>
                </div>
              </div>

              {/* Updates Section */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-line dark:border-darkLine space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <h4 className="text-xs font-bold text-ink dark:text-darkInk flex items-center gap-1.5">
                    <Clipboard size={14} className="text-primary" /> Project log updates
                  </h4>
                  
                  {activeTab === 'my-projects' && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add update / progress report..."
                        value={updateInput[p.project_id] || ''}
                        onChange={(e) => setUpdateInput(prev => ({ ...prev, [p.project_id]: e.target.value }))}
                        className="flex-1 text-xs border border-line rounded px-2.5 py-1.5 outline-none focus:border-primary dark:border-darkLine dark:bg-darkPanel dark:text-darkInk"
                      />
                      <button
                        onClick={() => handlePostUpdate(p.project_id)}
                        className="bg-primary hover:bg-primaryDark text-white p-1.5 rounded transition shrink-0"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {loadingUpdates[p.project_id] ? (
                      <p className="text-[11px] text-slate-400">Loading updates...</p>
                    ) : updates.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No updates posted yet.</p>
                    ) : (
                      updates.map((up: any) => (
                        <div key={up.update_id} className="bg-slate-50 dark:bg-darkPanel p-2 rounded text-[11px] border border-slate-100 dark:border-darkLine">
                          <p className="text-slate-700 dark:text-slate-300 leading-normal">{up.body}</p>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                            {up.full_name || up.username} &middot; {new Date(up.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-line dark:border-darkLine flex items-center justify-between text-xs text-muted">
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNotesTarget({ id: p.project_id, title: p.title })}
                    className="font-bold text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200 flex items-center gap-1"
                  >
                    <FileText size={13} /> Lab Notes
                  </button>
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setShowUpdatesFor(null);
                      } else {
                        setShowUpdatesFor(p.project_id);
                        loadUpdates(p.project_id);
                      }
                    }}
                    className="font-bold text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <MessageSquare size={13} /> {isExpanded ? 'Hide Updates' : 'Updates'}
                  </button>
                  {activeTab === 'my-projects' && (
                    <button
                      onClick={() => toggleStatus(p.project_id, p.status)}
                      className="font-bold text-primary hover:underline"
                    >
                      Mark {p.status === 'active' ? 'Completed' : 'Active'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <p className="col-span-full text-center text-muted">No projects found.</p>
        )}
      </div>

      {notesTarget && (
        <ProjectNotesModal
          projectId={notesTarget.id}
          projectTitle={notesTarget.title}
          isOpen={Boolean(notesTarget)}
          onClose={() => setNotesTarget(null)}
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl dark:bg-darkCard">
            <h2 className="mb-4 text-xl font-black">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold">Project Title</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-darkLine"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-darkLine"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="px-4 py-2 text-sm font-bold text-muted hover:text-ink dark:text-darkMuted dark:hover:text-darkInk" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
