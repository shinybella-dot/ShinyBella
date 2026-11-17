import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { isApiError, requireAdmin } from '@/lib/api-auth';

const SORT_COLUMNS = ['creado_en', 'created_at', 'nombre', 'direccion', 'estado', 'rol'];

function sanitizeSearch(value: string) {
  return value.replace(/[\\,().]/g, (char) => `\\${char}`);
}

function sanitizeSort(value: string | null, fallback: string) {
  return value && SORT_COLUMNS.includes(value) ? value : fallback;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isApiError(auth)) return auth;

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('pageSize') || '10', 10) || 10));
    const estado = searchParams.get('estado');
    const search = searchParams.get('search');
    const sort = sanitizeSort(searchParams.get('sort'), 'created_at');
    const order = searchParams.get('order') || 'desc';

    let query = supabase
      .from('salones')
      .select('*', { count: 'exact' });

    if (estado && estado !== 'todos') {
      query = query.eq('estado_verificacion', estado);
    }

    if (search) {
      const safeSearch = sanitizeSearch(search);
      query = query.or(`nombre.ilike.%${safeSearch}%,direccion.ilike.%${safeSearch}%`);
    }

    query = query.order(sort, { ascending: order === 'asc' });
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      salones: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching salones:', error);
    return NextResponse.json({ error: 'Error al obtener salones' }, { status: 500 });
  }
}
