import { createSessionClient } from './supabase-server';
import { createAdminClient } from './supabase-admin';

export type AdminGuardResult =
  | { ok: true; userId: string }
  | { ok: false; response: Response };

export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createSessionClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) };
  }

  return { ok: true, userId: user.id };
}
