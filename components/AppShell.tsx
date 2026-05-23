'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Layers, Sparkles, FileText, User, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

type Tab = 'dashboard' | 'adopt' | 'reflections' | 'notes';

const tabs = [
  { id: 'dashboard' as Tab, label: 'My Purpose', href: '/dashboard', Icon: LayoutDashboard },
  { id: 'adopt' as Tab, label: 'ADOPT Themes', href: '/adopt', Icon: Layers },
  { id: 'reflections' as Tab, label: 'Reflections', href: '/reflections', Icon: Sparkles },
  { id: 'notes' as Tab, label: 'My Note', href: '/notes', Icon: FileText },
];

interface AppShellProps {
  active: Tab;
  children: React.ReactNode;
}

export function AppShell({ active, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 w-56 xl:w-64 flex flex-col bg-white z-40"
        style={{ borderRight: `1px solid ${Colors.secondary}40` }}
      >
        {/* Logo */}
        <div className="px-6 py-6" style={{ borderBottom: `1px solid ${Colors.secondary}30` }}>
          <Link href="/dashboard">
            <Image src="/logo.png" alt="The Common Room" width={160} height={34} priority />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {tabs.map(({ id, label, href, Icon }) => {
            const isActive = id === active;
            return (
              <Link
                key={id}
                href={href}
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

        {/* Profile */}
        <div className="p-3" style={{ borderTop: `1px solid ${Colors.secondary}30` }}>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-primary/5"
            style={{ color: Colors.subtext }}
          >
            <User size={18} strokeWidth={1.8} />
            Profile
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 xl:ml-64 flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
