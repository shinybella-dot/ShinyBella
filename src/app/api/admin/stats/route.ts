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

    const [
      { count: solicitudesPendientes },
      { count: solicitudesTotales },
      { count: negociosActivos },
      { count: usuariosTotal },
      { data: citasSemana },
      { data: solicitudesPorEstado },
      { data: solicitudesUltimos30Dias },
      { data: mrrData },
      { data: usuariosPorRol },
      { data: citasPorMes },
      { data: ingresosPorMes },
    ] = await Promise.all([
      supabase.from('solicitudes_afiliacion').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('solicitudes_afiliacion').select('*', { count: 'exact', head: true }),
      supabase.from('salones').select('*', { count: 'exact', head: true }).eq('activo', true).eq('estado_verificacion', 'aprobada'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('reservas')
        .select('id', { count: 'exact', head: true })
        .gte('fecha', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      supabase.from('solicitudes_afiliacion').select('estado'),
      supabase
        .from('solicitudes_afiliacion')
        .select('creado_en')
        .gte('creado_en', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('salones').select('stripe_subscription_id, plan_activo').eq('estado_verificacion', 'aprobada'),
      supabase.from('profiles').select('rol'),
      supabase
        .from('reservas')
        .select('fecha')
        .gte('fecha', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      supabase.from('salones').select('stripe_subscription_id, plan_activo, created_at').eq('estado_verificacion', 'aprobada'),
    ]);

    const estadoCounts = solicitudesPorEstado?.reduce((acc, s) => {
      acc[s.estado] = (acc[s.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const diasUltimos30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const solicitudesPorDia = diasUltimos30.map((dia) => ({
      dia,
      count: solicitudesUltimos30Dias?.filter(s => s.creado_en.startsWith(dia)).length || 0,
    }));

    const rolCounts = usuariosPorRol?.reduce((acc, u) => {
      acc[u.rol] = (acc[u.rol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const mesesUltimos12 = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toISOString().split('T')[0].slice(0, 7); // YYYY-MM
    }).reverse();

    const citasPorMesData = mesesUltimos12.map((mes) => ({
      mes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      count: citasPorMes?.filter(c => c.fecha.startsWith(mes)).length || 0,
    }));

    const mrr = mrrData?.reduce((sum, s) => {
      if (s.stripe_subscription_id && s.plan_activo === 'basico') return sum + 60.10;
      return sum;
    }, 0) || 0;

    const ingresosPorMesData = mesesUltimos12.map((mes) => {
      const suscripcionesMes = ingresosPorMes?.filter(s =>
        s.stripe_subscription_id &&
        s.plan_activo === 'basico' &&
        s.created_at.startsWith(mes)
      ).length || 0;
      return {
        mes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        mrr: suscripcionesMes * 60.10,
      };
    });

    return NextResponse.json({
      kpis: {
        solicitudesPendientes: solicitudesPendientes || 0,
        solicitudesTotales: solicitudesTotales || 0,
        negociosActivos: negociosActivos || 0,
        usuariosTotal: usuariosTotal || 0,
        citasSemana: citasSemana || 0,
        mrr,
      },
      charts: {
        solicitudesPorEstado: estadoCounts,
        solicitudesPorDia: solicitudesPorDia,
        usuariosPorRol: rolCounts,
        citasPorMes: citasPorMesData,
        ingresosPorMes: ingresosPorMesData,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}