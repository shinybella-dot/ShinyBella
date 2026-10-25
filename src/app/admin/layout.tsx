'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Menu, X, Bell, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isAdmin, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push('/unauthorized');
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
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

  return (
    <div className="flex min-h-screen bg-surface-light">
      <AdminSidebar
        userName={profile?.nombre || user?.user_metadata?.nombre || 'Administrador'}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <div className={`flex-1 lg:ml-0 transition-all duration-300 ${!mobileMenuOpen ? 'lg:ml-0' : ''}`}>
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
              <h1 className="text-xl font-bold text-concrete hidden sm:block">
                {pathname === '/admin' && 'Dashboard'}
                {pathname === '/admin/solicitudes' && 'Solicitudes de afiliación'}
                {pathname === '/admin/negocios' && 'Negocios / Salones'}
                {pathname === '/admin/usuarios' && 'Usuarios'}
                {pathname === '/admin/estadisticas' && 'Estadísticas'}
              </h1>
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
                    {profile?.nombre || user?.user_metadata?.nombre || 'Admin'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-warm-steel/50 hidden sm:block" aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-warm-steel/20 shadow-lg py-1 animate-slide-up">
                    <div className="px-4 py-2 border-b border-warm-steel/10">
                      <p className="text-sm font-medium text-concrete">{profile?.nombre || user?.user_metadata?.nombre || 'Administrador'}</p>
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
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-warm-steel/70 hover:bg-warm-steel/10"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                      Panel admin
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
          {children}
        </main>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú lateral">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
            <AdminSidebar
              userName={profile?.nombre || user?.user_metadata?.nombre || 'Administrador'}
              userEmail={user?.email}
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