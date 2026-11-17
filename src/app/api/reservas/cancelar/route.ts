import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getApiAuth } from '@/lib/api-auth';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no configurada');
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-08-26.dahlia',
  });
}

export async function POST(request: NextRequest) {
  const auth = await getApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  let body: { reservaId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 });
  }

  const reservaId = typeof body?.reservaId === 'string' ? body.reservaId.trim() : '';
  if (!reservaId) {
    return NextResponse.json({ error: 'reservaId requerido' }, { status: 400 });
  }

  const { data: reserva, error: fetchError } = await auth.supabase
    .from('reservas')
    .select('id, user_id, estado, payment_intent_id')
    .eq('id', reservaId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error consultando reserva:', fetchError.message);
    return NextResponse.json({ error: 'Error al consultar la reserva' }, { status: 500 });
  }

  if (!reserva) {
    return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
  }

  if (reserva.user_id !== auth.user.id && auth.rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso para cancelar esta reserva' }, { status: 403 });
  }

  if (reserva.estado === 'cancelada') {
    return NextResponse.json({ success: true, reservaId, estado: 'cancelada', alreadyCancelled: true });
  }

  if (reserva.payment_intent_id) {
    try {
      const stripe = getStripe();
      await stripe.refunds.create({ payment_intent: reserva.payment_intent_id });
    } catch (refundError) {
      console.error('Error reembolsando payment_intent:', refundError);
      return NextResponse.json(
        { error: 'No se pudo reembolsar el pago. La reserva no fue cancelada.' },
        { status: 502 }
      );
    }
  }

  const { data: actualizada, error: updateError } = await auth.supabase
    .from('reservas')
    .update({ estado: 'cancelada' })
    .eq('id', reservaId)
    .select('id, estado')
    .single();

  if (updateError) {
    console.error('Error cancelando reserva tras reembolso:', updateError.message);
    return NextResponse.json(
      { error: 'El pago fue reembolsado pero no se pudo actualizar la reserva. Contacta con soporte.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, reserva: actualizada });
}
