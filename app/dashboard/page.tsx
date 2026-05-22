'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchSelectedThemesWithDetails } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { AppShell } from '@/components/AppShell';
import { User } from 'lucide-react';

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
      <div className="px-5 pb-36 pt-3">

        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-georgia text-primary text-[28px] leading-[36px]">My Purpose</h1>
            {userName && (
              <p className="text-subtext text-sm mt-1">{userName}&apos;s selected themes</p>
            )}
          </div>
          <Link
            href="/profile"
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Profile"
          >
            <User size={22} color={Colors.primary} />
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center pt-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && selectedThemes.length === 0 && (
          <div className="flex flex-col items-center pt-12 px-4 text-center">
            <h2 className="font-georgia text-primary text-xl mb-3">
              Your themes will appear here once selected
            </h2>
            <p className="text-subtext text-sm leading-relaxed mb-8">
              Head to the Themes tab to choose up to 10 ADOPT themes that feel most relevant to
              you right now.
            </p>
            <Link
              href="/adopt"
              className="flex items-center justify-center min-h-[50px] px-7 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Choose Themes
            </Link>
          </div>
        )}

        {/* Theme list */}
        {!isLoading && selectedThemes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-subtext uppercase tracking-wider mb-4">
              {selectedThemes.length} theme{selectedThemes.length !== 1 ? 's' : ''} selected
            </p>

            <div className="flex flex-col gap-3">
              {selectedThemes.map((item, index) => {
                const theme = item.adopt_themes;
                const categoryColor = theme.category_colour ?? Colors.secondary;

                return (
                  <div
                    key={item.theme_id}
                    className="flex rounded-xl overflow-hidden bg-white"
                  >
                    {/* Left colour bar */}
                    <div style={{ width: 5, backgroundColor: categoryColor, flexShrink: 0 }} />

                    {/* Number */}
                    <div
                      className="flex items-center justify-center w-11 shrink-0"
                      style={{ backgroundColor: categoryColor + '30' }}
                    >
                      <span className="font-georgia text-lg text-primary font-semibold">
                        {index + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-3.5 py-3.5">
                      <p className="font-georgia text-base text-ink leading-[22px] mb-1.5">
                        {theme.theme}
                      </p>
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs text-ink"
                        style={{ backgroundColor: categoryColor }}
                      >
                        {theme.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      {!isLoading && selectedThemes.length > 0 && (
        <div
          className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-5 pt-3 pb-5 bg-background border-t"
          style={{ borderColor: Colors.secondary + '60' }}
        >
          <Link
            href="/reflections"
            className="flex items-center justify-center min-h-[52px] rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 transition-opacity mb-2.5"
          >
            View Reflections
          </Link>
          <Link
            href="/adopt"
            className="flex items-center justify-center min-h-[44px] rounded-xl text-primary text-sm border-[1.5px] border-primary/25 hover:bg-primary/5 transition-colors"
          >
            Edit Themes
          </Link>
        </div>
      )}
    </AppShell>
  );
}
