'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useNegocio } from '@/hooks/useNegocio';
import { Loader2, Link2, CheckCircle, ArrowLeft, AlertCircle, CreditCard, Shield } from 'lucide-react';

export default function NegocioConectarStripePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { salon, estado, loading: negocioLoading } = useNegocio();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (authLoading || negocioLoading) return;
    if (!user) {
      router.push('/auth/login?redirect=/negocio/conectar-stripe');
    }
    if (estado === 'activo') {
      router.push('/negocio/dashboard');
    }
  }, [user, estado, authLoading, negocioLoading, router]);

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/negocio/stripe-verify?session_id=${sessionId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error verificando pago');
      setConnected(true);
      setTimeout(() => router.push('/negocio/conectar-stripe'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!salon) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/negocio/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId: salon.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error conectando Stripe');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!salon) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <Link href="/negocio/estado" className="inline-flex items-center gap-2 text-warm-steel/60 hover:text-accent mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-8">
          <Loader2 className="w-16 h-16 text-warm-steel/30 mx-auto mb-4 animate-spin" />
          <p className="text-warm-steel/60">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (estado === 'activo') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-8 animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-concrete mb-2">¡Todo listo!</h1>
          <p className="text-warm-steel/60 mb-6">Tu salón está activo y listo para recibir reservas.</p>
          <Link
            href="/negocio/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors"
          >
            Ir al dashboard
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <Link
        href="/negocio/estado"
        className="inline-flex items-center gap-2 text-warm-steel/60 hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <div className="bg-white rounded-2xl border border-warm-steel/20 p-8 shadow-sm animate-slide-up">
        {connected ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-concrete mb-2">¡Pago confirmado!</h1>
            <p className="text-warm-steel/60 mb-6">Tu suscripción está activa. Ahora conecta tu cuenta Stripe para recibir los pagos de las reservas.</p>
            <button
              onClick={handleConnectStripe}
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  Conectar mi cuenta Stripe
                  <Link2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-10 h-10 text-blue-500" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-concrete mb-2">Conectar Stripe</h1>
              <p className="text-warm-steel/60">
                Para recibir los pagos de las reservas directamente en tu cuenta bancaria,
                necesitas conectar tu cuenta Stripe.
              </p>
            </div>

            <div className="bg-surface-light rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-concrete mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Qué sucede al conectar
              </h3>
              <ul className="space-y-3 text-sm text-warm-steel/70">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Te redirigimos a Stripe para completar el onboarding (KYC)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Verifican tu identidad y cuenta bancaria
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Los pagos de las reservas se depositan automáticamente en tu banco
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Comisión de plataforma: 10% + $0.50 por reserva
                </li>
              </ul>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleConnectStripe}
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  Conectar mi cuenta Stripe
                  <Link2 className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="mt-6 text-center text-xs text-warm-steel/50">
              Proceso seguro gestionado por <strong>Stripe</strong>. Tú controlas tu cuenta.
            </p>
          </>
        )}

        <Link
          href="/negocio/estado"
          className="block text-center mt-6 text-sm text-warm-steel/60 hover:text-accent"
        >
          Volver al estado de mi solicitud
        </Link>
      </div>

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