import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { searchParams } = req.nextUrl;
  const themeIdsParam = searchParams.get('themeIds');

  if (!themeIdsParam) {
    return NextResponse.json({ error: 'Provide themeIds' }, { status: 400 });
  }

  const themeIds = themeIdsParam.split(',').map(Number).filter(Boolean);
  if (!themeIds.length) {
    return NextResponse.json({ users: [], count: 0 });
  }

  const admin = createAdminClient();

  const { data: selections } = await admin
    .from('user_adopt_selections')
    .select('user_id')
    .in('theme_id', themeIds);

  const userIds = [...new Set((selections ?? []).map((s) => s.user_id))];

  if (!userIds.length) {
    return NextResponse.json({ users: [], count: 0 });
  }

  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('profiles').select('id, full_name').in('id', userIds),
  ]);

  const emailMap: Record<string, string> = {};
  for (const u of authData?.users ?? []) emailMap[u.id] = u.email ?? '';

  const nameMap: Record<string, string> = {};
  for (const p of profiles ?? []) nameMap[p.id] = p.full_name ?? '';

  const users = userIds
    .map((id) => ({ name: nameMap[id] ?? '', email: emailMap[id] ?? '' }))
    .filter((u) => u.email);

  return NextResponse.json({ users, count: users.length });
}
