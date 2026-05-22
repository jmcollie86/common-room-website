'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchAdoptThemes, fetchUserSelections, addThemeSelection, removeThemeSelection } from '@/lib/api';
import { Database } from '@/lib/database.types';
import { Colors } from '@/constants/theme';
import { AppShell } from '@/components/AppShell';
import { ThemeCard } from '@/components/ThemeCard';
import { ThemeInfoModal } from '@/components/ThemeInfoModal';

type AdoptTheme = Database['public']['Tables']['adopt_themes']['Row'];

const CATEGORY_SHORT: Record<string, string> = {
  'Creativity, culture and legacy': 'Creativity',
  'Health and wellbeing': 'Health',
  'Lifework and resilience': 'Lifework',
  'Relationships and belonging': 'Relationships',
  'Self development and inner growth': 'Self & Growth',
};

const MAX_SELECTIONS = 10;

export default function AdoptPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [infoTheme, setInfoTheme] = useState<AdoptTheme | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/'); return; }
      setUserId(data.user.id);
    });
  }, [router]);

  const { data: themes = [], isLoading: themesLoading } = useQuery({
    queryKey: ['adopt-themes'],
    queryFn: fetchAdoptThemes,
    staleTime: Infinity,
  });

  const { data: selectedIds = [] } = useQuery({
    queryKey: ['user-selections', userId],
    queryFn: () => fetchUserSelections(userId!),
    enabled: !!userId,
  });

  async function toggleSelection(themeId: number) {
    if (!userId) return;
    const isSelected = selectedIds.includes(themeId);
    if (!isSelected && selectedIds.length >= MAX_SELECTIONS) return;

    const next = isSelected
      ? selectedIds.filter((id) => id !== themeId)
      : [...selectedIds, themeId];
    queryClient.setQueryData(['user-selections', userId], next);

    try {
      if (isSelected) {
        await removeThemeSelection(userId, themeId);
      } else {
        await addThemeSelection(userId, themeId);
      }
    } catch {
      queryClient.setQueryData(['user-selections', userId], selectedIds);
    }
  }

  const categories = useMemo(() => {
    const cats = [...new Set(themes.map((t) => t.category))].sort();
    return ['All', ...cats];
  }, [themes]);

  type Section = { title: string; data: AdoptTheme[] };

  const sections: Section[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = themes;
    if (q) {
      filtered = themes.filter(
        (t) =>
          t.theme.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'All') {
      filtered = filtered.filter((t) => t.category === activeCategory);
    }

    if (activeCategory !== 'All' || q) {
      return [{ title: activeCategory !== 'All' ? activeCategory : 'Results', data: filtered }];
    }

    const grouped: Record<string, AdoptTheme[]> = {};
    for (const theme of filtered) {
      if (!grouped[theme.category]) grouped[theme.category] = [];
      grouped[theme.category].push(theme);
    }
    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [themes, search, activeCategory]);

  const atMax = selectedIds.length >= MAX_SELECTIONS;
  const showGroupHeaders = activeCategory === 'All' && search.trim() === '';

  return (
    <AppShell active="adopt">
      <div className="px-5 pt-2 pb-36">

        {/* Header */}
        <div className="mb-1">
          <h1 className="font-georgia text-primary text-[26px] leading-[34px]">ADOPT Themes</h1>
          <p className="text-subtext text-xs mt-1">
            {selectedIds.length} / {MAX_SELECTIONS} selected
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border-[1.5px] border-secondary rounded-xl px-3.5 my-3 min-h-[48px] gap-2 focus-within:border-primary transition-colors">
          <span className="text-subtext text-base">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search themes…"
            className="flex-1 text-sm text-ink placeholder:text-subtext bg-transparent focus:outline-none"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3.5 py-2 min-h-[36px] rounded-full border-[1.5px] text-xs transition-colors ${
                  isActive
                    ? 'bg-primary border-primary text-white font-semibold'
                    : 'bg-white border-secondary text-ink hover:border-primary/50'
                }`}
              >
                {cat === 'All' ? 'All' : (CATEGORY_SHORT[cat] ?? cat)}
              </button>
            );
          })}
        </div>

        {/* Max banner */}
        {atMax && (
          <div
            className="rounded-lg p-3 mb-2 text-xs text-ink leading-5"
            style={{ backgroundColor: Colors.accent + '30' }}
          >
            You&apos;ve selected 10 themes — remove one to add another.
          </div>
        )}

        {/* Theme list */}
        {themesLoading ? (
          <div className="flex flex-col items-center justify-center pt-16 gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-subtext text-sm">Loading themes…</p>
          </div>
        ) : (
          <div>
            {sections.map((section) => (
              <div key={section.title}>
                {showGroupHeaders && (
                  <p className="text-xs font-semibold text-subtext uppercase tracking-wider pt-4 pb-2">
                    {section.title}
                  </p>
                )}
                {section.data.length === 0 && (
                  <p className="text-subtext text-sm text-center pt-12">No themes match your search.</p>
                )}
                {section.data.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    selected={selectedIds.includes(theme.id)}
                    disabled={atMax && !selectedIds.includes(theme.id)}
                    onSelect={() => toggleSelection(theme.id)}
                    onInfo={() => setInfoTheme(theme)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      {selectedIds.length > 0 && (
        <div
          className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-5 pt-3 pb-5 bg-background border-t"
          style={{ borderColor: Colors.secondary + '60' }}
        >
          <Link
            href="/dashboard"
            className="flex items-center justify-center min-h-[52px] rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90 transition-opacity"
          >
            View My Purpose
          </Link>
        </div>
      )}

      <ThemeInfoModal theme={infoTheme} onClose={() => setInfoTheme(null)} />
    </AppShell>
  );
}
