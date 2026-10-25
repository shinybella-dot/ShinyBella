import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSolicitudAprobadaEmail, sendSolicitudRechazadaEmail } from '@/lib/resend';

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
    const sort = searchParams.get('sort') || 'creado_en';
    const order = searchParams.get('order') || 'desc';

    let query = supabase
      .from('solicitudes_afiliacion')
      .select(`
        *,
        salones!solicitudes_afiliacion_salon_id_fkey (
          id,
          nombre,
          activo,
          estado_verificacion
        )
      `, { count: 'exact' });

    if (estado && estado !== 'todos') {
      query = query.eq('estado', estado);
    }

    if (search) {
      query = query.or(`datos_negocio->>nombreSalon.ilike.%${search}%,datos_responsable->>responsable.ilike.%${search}%,datos_responsable->>email.ilike.%${search}%`);
    }

    query = query.order(sort, { ascending: order === 'asc' });
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      solicitudes: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching solicitudes:', error);
    return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { action, solicitudId, motivo } = body;

    if (!['aprobar', 'rechazar'].includes(action)) {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
    }

    if (action === 'rechazar' && !motivo?.trim()) {
      return NextResponse.json({ error: 'Motivo requerido para rechazar' }, { status: 400 });
    }

    const { data: solicitud, error: fetchError } = await supabase
      .from('solicitudes_afiliacion')
      .select('*')
      .eq('id', solicitudId)
      .single();

    if (fetchError || !solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    if (action === 'aprobar') {
      const { error: updateSolicitudError } = await supabase
        .from('solicitudes_afiliacion')
        .update({
          estado: 'aprobada',
          revisado_en: new Date().toISOString(),
          revisado_por: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', solicitudId);

      if (updateSolicitudError) throw updateSolicitudError;

      const { error: updateSalonError } = await supabase
        .from('salones')
        .update({
          estado_verificacion: 'aprobada',
          verificado_at: new Date().toISOString(),
          activo: true,
        })
        .eq('id', solicitud.salon_id);

      if (updateSalonError) throw updateSalonError;

      await sendSolicitudAprobadaEmail(
        solicitud.datos_responsable.email,
        `AF-${new Date(solicitud.creado_en).getFullYear()}-${solicitud.id.slice(-4).toUpperCase()}`,
        solicitud.datos_negocio.nombreSalon,
        solicitud.salon_id
      );

      return NextResponse.json({ success: true, message: 'Solicitud aprobada' });
    }

    if (action === 'rechazar') {
      const { error: updateSolicitudError } = await supabase
        .from('solicitudes_afiliacion')
        .update({
          estado: 'rechazada',
          revisado_en: new Date().toISOString(),
          revisado_por: (await supabase.auth.getUser()).data.user?.id,
          admin_notas: motivo.trim(),
        })
        .eq('id', solicitudId);

      if (updateSolicitudError) throw updateSolicitudError;

      const { error: updateSalonError } = await supabase
        .from('salones')
        .update({
          estado_verificacion: 'rechazada',
          rechazado_motivo: motivo.trim(),
        })
        .eq('id', solicitud.salon_id);

      if (updateSalonError) throw updateSalonError;

      await sendSolicitudRechazadaEmail(
        solicitud.datos_responsable.email,
        `AF-${new Date(solicitud.creado_en).getFullYear()}-${solicitud.id.slice(-4).toUpperCase()}`,
        solicitud.datos_negocio.nombreSalon,
        motivo.trim()
      );

      return NextResponse.json({ success: true, message: 'Solicitud rechazada' });
    }

    return NextResponse.json({ error: 'Acción no implementada' }, { status: 500 });
  } catch (error) {
    console.error('Error processing solicitud:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}