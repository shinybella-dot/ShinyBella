'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useNegocio } from '@/hooks/useNegocio';
import { Clock, CheckCircle, XCircle, AlertCircle, Link2, Loader2 } from 'lucide-react';

export default function NegocioEstadoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { salon, estado, loading } = useNegocio();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login?redirect=/negocio/estado');
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  const getEstadoInfo = () => {
    switch (estado) {
      case 'pendiente':
        return {
          icon: Clock,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50 border-orange-200',
          title: 'Solicitud en revisión',
          description: 'Nuestro equipo está revisando tu información. Te contactaremos por email en 24-48 horas.',
          showFolio: true,
        };
      case 'aprobada_sin_pago':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 border-green-200',
          title: '¡Solicitud aprobada!',
          description: 'Tu salón fue aprobado. Para activarlo, debes suscribirte al plan Básico ($60.10/mes).',
          action: { label: 'Pagar plan ahora', href: '/negocio/pago-plan' },
        };
      case 'conectando_stripe':
        return {
          icon: Link2,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 border-blue-200',
          title: 'Pago confirmado',
          description: 'Conecta tu cuenta Stripe para recibir los pagos de las reservas directamente en tu banco.',
          action: { label: 'Conectar Stripe', href: '/negocio/conectar-stripe' },
        };
      case 'activo':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 border-green-200',
          title: 'Salón activo',
          description: 'Tu salón está operativo y recibiendo reservas. Accede al panel de gestión.',
          action: { label: 'Ir al dashboard', href: '/negocio/dashboard' },
        };
      case 'rechazada':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 border-red-200',
          title: 'Solicitud rechazada',
          description: salon?.rechazado_motivo || 'Tu solicitud no fue aprobada. Puedes corregir la información y volver a aplicar.',
        };
      case 'suspendida':
        return {
          icon: AlertCircle,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50 border-gray-200',
          title: 'Salón suspendido',
          description: 'Tu salón ha sido suspendido. Contacta al administrador para más información.',
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50 border-gray-200',
          title: 'Estado desconocido',
          description: 'Contacta al administrador.',
        };
    }
  };

  const info = getEstadoInfo();
  const Icon = info.icon;

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-warm-steel/60 hover:text-accent transition-colors mb-8"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al inicio
      </Link>

      <div className="bg-white rounded-2xl border border-warm-steel/20 p-8 shadow-sm text-center animate-slide-up">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${info.bgColor.replace('bg-', '').replace('border-', '')} ${info.iconColor}`}>
          <Icon className="w-10 h-10" aria-hidden="true" />
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-concrete mb-4">{info.title}</h1>
        <p className="text-warm-steel/70 mb-8 max-w-lg mx-auto">{info.description}</p>

        {salon && info.showFolio && (
          <div className="bg-surface-light rounded-xl p-6 mb-8">
            <p className="text-warm-steel/60 text-sm mb-2">Tu número de seguimiento</p>
            <code className="text-2xl font-mono font-bold text-concrete tracking-widest bg-white px-4 py-2 rounded-lg border border-warm-steel/20 inline-block">
              AF-{salon.id.slice(-8).toUpperCase()}
            </code>
          </div>
        )}

        {info.action && (
          <Link
            href={info.action.href}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors text-lg"
          >
            {info.action.label}
            <Loader2 className="w-5 h-5" aria-hidden="true" />
          </Link>
        )}

        {estado === 'pendiente' && (
          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl text-left">
            <p className="font-medium text-orange-800 flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              Próximos pasos
            </p>
            <ol className="space-y-2 text-sm text-orange-700">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                Nuestro equipo revisa tu información y documentos (24-48h)
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                Te contactamos por email para notificarte el resultado
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                Si es aprobada: pagas el plan y conectas Stripe
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                Accedes a tu panel de gestión y empiezas a recibir reservas
              </li>
            </ol>
          </div>
        )}

        {estado === 'rechazada' && (
          <div className="mt-8 text-center">
            <Link
              href="/afiliarse"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-warm-steel/30 text-concrete font-semibold rounded-xl hover:bg-white transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Volver a enviar solicitud
            </Link>
          </div>
        )}
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

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}