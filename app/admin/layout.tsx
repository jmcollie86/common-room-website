'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Layers, Download, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

const navItems = [
  { label: 'Overview', href: '/admin', Icon: LayoutDashboard, exact: true },
  { label: 'Users', href: '/admin/users', Icon: Users, exact: false },
  { label: 'Themes', href: '/admin/themes', Icon: Layers, exact: false },
  { label: 'Export', href: '/admin/export', Icon: Download, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.is_admin) { router.replace('/dashboard'); return; }
      setChecking(false);
    }
    check();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 w-56 xl:w-64 flex flex-col bg-white z-40"
        style={{ borderRight: `1px solid ${Colors.secondary}40` }}
      >
        {/* Logo + admin badge */}
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${Colors.secondary}30` }}>
          <Image src="/logo.png" alt="The Common Room" width={150} height={32} />
          <span
            className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ backgroundColor: Colors.accent + '40', color: Colors.primary }}
          >
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {navItems.map(({ label, href, Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
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

        {/* Back to app */}
        <div className="p-3" style={{ borderTop: `1px solid ${Colors.secondary}30` }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-primary/5"
            style={{ color: Colors.subtext }}
          >
            <ArrowLeft size={16} />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-56 xl:ml-64 flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
