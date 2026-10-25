import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendPagoFallidoEmail, sendStripeConnectCompletadoEmail } from '@/lib/resend';

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const salonId = subscription.metadata?.salon_id;

        if (salonId) {
          const status = subscription.status;
          const updates: any = {
            stripe_subscription_id: subscription.id,
          };

          if (status === 'active' || status === 'trialing') {
            updates.estado_verificacion = 'aprobada';
            updates.activo = true;
          } else if (status === 'past_due' || status === 'canceled' || status === 'unpaid') {
            updates.activo = false;
          }

          await supabase.from('salones').update(updates).eq('id', salonId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const salonId = subscription.metadata?.salon_id;

        if (salonId) {
          await supabase
            .from('salones')
            .update({
              activo: false,
              stripe_subscription_id: null,
              estado_verificacion: 'rechazada',
              rechazado_motivo: 'Suscripción cancelada',
            })
            .eq('id', salonId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | null;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const salonId = subscription.metadata?.salon_id;

          if (salonId) {
            const { data: salon } = await supabase
              .from('salones')
              .select('nombre, email')
              .eq('id', salonId)
              .single();

            if (salon) {
              await sendPagoFallidoEmail(salon.email, salon.nombre);
            }

            await supabase
              .from('salones')
              .update({ activo: false })
              .eq('id', salonId);
          }
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        const salonId = account.metadata?.salon_id;

        if (salonId && account.charges_enabled && account.payouts_enabled) {
          await supabase
            .from('salones')
            .update({ stripe_account_id: account.id })
            .eq('id', salonId);

          const { data: salon } = await supabase
            .from('salones')
            .select('nombre, email')
            .eq('id', salonId)
            .single();

          if (salon) {
            await sendStripeConnectCompletadoEmail(salon.email, salon.nombre);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}