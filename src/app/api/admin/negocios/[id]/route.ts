import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    const { activo } = body;

    if (typeof activo !== 'boolean') {
      return NextResponse.json({ error: 'Campo "activo" requerido (boolean)' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('salones')
      .update({ activo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, salon: data });
  } catch (error) {
    console.error('Error updating salon:', error);
    return NextResponse.json({ error: 'Error al actualizar salón' }, { status: 500 });
  }
}