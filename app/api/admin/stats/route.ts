import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase-admin';
import { statsLimiter, checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const limited = await checkRateLimit(statsLimiter, guard.userId);
  if (limited) return limited;

  const admin = createAdminClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: usersWithSelections },
    { count: totalReflections },
    { count: totalNotes },
    { count: newUsersThisMonth },
    { count: reflectionsThisMonth },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('user_adopt_selections').select('user_id', { count: 'exact', head: true }),
    admin.from('reflections').select('id', { count: 'exact', head: true }),
    admin.from('user_notes').select('id', { count: 'exact', head: true }).not('submitted_at', 'is', null),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    admin.from('reflections').select('id', { count: 'exact', head: true }).gte('generated_at', startOfMonth),
    admin.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at'),
  ]);

  // Bucket registrations by day
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const u of recentUsers ?? []) {
    const day = u.created_at.slice(0, 10);
    if (day in dayMap) dayMap[day]++;
  }
  const registrationsByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  // Unique active users (distinct user_ids with selections)
  const { data: selectionUsers } = await admin
    .from('user_adopt_selections')
    .select('user_id');
  const uniqueActiveUsers = new Set(selectionUsers?.map((s) => s.user_id) ?? []).size;

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    uniqueActiveUsers,
    totalReflections: totalReflections ?? 0,
    totalNotes: totalNotes ?? 0,
    newUsersThisMonth: newUsersThisMonth ?? 0,
    reflectionsThisMonth: reflectionsThisMonth ?? 0,
    registrationsByDay,
  });
}
