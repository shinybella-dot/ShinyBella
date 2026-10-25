'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Menu, X, Bell, User, LogOut, ChevronDown, Scissors, AlertCircle, XCircle, Clock, LayoutDashboard, Link2 } from 'lucide-react';
import NegocioSidebar from '@/components/negocio/NegocioSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNegocio } from '@/hooks/useNegocio';

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isNegocio, loading: authLoading } = useAuth();
  const { salon, estado, loading: negocioLoading } = useNegocio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading || negocioLoading) return;
    if (!isNegocio || !salon) {
      router.push('/negocio/estado');
    }
  }, [isNegocio, salon, authLoading, negocioLoading, router]);

  const loading = authLoading || negocioLoading;

  if (loading || !isNegocio) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-light">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      pendiente: { label: 'En revisión', color: 'bg-orange-500/10 text-orange-700' },
      aprobada_sin_pago: { label: 'Pendiente de pago', color: 'bg-orange-500/10 text-orange-700' },
      conectando_stripe: { label: 'Conectando Stripe', color: 'bg-blue-500/10 text-blue-700' },
      activo: { label: 'Activo', color: 'bg-green-500/10 text-green-700' },
      rechazada: { label: 'Rechazada', color: 'bg-red-500/10 text-red-700' },
      suspendida: { label: 'Suspendida', color: 'bg-gray-500/10 text-gray-700' },
    };
    return labels[estado] || { label: estado, color: 'bg-gray-500/10 text-gray-700' };
  };

  const estadoInfo = getEstadoLabel(estado);

  return (
    <div className="flex min-h-screen bg-surface-light">
      <NegocioSidebar
        salonName={salon?.nombre}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-0">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-warm-steel/20">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-warm-steel/50 hover:bg-warm-steel/10"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-concrete">{salon?.nombre || 'Mi Salón'}</h1>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoInfo.color}`}>
                    {estadoInfo.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg text-warm-steel/50 hover:bg-warm-steel/10">
                <Bell className="w-5 h-5" aria-hidden="true" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-warm-steel/10"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-concrete">
                    {profile?.nombre || user?.user_metadata?.nombre || 'Propietario'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-warm-steel/50 hidden sm:block" aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-warm-steel/20 shadow-lg py-1 animate-slide-up">
                    <div className="px-4 py-2 border-b border-warm-steel/10">
                      <p className="text-sm font-medium text-concrete">{profile?.nombre || user?.user_metadata?.nombre || 'Propietario'}</p>
                      <p className="text-xs text-warm-steel/50 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/perfil"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-warm-steel/70 hover:bg-warm-steel/10"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" aria-hidden="true" />
                      Mi perfil
                    </Link>
                    <Link
                      href="/negocio/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-warm-steel/70 hover:bg-warm-steel/10"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                      Panel negocio
                    </Link>
                    <hr className="my-1 border-warm-steel/10" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {estado === 'aprobada_sin_pago' && pathname !== '/negocio/pago-plan' && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500 text-white">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">¡Tu salón fue aprobado!</p>
                  <p className="text-sm text-orange-700">Suscríbete al plan Básico ($60.10/mes) para activar tu salón.</p>
                </div>
              </div>
              <Link
                href="/negocio/pago-plan"
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Pagar plan ahora
              </Link>
            </div>
          )}

          {estado === 'conectando_stripe' && pathname !== '/negocio/conectar-stripe' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">Pago confirmado</p>
                  <p className="text-sm text-blue-700">Conecta tu cuenta Stripe para recibir pagos de las reservas.</p>
                </div>
              </div>
              <Link
                href="/negocio/conectar-stripe"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Conectar Stripe
              </Link>
            </div>
          )}

          {estado === 'rechazada' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500 text-white">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-red-800">Solicitud rechazada</p>
                  <p className="text-sm text-red-700">{salon?.rechazado_motivo || 'Contacta al administrador para más detalles.'}</p>
                </div>
              </div>
            </div>
          )}

          {estado === 'pendiente' && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500 text-white">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">Solicitud en revisión</p>
                  <p className="text-sm text-orange-700">Nuestro equipo revisará tu información en 24-48h. Te notificaremos por email.</p>
                </div>
              </div>
            </div>
          )}

          {children}
        </main>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú lateral">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
            <NegocioSidebar
              salonName={salon?.nombre}
              onLogout={() => { handleLogout(); setMobileMenuOpen(false); }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.2s ease-out; }
      `}</style>
    </div>
  );
}