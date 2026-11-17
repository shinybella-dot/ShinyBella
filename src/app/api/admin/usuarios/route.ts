import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { isApiError, requireAdmin } from '@/lib/api-auth';

const SORT_COLUMNS = ['creado_en', 'created_at', 'nombre', 'direccion', 'estado', 'rol'];

interface ProfileRow {
  id: string;
  nombre: string | null;
  telefono: string | null;
  rol: 'cliente' | 'negocio' | 'admin';
  creado_en: string;
  email?: string | null;
}

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
    const rol = searchParams.get('rol');
    const search = searchParams.get('search');
    const sort = sanitizeSort(searchParams.get('sort'), 'creado_en');
    const ascending = searchParams.get('order') === 'asc';
    const safeSearch = search ? sanitizeSearch(search) : '';
    const rangeStart = (page - 1) * pageSize;
    const rangeEnd = page * pageSize - 1;

    const buildQuery = (withEmail: boolean) => {
      let query = supabase
        .from('profiles')
        .select(
          withEmail
            ? 'id, nombre, telefono, rol, creado_en, email'
            : 'id, nombre, telefono, rol, creado_en',
          { count: 'exact' }
        );

      if (rol && rol !== 'todos') {
        query = query.eq('rol', rol);
      }

      if (safeSearch) {
        query = query.or(
          withEmail
            ? `nombre.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`
            : `nombre.ilike.%${safeSearch}%`
        );
      }

      return query.order(sort, { ascending }).range(rangeStart, rangeEnd);
    };

    let result = await buildQuery(true);
    if (result.error) {
      result = await buildQuery(false);
    }
    if (result.error) throw result.error;

    const rows = (result.data || []) as unknown as ProfileRow[];
    const usuarios = rows.map((u) => ({
      id: u.id,
      email: u.email || '',
      nombre: u.nombre,
      telefono: u.telefono,
      rol: u.rol,
      creado_en: u.creado_en,
      last_sign_in_at: null,
    }));

    return NextResponse.json({
      usuarios,
      total: result.count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}
