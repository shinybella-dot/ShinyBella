import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(secretKey, { apiVersion: '2026-08-26.dahlia' });
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const stripe = getStripe();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id requerido' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pago no completado' }, { status: 400 });
    }

    const salonId = session.client_reference_id || session.metadata?.salon_id;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (!salonId) {
      return NextResponse.json({ error: 'No se pudo identificar el salón' }, { status: 400 });
    }

    const { error } = await supabase
      .from('salones')
      .update({
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
      })
      .eq('id', salonId);

    if (error) {
      console.error('Error updating salon subscription:', error);
      return NextResponse.json({ error: 'Error guardando suscripción' }, { status: 500 });
    }

    return NextResponse.json({ success: true, salonId, subscriptionId });
  } catch (error: any) {
    console.error('Stripe verify error:', error);
    return NextResponse.json(
      { error: error.message || 'Error verificando pago' },
      { status: 500 }
    );
  }
}