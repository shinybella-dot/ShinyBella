'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { MapPin, User, Calendar, LogIn, LogOut, Menu, X, ChevronDown, Image, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/#salones', label: 'Salones' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
];

export default function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; user_metadata: { avatar_url?: string; full_name?: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email ?? '',
          user_metadata: user.user_metadata ?? {}
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? '',
          user_metadata: session.user.user_metadata ?? {}
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email.slice(0, 2).toUpperCase();
    return 'US';
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-warm-steel/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="ShinyBella - Inicio">
              <img
                src="/logo.svg"
                alt="ShinyBella"
                className="w-10 h-10"
              />
              <span className="font-bold text-xl text-primary hidden sm:block">ShinyBella</span>
            </Link>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-warm-steel/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2" aria-label="ShinyBella - Inicio">
              <img
                src="/logo.svg"
                alt="ShinyBella"
                className="w-10 h-10"
              />
              <span className="font-bold text-xl text-primary hidden sm:block">ShinyBella</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'text-accent'
                    : 'text-concrete/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium text-sm">
                      {getInitials(user.user_metadata?.full_name, user.email)}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-concrete">{displayName}</span>
                  <ChevronDown className="w-4 h-4 text-warm-steel/50" aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-warm-steel/20 py-2 z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-warm-steel/20">
                      <p className="font-medium text-concrete text-sm">{displayName}</p>
                      <p className="text-warm-steel/60 text-xs truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/mis-citas"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-concrete hover:bg-surface transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      Mis citas
                    </Link>
                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-concrete hover:bg-surface transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" aria-hidden="true" />
                      Mi perfil
                    </Link>
                    <hr className="my-2 border-warm-steel/20" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-concrete/70 hover:text-accent transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-1 inline-block" aria-hidden="true" />
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/registro"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-concrete transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-concrete hover:text-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-warm-steel/20 animate-slide-down">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium ${
                    pathname === link.href ? 'text-accent' : 'text-concrete/70'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-warm-steel/20" />
              {user ? (
                <>
                  <Link
                    href="/mis-citas"
                    className="flex items-center gap-2 px-4 py-2 text-base font-medium text-concrete"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="w-5 h-5" aria-hidden="true" />
                    Mis citas
                  </Link>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-4 py-2 text-base font-medium text-concrete"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" aria-hidden="true" />
                    Mi perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-base font-medium text-red-600 text-left"
                  >
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-base font-medium text-concrete/70 hover:text-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5 mr-2 inline-block align-middle" aria-hidden="true" />
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/registro"
                    className="text-center px-4 py-2 text-base font-medium text-white bg-primary rounded-lg hover:bg-concrete transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
      `}</style>
    </header>
  );
}