import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { wizardSchema, WizardData } from '@/lib/validations/negocio';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sendSolicitudRecibidaEmail } from '@/lib/resend';

function generateFolio() {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `AF-${year}-${suffix}`;
}

async function rollbackStep(label: string, operation: () => PromiseLike<{ error: unknown }>) {
  try {
    const { error } = await operation();
    if (error) console.error(`Rollback ${label} falló:`, error);
  } catch (error) {
    console.error(`Rollback ${label} lanzó excepción:`, error);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  let data: WizardData;
  try {
    data = wizardSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }
    console.error('Error validando solicitud:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json(
      { error: 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor' },
      { status: 503 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const {
      nombreSalon, tipo, direccion, telefono, email, descripcion, horario,
      lat, lng, responsable, dui_nit, cargo,
      dui_url, patente_url, selfie_url,
    } = data;

    const { data: existingEmail } = await supabase
      .from('salones')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json({ error: 'Ya existe un salón con este email' }, { status: 400 });
    }

    const folio = generateFolio();
    const salonId = folio.replace(/^AF-\d{4}-/, '');

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
      return NextResponse.json({ error: 'Error creando usuario' }, { status: 500 });
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

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      await rollbackStep('usuario', () => supabase.auth.admin.deleteUser(ownerId));
      return NextResponse.json({ error: 'Error creando el perfil' }, { status: 500 });
    }

    const { error: salonError } = await supabase.from('salones').insert({
      id: salonId,
      nombre: nombreSalon,
      direccion,
      lat: lat ?? null,
      lng: lng ?? null,
      telefono,
      rating: 0,
      imagen_url: null,
      activo: false,
      owner_id: ownerId,
      estado_verificacion: 'pendiente',
    });

    if (salonError) {
      console.error('Salon insert error:', salonError);
      await rollbackStep('perfil', () => supabase.from('profiles').delete().eq('id', ownerId));
      await rollbackStep('usuario', () => supabase.auth.admin.deleteUser(ownerId));
      return NextResponse.json({ error: 'Error creando salón' }, { status: 500 });
    }

    const { error: solicitudError } = await supabase.from('solicitudes_afiliacion').insert({
      folio,
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
      console.error('Solicitud insert error:', solicitudError);
      await rollbackStep('salón', () => supabase.from('salones').delete().eq('id', salonId));
      await rollbackStep('perfil', () => supabase.from('profiles').delete().eq('id', ownerId));
      await rollbackStep('usuario', () => supabase.auth.admin.deleteUser(ownerId));
      return NextResponse.json({ error: 'Error guardando solicitud' }, { status: 500 });
    }

    try {
      await sendSolicitudRecibidaEmail(email, folio, responsable);
    } catch (emailError) {
      console.error('Error enviando email de solicitud recibida:', emailError);
    }

    return NextResponse.json({
      success: true,
      folio,
      salonId,
      message: 'Solicitud enviada correctamente. Revisión en 24-48h.',
    });
  } catch (error) {
    console.error('Afiliacion error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
