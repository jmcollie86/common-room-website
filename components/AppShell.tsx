'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Layers, Sparkles, FileText, User, ShieldCheck, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

type Tab = 'dashboard' | 'adopt' | 'reflections' | 'notes';

const tabs = [
  { id: 'dashboard' as Tab, label: 'My Purpose Dashboard', href: '/dashboard', Icon: LayoutDashboard },
  { id: 'adopt' as Tab, label: 'ADOPT Themes', href: '/adopt', Icon: Layers },
  { id: 'reflections' as Tab, label: 'AI Reflection', href: '/reflections', Icon: Sparkles },
  { id: 'notes' as Tab, label: 'My Note', href: '/notes', Icon: FileText },
];

interface AppShellProps {
  active: Tab;
  children: React.ReactNode;
}

export function AppShell({ active, children }: AppShellProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
      if (data?.is_admin) setIsAdmin(true);
    });
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-6 flex items-center justify-between b-b-sm">
        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tcr-logo-secondary.png" alt="The Common Room" width={140} height={30} />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded-lg hover:bg-primary/5 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} color={Colors.subtext} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {tabs.map(({ id, label, href, Icon }) => {
          const isActive = id === active;
          return (
            <Link
              key={id}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                color: isActive ? Colors.primary : Colors.subtext,
                backgroundColor: isActive ? Colors.primary + '12' : 'transparent',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="p-3 flex flex-col gap-0.5 b-t-sm">
        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-primary/5"
            style={{ color: Colors.subtext }}
          >
            <ShieldCheck size={18} strokeWidth={1.8} />
            Admin
          </Link>
        )}
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-primary/5"
          style={{ color: Colors.subtext }}
        >
          <User size={18} strokeWidth={1.8} />
          Profile
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible; mobile: slide-in overlay */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 flex flex-col bg-white z-40 lg:w-56 xl:w-64 b-r transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto lg:ml-56 xl:ml-64">

        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-background lg:hidden b-b-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} color={Colors.primary} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tcr-logo-secondary.png" alt="The Common Room" width={120} height={26} />
        </div>

        {children}
      </main>
    </div>
  );
}
