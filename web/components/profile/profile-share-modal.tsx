'use client';

import { useState } from 'react';
import { Share2, X, Copy, Check, ExternalLink, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicResearcherProfile } from '@/lib/api';

interface ProfileShareModalProps {
  profile: PublicResearcherProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileShareModal({ profile, isOpen, onClose }: ProfileShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/researchers/${profile.username}` : `https://researchhub.org/researchers/${profile.username}`;
  const embedCode = `<iframe src="${profileUrl}/embed" width="350" height="200" frameborder="0"></iframe>`;

  function copyToClipboard(text: string, isEmbed = false) {
    navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-darkCard rounded-lg shadow-2xl overflow-hidden border border-line dark:border-darkLine">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-line dark:border-darkLine bg-slate-50 dark:bg-darkPanel">
          <div className="flex items-center gap-2">
            <Share2 className="text-primary" size={20} />
            <h3 className="font-black text-lg text-ink dark:text-darkInk">Share Researcher Profile</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Researcher Preview Card */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-darkPanel border border-line dark:border-darkLine flex items-center gap-4">
            <div className="size-14 rounded-full bg-slate-900 text-white font-black text-lg flex items-center justify-center shrink-0">
              {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'R'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-ink dark:text-darkInk truncate">{profile.full_name || profile.username}</h4>
              <p className="text-xs text-slate-500 truncate">{profile.affiliation || 'Researcher'}</p>
              <div className="mt-1 flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>{profile.total_reads || 0} Reads</span>
                <span>·</span>
                <span>{profile.rg_score || 0} RI Score</span>
              </div>
            </div>
          </div>

          {/* Profile URL Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Direct Profile Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={profileUrl}
                className="w-full h-9 border border-line rounded px-3 text-xs outline-none bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-darkInk font-mono"
              />
              <Button onClick={() => copyToClipboard(profileUrl)} className="bg-primary text-white font-bold h-9 px-3 shrink-0">
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-slate-50 dark:bg-darkPanel border border-line dark:border-darkLine rounded-lg text-center space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Scan Profile QR Code</p>
            <div className="flex justify-center p-2 bg-white rounded border border-line inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(profileUrl)}`}
                alt="Profile QR Code"
                className="w-32 h-32 object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-500">Scan with mobile camera to view research portfolio</p>
          </div>

          {/* Embed HTML Badge Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Code size={14} /> Embeddable Profile Badge Code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={embedCode}
                className="w-full h-9 border border-line rounded px-3 text-xs outline-none bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-darkInk font-mono text-slate-500"
              />
              <Button onClick={() => copyToClipboard(embedCode, true)} variant="outline" className="font-bold h-9 px-3 shrink-0">
                {copiedEmbed ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-2 border-t border-line dark:border-darkLine flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Quick Share:</span>
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=Check out ${profile.full_name}'s research profile!&url=${encodeURIComponent(profileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1"
              >
                Twitter / X <ExternalLink size={12} />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition flex items-center gap-1"
              >
                LinkedIn <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
