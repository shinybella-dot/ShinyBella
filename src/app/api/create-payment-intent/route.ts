import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada');
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-08-26.dahlia',
  });
}

const resourceIdSchema = z.string().trim().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/);

const bodySchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().trim().length(3).regex(/^[a-zA-Z]{3}$/).default('usd'),
  metadata: z.object({
    servicio_id: resourceIdSchema.optional(),
    salon_id: resourceIdSchema.optional(),
    estilista_id: resourceIdSchema.optional(),
    fecha: z.string().max(50).optional(),
    hora: z.string().max(50).optional(),
  }).catchall(z.string().max(500)).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Datos de pago inválidos',
          details: parsed.error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    const { amount, currency, metadata } = parsed.data;

    // Sin servicio_id el amount del cliente solo se usa en flujos legacy.
    if (metadata?.servicio_id) {
      const { data: servicio, error: servicioError } = await supabase
        .from('servicios')
        .select('precio, salon_id, activo')
        .eq('id', metadata.servicio_id)
        .single();

      if (servicioError || !servicio) {
        console.error('Servicio no encontrado al crear pago:', servicioError?.message);
        return NextResponse.json({ error: 'Servicio no disponible' }, { status: 400 });
      }

      if (!servicio.activo) {
        return NextResponse.json({ error: 'Servicio no disponible' }, { status: 400 });
      }

      if (metadata.salon_id && metadata.salon_id !== servicio.salon_id) {
        return NextResponse.json({ error: 'El servicio no pertenece al salón' }, { status: 400 });
      }

      const expectedAmount = Math.round(Number(servicio.precio) * 100);
      if (!Number.isFinite(expectedAmount) || amount !== expectedAmount) {
        return NextResponse.json({ error: 'Monto no coincide con precio del servicio' }, { status: 400 });
      }

      metadata.salon_id = servicio.salon_id;
    }

    const stripeMetadata: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata || {})) {
      if (typeof value === 'string') stripeMetadata[key] = value;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: stripeMetadata,
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
