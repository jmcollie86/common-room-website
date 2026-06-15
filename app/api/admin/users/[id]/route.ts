import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase-admin';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

  const admin = createAdminClient();

  // Delete all user data from child tables before removing the auth user.
  // FK constraints have no ON DELETE CASCADE, so order matters.
  const tables = ['user_adopt_selections', 'reflections', 'user_notes'] as const;
  for (const table of tables) {
    const { error: delError } = await admin.from(table).delete().eq('user_id', id);
    if (delError) {
      console.error(`[delete-user] failed to delete from ${table}:`, delError);
      return NextResponse.json({ error: `Failed to delete user data from ${table}` }, { status: 500 });
    }
  }

  // profiles.id is a PK that references auth.users — delete it before the auth user
  const { error: profileError } = await admin.from('profiles').delete().eq('id', id);
  if (profileError) {
    console.error('[delete-user] failed to delete profile:', profileError);
    return NextResponse.json({ error: 'Failed to delete user profile' }, { status: 500 });
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    console.error('[delete-user]', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
