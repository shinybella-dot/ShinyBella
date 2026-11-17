import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isApiError, requireSalonOwner } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(secretKey, { apiVersion: '2026-08-26.dahlia' });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id requerido' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pago no completado' }, { status: 400 });
    }

    const subscription = session.subscription as Stripe.Subscription | string | null;
    const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;
    const salonId =
      session.client_reference_id ||
      (typeof subscription !== 'string' ? subscription?.metadata?.salon_id : undefined) ||
      session.metadata?.salon_id;

    if (!salonId || !subscriptionId) {
      return NextResponse.json({ error: 'No se pudo identificar el salón' }, { status: 400 });
    }

    const auth = await requireSalonOwner(salonId);
    if (isApiError(auth)) return auth;

    const { error } = await getSupabaseAdmin()
      .from('salones')
      .update({ stripe_subscription_id: subscriptionId })
      .eq('id', salonId);

    if (error) {
      console.error('Error updating salon subscription:', error);
      return NextResponse.json({ error: 'Error guardando suscripción' }, { status: 500 });
    }

    return NextResponse.json({ success: true, salonId, subscriptionId });
  } catch (error) {
    console.error('Stripe verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error verificando pago' },
      { status: 500 }
    );
  }
}
