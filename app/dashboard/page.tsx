'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchSelectedThemesWithDetails } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { AppShell } from '@/components/AppShell';

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/'); return; }
      setUserId(data.user.id);
    });
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setUserName(data.full_name.split(' ')[0]);
      });
  }, [userId]);

  const { data: selectedThemes = [], isLoading } = useQuery({
    queryKey: ['selected-themes-details', userId],
    queryFn: () => fetchSelectedThemesWithDetails(userId!),
    enabled: !!userId,
  });

  return (
    <AppShell active="dashboard">
      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-georgia text-primary text-4xl leading-tight">My Purpose</h1>
          {userName && (
            <p className="text-subtext text-base mt-2">{userName}&apos;s selected themes</p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center pt-20">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && selectedThemes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="font-georgia text-primary text-2xl mb-3">
              Your themes will appear here once selected
            </h2>
            <p className="text-subtext text-base leading-relaxed mb-8 max-w-md">
              Head to ADOPT Themes to choose up to 10 themes that feel most relevant to you right now.
            </p>
            <Link
              href="/adopt"
              className="flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Choose ADOPT Themes
            </Link>
          </div>
        )}

        {/* Theme grid */}
        {!isLoading && selectedThemes.length > 0 && (
          <>
            <p className="text-xs font-semibold text-subtext uppercase tracking-wider mb-5">
              {selectedThemes.length} of 10 themes selected
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
              {selectedThemes.map((item, index) => {
                const theme = item.adopt_themes;
                const categoryColor = theme.category_colour ?? Colors.secondary;

                return (
                  <div
                    key={item.theme_id}
                    className="flex rounded-xl overflow-hidden bg-white shadow-sm"
                  >
                    <div style={{ width: 5, backgroundColor: categoryColor, flexShrink: 0 }} />
                    <div
                      className="flex items-center justify-center w-12 shrink-0 text-lg font-georgia font-semibold text-primary"
                      style={{ backgroundColor: categoryColor + '30' }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 px-4 py-4">
                      <p className="font-georgia text-base text-ink leading-snug mb-2">
                        {theme.theme}
                      </p>
                      <span
                        className="inline-block rounded-full px-3 py-0.5 text-xs text-ink"
                        style={{ backgroundColor: categoryColor }}
                      >
                        {theme.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline CTAs */}
            <div className="flex gap-3">
              <Link
                href="/reflections"
                className="flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                View AI Reflection
              </Link>
              <Link
                href="/adopt"
                className="flex items-center justify-center h-12 px-8 rounded-xl border-[1.5px] border-primary/30 text-primary text-sm hover:bg-primary/5 transition-colors"
              >
                Edit ADOPT Themes
              </Link>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
