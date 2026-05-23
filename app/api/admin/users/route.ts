import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const admin = createAdminClient();

  // Fetch all profiles
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, full_name, gender, year_of_birth, home_postcode, created_at, is_admin')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get auth emails via admin auth API
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  for (const u of authUsers?.users ?? []) {
    emailMap[u.id] = u.email ?? '';
  }

  // Count selections and reflections per user
  const { data: selections } = await admin.from('user_adopt_selections').select('user_id');
  const { data: reflections } = await admin.from('reflections').select('user_id');
  const { data: notes } = await admin.from('user_notes').select('user_id').not('submitted_at', 'is', null);

  const selectionCount: Record<string, number> = {};
  for (const s of selections ?? []) selectionCount[s.user_id] = (selectionCount[s.user_id] ?? 0) + 1;

  const reflectionCount: Record<string, number> = {};
  for (const r of reflections ?? []) reflectionCount[r.user_id] = (reflectionCount[r.user_id] ?? 0) + 1;

  const hasNote = new Set((notes ?? []).map((n) => n.user_id));

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    email: emailMap[p.id] ?? '',
    full_name: p.full_name,
    gender: p.gender,
    year_of_birth: p.year_of_birth,
    home_postcode: p.home_postcode,
    created_at: p.created_at,
    is_admin: p.is_admin,
    themeCount: selectionCount[p.id] ?? 0,
    reflectionCount: reflectionCount[p.id] ?? 0,
    hasNote: hasNote.has(p.id),
  }));

  return NextResponse.json({ users });
}
