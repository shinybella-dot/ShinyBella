import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey);
}

function generateFolio() {
  return `AF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      nombreSalon, tipo, direccion, telefono, email, descripcion, horario,
      lat, lng,
      responsable, dui_nit, cargo,
      dui_url, patente_url, selfie_url,
    } = body;

    if (!nombreSalon || !direccion || !responsable) {
      return NextResponse.json(
        { error: 'Campos obligatorios faltantes: nombreSalon, direccion, responsable' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const { data: existingEmail } = await supabase
      .from('salones')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json({ error: 'Ya existe un salón con este email' }, { status: 400 });
    }

    const salonId = generateFolio().replace('AF-', '').replace(/^\d{4}-/, '');

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: {
        nombre: responsable,
        telefono,
        rol: 'negocio',
      },
    });

    if (authError) {
      console.error('Auth create error:', authError);
      return NextResponse.json({ error: 'Error creando usuario: ' + authError.message }, { status: 500 });
    }

    const ownerId = authUser.user.id;

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: ownerId,
        nombre: responsable,
        telefono,
        rol: 'negocio',
      });

    if (profileError) console.warn('Profile upsert warning:', profileError);

    const { error: salonError } = await supabase.from('salones').insert({
      id: salonId,
      nombre: nombreSalon,
      direccion,
      lat: lat || 13.9941,
      lng: lng || -89.5557,
      telefono,
      rating: 0,
      imagen_url: null,
      activo: false,
      owner_id: ownerId,
      estado_verificacion: 'pendiente',
    });

    if (salonError) {
      await supabase.auth.admin.deleteUser(ownerId);
      console.error('Salon insert error:', salonError);
      return NextResponse.json({ error: 'Error creando salón: ' + salonError.message }, { status: 500 });
    }

    const folio = generateFolio();

    const { error: solicitudError } = await supabase.from('solicitudes_afiliacion').insert({
      salon_id: salonId,
      owner_id: ownerId,
      datos_negocio: {
        nombreSalon,
        tipo,
        direccion,
        telefono,
        email,
        descripcion,
        horario,
        lat,
        lng,
      },
      datos_responsable: {
        responsable,
        dui_nit,
        cargo,
        email,
        telefono,
      },
      documentos: {
        dui_url,
        patente_url,
        selfie_url,
      },
      estado: 'pendiente',
    });

    if (solicitudError) {
      await supabase.from('salones').delete().eq('id', salonId);
      await supabase.auth.admin.deleteUser(ownerId);
      console.error('Solicitud insert error:', solicitudError);
      return NextResponse.json({ error: 'Error guardando solicitud: ' + solicitudError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      folio,
      salonId,
      message: 'Solicitud enviada correctamente. Revisión en 24-48h.',
    });

  } catch (error: any) {
    console.error('Afiliacion error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}