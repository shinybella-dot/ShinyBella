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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const stripe = getStripe();
    const body = await request.json();
    const { salonId } = body;

    if (!salonId) {
      return NextResponse.json({ error: 'salonId requerido' }, { status: 400 });
    }

    const { data: salon, error: salonError } = await supabase
      .from('salones')
      .select('id, nombre, email, stripe_account_id')
      .eq('id', salonId)
      .single();

    if (salonError || !salon) {
      return NextResponse.json({ error: 'Salón no encontrado' }, { status: 404 });
    }

    let accountId = salon.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: salon.email,
        business_type: 'company',
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        metadata: {
          salon_id: salonId,
          salon_nombre: salon.nombre,
        },
      });
      accountId = account.id;

      await supabase
        .from('salones')
        .update({ stripe_account_id: accountId })
        .eq('id', salonId);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shiny-bella.vercel.app';

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/negocio/conectar-stripe`,
      return_url: `${appUrl}/negocio/conectar-stripe`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Error conectando Stripe' },
      { status: 500 }
    );
  }
}