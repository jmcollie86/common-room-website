import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const admin = createAdminClient();

  const [{ data: themes }, { data: selections }] = await Promise.all([
    admin.from('adopt_themes').select('id, theme, category, category_colour').order('category').order('theme'),
    admin.from('user_adopt_selections').select('theme_id'),
  ]);

  const countMap: Record<number, number> = {};
  for (const s of selections ?? []) {
    countMap[s.theme_id] = (countMap[s.theme_id] ?? 0) + 1;
  }

  const result = (themes ?? []).map((t) => ({
    id: t.id,
    theme: t.theme,
    category: t.category,
    category_colour: t.category_colour,
    selectionCount: countMap[t.id] ?? 0,
  }));

  // Category summary
  const categorySummary: Record<string, { total: number; colour: string | null }> = {};
  for (const t of result) {
    if (!categorySummary[t.category]) {
      categorySummary[t.category] = { total: 0, colour: t.category_colour };
    }
    categorySummary[t.category].total += t.selectionCount;
  }

  return NextResponse.json({
    themes: result,
    categorySummary: Object.entries(categorySummary).map(([category, { total, colour }]) => ({
      category,
      total,
      colour,
    })),
  });
}
