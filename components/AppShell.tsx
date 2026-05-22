'use client';

import Link from 'next/link';
import { LayoutDashboard, Layers, Sparkles, FileText } from 'lucide-react';
import { Colors } from '@/constants/theme';

type Tab = 'dashboard' | 'adopt' | 'reflections' | 'notes';

const tabs = [
  { id: 'dashboard' as Tab, label: 'Purpose', href: '/dashboard', Icon: LayoutDashboard },
  { id: 'adopt' as Tab, label: 'Themes', href: '/adopt', Icon: Layers },
  { id: 'reflections' as Tab, label: 'Reflect', href: '/reflections', Icon: Sparkles },
  { id: 'notes' as Tab, label: 'Note', href: '/notes', Icon: FileText },
];

interface AppShellProps {
  active: Tab;
  children: React.ReactNode;
}

export function AppShell({ active, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Scrollable content area */}
      <main className="flex-1 max-w-lg mx-auto w-full overflow-y-auto">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-background border-t flex"
        style={{ borderColor: Colors.secondary + '60' }}
      >
        <div className="max-w-lg mx-auto w-full flex">
          {tabs.map(({ id, label, href, Icon }) => {
            const isActive = id === active;
            return (
              <Link
                key={id}
                href={href}
                className="flex-1 flex flex-col items-center justify-center py-2.5 min-h-[56px] transition-opacity"
                style={{ color: isActive ? Colors.primary : Colors.subtext }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span
                  className="text-[10px] mt-1"
                  style={{ fontWeight: isActive ? 600 : 400 }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
