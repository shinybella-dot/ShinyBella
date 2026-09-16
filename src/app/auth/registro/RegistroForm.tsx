'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const supabase = createClient();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nombre: formData.nombre,
          telefono: formData.telefono,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
      setTimeout(() => router.push('/auth/login'), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-warm-steel/20 p-8 shadow-sm">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mx-auto mb-4" aria-label="ShinyBella">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>
              <h1 className="text-2xl font-bold text-concrete">Crear cuenta</h1>
              <p className="text-warm-steel/60 mt-2">Únete a ShinyBella y agenda en segundos</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-slide-up">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-concrete mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-concrete mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-concrete mb-2">
                  Teléfono (opcional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                    placeholder="+503 7000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-concrete mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-steel/40 hover:text-accent transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-concrete mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="terminos" required className="mt-1 w-4 h-4 rounded border-warm-steel/30 text-accent focus:ring-accent" />
                <label htmlFor="terminos" className="text-sm text-warm-steel/70">
                  Acepto los <Link href="/terminos" className="text-accent hover:underline">Términos y condiciones</Link> y la <Link href="/privacidad" className="text-accent hover:underline">Política de privacidad</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta gratis'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-warm-steel/60">
              ¿Ya tienes cuenta? <Link href="/auth/login" className="font-medium text-accent hover:underline">Inicia sesión</Link>
            </p>
          </div>
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