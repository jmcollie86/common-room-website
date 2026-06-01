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

  const { data: themes = [], isLoading: themesLoading, isError: themesError } = useQuery({
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
  const showGroupHeaders = search.trim() === ''; // show full category heading whenever not searching

  return (
    <AppShell active="adopt">
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-georgia text-primary text-4xl leading-tight">ADOPT Themes</h1>
            <p className="text-subtext text-sm mt-2">
              {selectedIds.length} of {MAX_SELECTIONS} selected
              {atMax && <span className="ml-2 text-xs" style={{ color: Colors.accent }}>— remove one to add another</span>}
            </p>
          </div>

          {selectedIds.length > 0 && (
            <Link
              href="/dashboard"
              className="self-start md:self-auto flex items-center justify-center h-11 px-7 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
            >
              View Selection
            </Link>
          )}
        </div>

        {/* Search + category filters row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center bg-white border-[1.5px] border-secondary rounded-xl px-4 min-h-[44px] gap-2 focus-within:border-primary transition-colors flex-1">
            <span className="text-subtext">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search themes…"
              className="flex-1 text-sm text-ink placeholder:text-subtext bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-2 min-h-[44px] rounded-xl border-[1.5px] text-sm transition-colors ${
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
        </div>

        {/* Theme grid */}
        {themesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-subtext text-sm">Loading themes…</p>
          </div>
        ) : themesError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm" style={{ color: Colors.error }}>Unable to load themes. Please try refreshing the page.</p>
          </div>
        ) : (
          <div>
            {sections.map((section) => (
              <div key={section.title}>
                {showGroupHeaders && (
                  <p className="text-xs font-semibold text-subtext uppercase tracking-wider pt-6 pb-3">
                    {section.title}
                  </p>
                )}
                {section.data.length === 0 && (
                  <p className="text-subtext text-sm text-center py-16">No themes match your search.</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
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
              </div>
            ))}
          </div>
        )}
      </div>

      <ThemeInfoModal theme={infoTheme} onClose={() => setInfoTheme(null)} />
    </AppShell>
  );
}
