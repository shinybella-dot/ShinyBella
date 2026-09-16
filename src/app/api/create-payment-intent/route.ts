import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada');
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-08-26.dahlia',
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const { amount, currency = 'usd', metadata } = body;

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
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