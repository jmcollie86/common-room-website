'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Layers, Download, ArrowLeft, Menu, X } from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/'); return; }
      const { data: profile } = await supabase
        .from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
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

  const sidebarContent = (
    <>
      <div className="px-6 py-5 flex items-center justify-between b-b-sm">
        <div>
          <Image src="/logo.png" alt="The Common Room" width={150} height={32} />
          <span
            className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ backgroundColor: Colors.accent + '40', color: Colors.primary }}
          >
            Admin
          </span>
        </div>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-primary/5" aria-label="Close menu">
          <X size={20} color={Colors.subtext} />
        </button>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {navItems.map(({ label, href, Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
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

      <div className="p-3 b-t-sm">
        <Link href="/dashboard" onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-primary/5"
          style={{ color: Colors.subtext }}
        >
          <ArrowLeft size={16} />
          Back to app
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className="fixed inset-y-0 left-0 w-64 lg:w-56 xl:w-64 flex flex-col bg-white z-40 b-r">
        <div className={`flex flex-col h-full ${mobileOpen ? 'flex' : 'hidden lg:flex'}`}>
          {sidebarContent}
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-y-auto lg:ml-56 xl:ml-64">
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-background lg:hidden b-b-sm">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-primary/5 transition-colors" aria-label="Open menu">
            <Menu size={20} color={Colors.primary} />
          </button>
          <span className="text-sm font-semibold text-primary">Admin</span>
        </div>
        {children}
      </main>
    </div>
  );
}
