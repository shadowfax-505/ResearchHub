'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, FileText, UploadCloud, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export function AddNewDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden rounded-full bg-primary px-5 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-primaryDark md:inline-flex"
      >
        Add new
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={clsx(
          'fixed inset-y-0 right-0 z-[110] w-[400px] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-darkCard',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-6 dark:border-darkLine">
          <h2 className="text-lg font-bold text-ink dark:text-white">Add research</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-muted transition hover:bg-slate-100 hover:text-ink dark:text-darkMuted dark:hover:bg-darkHover dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Link
            href="/submit?type=published"
            onClick={() => setIsOpen(false)}
            className="group flex items-start gap-4 rounded-xl border border-line p-4 transition hover:border-primary hover:bg-primary/5 dark:border-darkLine dark:hover:border-primary"
          >
            <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-ink transition group-hover:text-primary dark:text-white">Published research</h3>
              <p className="mt-1 text-sm text-muted dark:text-darkMuted">
                Article, Book, Chapter, Conference Paper, Patent, Poster, Presentation, Project, Method...
              </p>
            </div>
          </Link>

          <Link
            href="/submit?type=preprint"
            onClick={() => setIsOpen(false)}
            className="group flex items-start gap-4 rounded-xl border border-line p-4 transition hover:border-primary hover:bg-primary/5 dark:border-darkLine dark:hover:border-primary"
          >
            <div className="rounded-full bg-teal-100 p-3 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
              <UploadCloud size={24} />
            </div>
            <div>
              <h3 className="font-bold text-ink transition group-hover:text-primary dark:text-white">Preprint or Draft</h3>
              <p className="mt-1 text-sm text-muted dark:text-darkMuted">
                Add your early-stage or preprint research to gain visibility before peer review.
              </p>
            </div>
          </Link>

          <div
            role="button"
            tabIndex={0}
            onClick={() => { setIsOpen(false); router.push('/questions?ask=true'); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setIsOpen(false); router.push('/questions?ask=true'); } }}
            className="group flex cursor-pointer items-start gap-4 rounded-xl border border-line p-4 transition hover:border-primary hover:bg-primary/5 dark:border-darkLine dark:hover:border-primary"
          >
            <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-bold text-ink transition group-hover:text-primary dark:text-white">Ask a Question</h3>
              <p className="mt-1 text-sm text-muted dark:text-darkMuted">
                Ask a technical question or start a scientific discussion with the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
