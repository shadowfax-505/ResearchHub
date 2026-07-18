'use client';

import { useState, useEffect } from 'react';
import { getMyProjects, getPublicProjects, createProject, updateProjectStatus } from '@/lib/api';
import { Plus, Briefcase, Users, Edit3 } from 'lucide-react';
import { decodeTokenPayload } from '@/lib/session';

export function ProjectsView() {
  const [user, setUser] = useState<{ user_id?: number; username?: string; role?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.sessionStorage.getItem('researchhub_token');
      if (token) setUser(decodeTokenPayload(token));
    }
  }, []);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-projects'>('discover');
  const [projects, setProjects] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

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
      <div className="flex items-center justify-between">
        <div className="flex gap-4 border-b border-line dark:border-darkLine w-full max-w-md">
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
        {activeTab === 'my-projects' && (
          <button
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> Create Project
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length ? projects.map(p => (
          <div key={p.project_id} className="rounded-soft border border-line bg-paper p-5 shadow-stitch dark:border-darkLine dark:bg-darkCard flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-black">{p.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                {p.status}
              </span>
            </div>
            {activeTab === 'discover' && <p className="text-xs text-muted mb-3">Led by {p.username || 'Unknown'}</p>}
            <p className="text-sm text-muted dark:text-darkMuted flex-1">{p.description}</p>
            <div className="mt-4 pt-4 border-t border-line dark:border-darkLine flex items-center justify-between text-xs text-muted">
              <span>{new Date(p.created_at).toLocaleDateString()}</span>
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
        )) : (
          <p className="col-span-full text-center text-muted">No projects found.</p>
        )}
      </div>

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
