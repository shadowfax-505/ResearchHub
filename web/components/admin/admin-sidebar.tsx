'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems: { name: string; href: string; icon: string }[] = [
    { name: 'Overview & Stats', href: '/admin', icon: '📊' },
    { name: 'User & Verification', href: '/admin/users', icon: '👥' },
    { name: 'Paper & DOI Control', href: '/admin/papers', icon: '📄' },
    { name: 'Community & Q&A', href: '/admin/community', icon: '💬' },
    { name: 'Job Board Control', href: '/admin/jobs', icon: '💼' },
    { name: 'Email Dispatch Queue', href: '/admin/emails', icon: '✉️' },
    { name: 'Audit Logs', href: '/admin/logs', icon: '🛡️' },
    { name: 'System Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-lg">
          RH
        </div>
        <div>
          <h2 className="font-bold text-white leading-tight">ResearchHub HQ</h2>
          <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Admin Portal</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p>ResearchHub Headquarter Systems</p>
        <p className="mt-1 font-mono text-[10px]">v2.4.0-hq-enterprise</p>
      </div>
    </aside>
  );
}
