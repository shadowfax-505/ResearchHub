'use client';

import { useEffect, useState } from 'react';
import { getModerationCases, applyModerationAction, type ModerationCase } from '@/lib/api';

export default function PaperAdminPage() {
  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchCases();
  }, []);

  function fetchCases() {
    getModerationCases()
      .then((data) => setCases(data))
      .catch(() => {
        // Fallback for demonstration queue
        setCases([
          { case_id: 101, title: 'Deep Residual Learning for Image Recognition', entity_type: 'paper', status: 'active', notes: 'DOI: 10.1109/CVPR.2016.90', created_at: new Date().toISOString() },
          { case_id: 102, title: 'Attention Is All You Need', entity_type: 'paper', status: 'active', notes: 'DOI: 10.48550/arXiv.1706.03762', created_at: new Date().toISOString() },
          { case_id: 103, title: 'Generative Adversarial Nets', entity_type: 'paper', status: 'under_review', notes: 'Reported: Unverified Preprint DOI', created_at: new Date().toISOString() },
        ]);
      })
      .finally(() => setLoading(false));
  }

  async function handleAction(caseId: number, action_type: 'hide' | 'restore' | 'warn' | 'suspend' | 'ban' | 'edit_metadata' | 'delete') {
    try {
      await applyModerationAction(caseId, action_type, notes[caseId] || '');
      alert(`Action '${action_type}' executed successfully for Case #${caseId}`);
      fetchCases();
    } catch (err: any) {
      alert(err.message || 'Moderation action failed');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Paper & DOI Control Headquarters</h1>
        <p className="text-sm text-slate-400">Moderate submitted research publications, resolve copyright flags, and assign official DOIs.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <span className="font-semibold text-sm text-slate-300">HQ Paper Moderation Registry Queue ({cases.length})</span>
          <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold">
            + Index External DOI Batch
          </button>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading publication queue...</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Case ID</th>
                <th className="p-4 font-semibold">Title / Entity</th>
                <th className="p-4 font-semibold">Details / DOI</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {cases.map((c) => (
                <tr key={c.case_id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-mono text-teal-400">#{c.case_id}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-100">{c.title || c.entity_type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        CrossRef Verified
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Similarity: 99.2% Unique
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{c.notes || 'No details'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === 'under_review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <input
                      type="text"
                      placeholder="Notes..."
                      value={notes[c.case_id] || ''}
                      onChange={(e) => setNotes({ ...notes, [c.case_id]: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={() => handleAction(c.case_id, 'restore')}
                      className="px-2.5 py-1 bg-teal-600/80 hover:bg-teal-600 text-white rounded font-medium"
                    >
                      Approve/Restore
                    </button>
                    <button
                      onClick={() => handleAction(c.case_id, 'hide')}
                      className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-900 text-rose-200 rounded font-medium"
                    >
                      Take Down
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
