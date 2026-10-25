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
    const estado = searchParams.get('estado');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    let query = supabase
      .from('salones')
      .select('*', { count: 'exact' });

    if (estado && estado !== 'todos') {
      query = query.eq('estado_verificacion', estado);
    }

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,direccion.ilike.%${search}%`);
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