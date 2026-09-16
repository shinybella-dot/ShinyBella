'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, CheckCircle, Lock, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Servicio, Estilista } from '@/lib/types';
import { mockSalones, mockServicios, mockEstilistas, getSalonById, getServicioById, getEstilistaById } from '@/lib/mockData';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ReservaData {
  salonId: string;
  servicioId: string;
  estilistaId: string;
  fecha: string;
  hora: string;
  precio: number;
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const reservaId = params.id as string;

  const [reserva, setReserva] = useState<ReservaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const salon = reserva ? getSalonById(reserva.salonId) : null;
  const servicio = reserva ? getServicioById(reserva.servicioId) : null;
  const estilista = reserva ? getEstilistaById(reserva.estilistaId) : null;

  const formatFecha = (fechaStr: string) => {
    const date = new Date(fechaStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  useEffect(() => {
    const stored = localStorage.getItem('shinybella_pending_reserva');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setReserva(data);
      } catch {
        router.push('/');
      }
    } else if (!searchParams.get('session_id')) {
      router.push('/');
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (reserva && !clientSecret && !searchParams.get('session_id')) {
      createPaymentIntent();
    }
  }, [reserva, clientSecret, searchParams]);

  const createPaymentIntent = async () => {
    if (!reserva) return;
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(reserva.precio * 100),
          currency: 'usd',
          metadata: {
            salon_id: reserva.salonId,
            servicio_id: reserva.servicioId,
            estilista_id: reserva.estilistaId,
            fecha: reserva.fecha,
            hora: reserva.hora,
          },
        }),
      });
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setError(data.error || 'Error al crear el pago');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret || !reserva) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Cliente ShinyBella',
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Error en el pago');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      setSuccess(true);
      localStorage.removeItem('shinybella_pending_reserva');
      setTimeout(() => router.push(`/confirmacion/${paymentIntent.id}`), 1500);
    }
  };

  if (!reserva || !salon || !servicio || !estilista) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center animate-slide-up">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-accent" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-concrete mb-2">¡Pago confirmado!</h2>
        <p className="text-warm-steel/70 mb-6">Tu cita ha sido reservada exitosamente. Redirigiendo...</p>
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 space-y-4">
        <h3 className="font-semibold text-concrete flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-accent" aria-hidden="true" />
          Datos de la tarjeta
        </h3>
        <div className="bg-surface-light border border-warm-steel/20 rounded-xl p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#525871',
                  fontFamily: 'inherit',
                  '::placeholder': { color: '#857C91' },
                },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-steel/60">
          <Lock className="w-4 h-4" aria-hidden="true" />
          <span>Pago seguro procesado por Stripe. Tus datos nunca tocan nuestros servidores.</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 space-y-4">
        <h3 className="font-semibold text-concrete">Resumen del pedido</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-concrete">{servicio.nombre}</p>
              <p className="text-warm-steel/60 text-sm">
                {salon.nombre} · {estilista.nombre}
              </p>
            </div>
            <span className="font-medium text-concrete">${servicio.precio.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-warm-steel/60 text-sm">
            <span>{formatFecha(reserva.fecha)} a las {reserva.hora}</span>
          </div>
          <div className="pt-2 border-t border-warm-steel/20 flex items-center justify-between text-lg">
            <span className="font-semibold text-concrete">Total</span>
            <span className="font-bold text-primary">${servicio.precio.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Procesando...
          </>
        ) : (
          <>
            Pagar ${servicio.precio.toFixed(2)}
            <Lock className="w-5 h-5" aria-hidden="true" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-warm-steel/60">
        Al pagar, aceptas nuestros <Link href="/terminos" className="underline hover:text-accent">Términos</Link> y <Link href="/privacidad" className="underline hover:text-accent">Política de privacidad</Link>.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-warm-steel/60 hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver
          </Link>

          <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 mb-8">
            <h1 className="text-2xl font-bold text-concrete mb-2">Completar pago</h1>
            <p className="text-warm-steel/70">Revisa los detalles y paga de forma segura con Stripe</p>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}