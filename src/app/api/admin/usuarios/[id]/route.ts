import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { isApiError, requireAdmin } from '@/lib/api-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isApiError(auth)) return auth;

  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    const { rol } = body;

    if (!['cliente', 'negocio', 'admin'].includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ rol })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error updating user rol:', error);
    return NextResponse.json({ error: 'Error al cambiar rol' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isApiError(auth)) return auth;

  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { error } = await supabase
      .from('profiles')
      .update({ banned_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await supabase.auth.admin.signOut(id);

    return NextResponse.json({ success: true, message: 'Usuario baneado' });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json({ error: 'Error al banear usuario' }, { status: 500 });
  }
}
