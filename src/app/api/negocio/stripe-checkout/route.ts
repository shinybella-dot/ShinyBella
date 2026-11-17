import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isApiError, requireSalonOwner } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(secretKey, { apiVersion: '2026-08-26.dahlia' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const salonId = body?.salon_id;

    if (typeof salonId !== 'string' || !salonId) {
      return NextResponse.json({ error: 'salon_id requerido' }, { status: 400 });
    }

    const auth = await requireSalonOwner(salonId);
    if (isApiError(auth)) return auth;

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    const { data: salon, error: salonError } = await supabase
      .from('salones')
      .select('id, nombre, email, stripe_subscription_id')
      .eq('id', salonId)
      .single();

    if (salonError || !salon) {
      return NextResponse.json({ error: 'Salón no encontrado' }, { status: 404 });
    }

    if (salon.stripe_subscription_id) {
      return NextResponse.json({ error: 'Este salón ya tiene una suscripción activa' }, { status: 400 });
    }

    const priceId = process.env.STRIPE_PRICE_ID_BASICO;
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID no configurado en el servidor' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shiny-bella.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/negocio/conectar-stripe?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/negocio/pago-plan?canceled=true`,
      client_reference_id: salonId,
      customer_email: salon.email,
      subscription_data: {
        metadata: {
          salon_id: salonId,
        },
      },
      metadata: {
        salon_id: salonId,
        salon_nombre: salon.nombre,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
