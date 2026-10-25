'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useNegocio } from '@/hooks/useNegocio';
import { Loader2, CheckCircle, CreditCard, Shield, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NegocioPagoPlanPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { salon, estado, loading: negocioLoading } = useNegocio();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || negocioLoading) return;
    if (!user) {
      router.push('/auth/login?redirect=/negocio/pago-plan');
    }
    if (estado === 'activo') {
      router.push('/negocio/dashboard');
    }
  }, [user, estado, authLoading, negocioLoading, router]);

  if (authLoading || negocioLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-warm-steel/60 hover:text-accent mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-8">
          <Loader2 className="w-16 h-16 text-warm-steel/30 mx-auto mb-4 animate-spin" />
          <p className="text-warm-steel/60">No se encontró información del salón</p>
        </div>
      </div>
    );
  }

  if (estado === 'activo') {
    router.push('/negocio/dashboard');
    return null;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/negocio/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId: salon.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear sesión de pago');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

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
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-10 h-10 text-accent" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-concrete mb-2">Activar plan Básico</h1>
          <p className="text-warm-steel/60">
            Suscríbete por <strong className="text-concrete">$60.10/mes</strong> para activar tu salón
          </p>
        </div>

        <div className="bg-surface-light rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-concrete mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Qué incluye el plan Básico
          </h3>
          <ul className="space-y-3 text-sm text-warm-steel/70">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              Perfil público en el mapa y buscador
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              Agenda digital con reservas online 24/7
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              Recordatorios automáticos (email + WhatsApp)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              Panel de gestión: servicios, estilistas, horarios
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              Estadísticas básicas de reservas
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              Soporte por email
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
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirigiendo a Stripe...
            </>
          ) : (
            <>
              Pagar $60.10/mes
              <CreditCard className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="mt-6 text-center text-xs text-warm-steel/50">
          El pago se procesa de forma segura con <strong>Stripe</strong>. Puedes cancelar en cualquier momento.
        </p>

        <Link
          href="/negocio/estado"
          className="block text-center mt-4 text-sm text-warm-steel/60 hover:text-accent"
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