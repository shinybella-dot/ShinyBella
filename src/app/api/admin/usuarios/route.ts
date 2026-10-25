import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const rol = searchParams.get('rol');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'creado_en';
    const order = searchParams.get('order') || 'desc';

    let query = supabase
      .from('profiles')
      .select(`
        id,
        nombre,
        telefono,
        rol,
        creado_en,
        auth_users!inner(email, last_sign_in_at)
      `, { count: 'exact' });

    if (rol && rol !== 'todos') {
      query = query.eq('rol', rol);
    }

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,auth_users.email.ilike.%${search}%`);
    }

    query = query.order(sort, { ascending: order === 'asc' });
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const usuarios = (data || []).map((u: any) => ({
      id: u.id,
      email: u.auth_users?.email || '',
      nombre: u.nombre,
      telefono: u.telefono,
      rol: u.rol,
      creado_en: u.creado_en,
      last_sign_in_at: u.auth_users?.last_sign_in_at,
    }));

    return NextResponse.json({
      usuarios,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}