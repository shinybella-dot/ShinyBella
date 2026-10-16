import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada');
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-08-26.dahlia',
  });
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials not configured');
  }
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { amount, currency = 'usd', metadata } = body;

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    // Validar amount contra precio real en BD si se proporciona servicio_id
    if (metadata?.servicio_id) {
      const { data: servicio, error } = await supabase
        .from('servicios')
        .select('precio')
        .eq('id', metadata.servicio_id)
        .single();

      if (!error && servicio) {
        const expectedAmount = Math.round(servicio.precio * 100);
        if (amount !== expectedAmount) {
          return NextResponse.json(
            { error: 'Monto no coincide con precio del servicio' },
            { status: 400 }
          );
        }
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}