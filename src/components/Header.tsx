'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, User, Calendar, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/#salones', label: 'Salones' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-warm-steel/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2" aria-label="ShinyBella - Inicio">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
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