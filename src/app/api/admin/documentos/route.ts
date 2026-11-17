import { NextRequest, NextResponse } from 'next/server';
import { isApiError, requireAdmin } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isApiError(auth)) return auth;

  const path = new URL(request.url).searchParams.get('path');
  if (
    typeof path !== 'string' ||
    !path.startsWith('solicitudes/') ||
    path.includes('\\') ||
    path.includes('\0') ||
    path.split('/').includes('..')
  ) {
    return NextResponse.json({ error: 'Path inválido' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: { session } } = await auth.supabase.auth.getSession();
      if (session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        if (sessionError) console.error('Error propagando sesión admin:', sessionError.message);
      }
    }

    const { data, error } = await supabase
      .storage
      .from('verificaciones')
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      console.error('Error creando signed URL:', error?.message ?? 'sin URL');
      return NextResponse.json({ error: 'No se pudo abrir el documento' }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error) {
    console.error('Error en /api/admin/documentos:', error);
    return NextResponse.json({ error: 'No se pudo abrir el documento' }, { status: 500 });
  }
}
