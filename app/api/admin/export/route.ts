import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase-admin';
import { exportLimiter, checkRateLimit } from '@/lib/rate-limit';

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
}

const EXPORT_LIMIT = 5000;

const VALID_TYPES = new Set(['users', 'selections', 'reflections', 'notes']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const limited = await checkRateLimit(exportLimiter, guard.userId);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? 'users';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!VALID_TYPES.has(type)) {
    return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 });
  }
  if (from && !ISO_DATE.test(from)) {
    return new Response(JSON.stringify({ error: 'Invalid from date' }), { status: 400 });
  }
  if (to && !ISO_DATE.test(to)) {
    return new Response(JSON.stringify({ error: 'Invalid to date' }), { status: 400 });
  }

  const admin = createAdminClient();
  let csv = '';
  let filename = `tcr-${type}`;

  if (type === 'users') {
    let q = admin
      .from('profiles')
      .select('id, full_name, gender, year_of_birth, home_postcode, created_at, is_admin')
      .order('created_at', { ascending: false })
      .limit(EXPORT_LIMIT);
    if (from) q = q.gte('created_at', from);
    if (to) q = q.lte('created_at', to + 'T23:59:59Z');
    const { data } = await q;

    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const emailMap: Record<string, string> = {};
    for (const u of authUsers?.users ?? []) emailMap[u.id] = u.email ?? '';

    csv = toCSV(
      (data ?? []).map((p) => ({
        id: p.id,
        email: emailMap[p.id] ?? '',
        full_name: p.full_name ?? '',
        gender: p.gender ?? '',
        year_of_birth: p.year_of_birth ?? '',
        home_postcode: p.home_postcode ?? '',
        created_at: p.created_at,
        is_admin: p.is_admin,
      }))
    );
    filename = `tcr-users-${from ?? 'all'}-to-${to ?? 'now'}`;

  } else if (type === 'selections') {
    let q = admin
      .from('user_adopt_selections')
      .select('id, user_id, theme_id, selected_at, adopt_themes(theme, category)')
      .order('selected_at', { ascending: false })
      .limit(EXPORT_LIMIT);
    if (from) q = q.gte('selected_at', from);
    if (to) q = q.lte('selected_at', to + 'T23:59:59Z');
    const { data } = await q;

    type SelectionRow = { id: string; user_id: string; theme_id: number; selected_at: string; adopt_themes: { theme: string; category: string } | null };
    csv = toCSV(
      (data ?? []).map((s: SelectionRow) => ({
        id: s.id,
        user_id: s.user_id,
        theme_id: s.theme_id,
        theme: s.adopt_themes?.theme ?? '',
        category: s.adopt_themes?.category ?? '',
        selected_at: s.selected_at,
      }))
    );
    filename = `tcr-selections-${from ?? 'all'}-to-${to ?? 'now'}`;

  } else if (type === 'reflections') {
    let q = admin
      .from('reflections')
      .select('id, user_id, generated_at, theme_ids, content')
      .order('generated_at', { ascending: false })
      .limit(EXPORT_LIMIT);
    if (from) q = q.gte('generated_at', from);
    if (to) q = q.lte('generated_at', to + 'T23:59:59Z');
    const { data } = await q;

    csv = toCSV(
      (data ?? []).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        generated_at: r.generated_at,
        theme_ids: (r.theme_ids ?? []).join(';'),
        reflection_1: (r.content as string[])[0] ?? '',
        reflection_2: (r.content as string[])[1] ?? '',
        reflection_3: (r.content as string[])[2] ?? '',
      }))
    );
    filename = `tcr-reflections-${from ?? 'all'}-to-${to ?? 'now'}`;

  } else if (type === 'notes') {
    let q = admin
      .from('user_notes')
      .select('id, user_id, content, updated_at, submitted_at')
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(EXPORT_LIMIT);
    if (from) q = q.gte('submitted_at', from);
    if (to) q = q.lte('submitted_at', to + 'T23:59:59Z');
    const { data } = await q;

    csv = toCSV(
      (data ?? []).map((n) => ({
        id: n.id,
        user_id: n.user_id,
        submitted_at: n.submitted_at ?? '',
        updated_at: n.updated_at,
        content: n.content ?? '',
      }))
    );
    filename = `tcr-notes-${from ?? 'all'}-to-${to ?? 'now'}`;
  }

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  });
}
