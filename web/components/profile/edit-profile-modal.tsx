'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { PublicResearcherProfile, updateResearcherProfile, updateUser } from '@/lib/api';

interface EditProfileModalProps {
  profile: PublicResearcherProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: PublicResearcherProfile) => void;
}

export function EditProfileModal({ profile, isOpen, onClose, onUpdate }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    headline: profile.headline || '',
    affiliation: profile.affiliation || '',
    department: profile.department || '',
    position_title: profile.position_title || '',
    country: profile.country || '',
    bio: profile.bio || '',
    website_url: profile.website_url || '',
    orcid: profile.orcid || ''
  });
  
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (profile.user_id) {
        await updateUser(profile.user_id, {
          full_name: formData.full_name,
          affiliation: formData.affiliation,
          country: formData.country,
          bio: formData.bio
        });
      }

      await updateResearcherProfile({
        headline: formData.headline,
        department: formData.department,
        position_title: formData.position_title,
        website_url: formData.website_url,
        orcid: formData.orcid
      });

      onUpdate({ ...profile, ...formData });
      onClose();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-darkCard dark:border dark:border-darkLine">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/90 px-6 py-4 backdrop-blur dark:border-darkLine dark:bg-darkCard/90">
          <h2 className="text-xl font-bold text-ink dark:text-darkInk">Edit Profile</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted hover:bg-slate-100 dark:hover:bg-darkPanel">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm font-semibold rounded">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Headline (e.g. PhD Student, Senior Researcher)</label>
              <input type="text" name="headline" value={formData.headline} onChange={handleChange} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Institution/Affiliation</label>
                <input type="text" name="affiliation" value={formData.affiliation} onChange={handleChange} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Position Title</label>
                <input type="text" name="position_title" value={formData.position_title} onChange={handleChange} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Introduction / Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
                <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ORCID iD</label>
                <input type="text" name="orcid" value={formData.orcid} onChange={handleChange} className="w-full rounded-lg border border-line p-2 dark:border-darkLine dark:bg-darkBg" placeholder="0000-0000-0000-0000" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line dark:border-darkLine">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
