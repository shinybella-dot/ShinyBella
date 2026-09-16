'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';
import { Camera, Loader2, AlertCircle, CheckCircle, User, Mail, Save, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type UserProfile = {
  id: string;
  email: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
  };
};

export default function PerfilPage() {
  const supabase = createClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({ full_name: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          id: user.id,
          email: user.email ?? '',
          user_metadata: user.user_metadata ?? {}
        });
        setFormData({ full_name: user.user_metadata?.full_name || '' });
        if (user.user_metadata?.avatar_url) {
          setAvatarPreview(user.user_metadata.avatar_url);
        }
      }
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          user_metadata: session.user.user_metadata ?? {}
        });
        setFormData({ full_name: session.user.user_metadata?.full_name || '' });
        if (session.user.user_metadata?.avatar_url) {
          setAvatarPreview(session.user.user_metadata.avatar_url);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no debe superar 2MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const updates: { data: { full_name: string; avatar_url?: string } } = {
      data: { full_name: formData.full_name }
    };

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        setError('Error subiendo la imagen: ' + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      updates.data.avatar_url = publicUrl;
    }

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Perfil actualizado correctamente');
      if (avatarPreview && avatarFile) {
        setAvatarPreview(avatarPreview);
      }
    }
    setSaving(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, full_name: e.target.value });
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email.slice(0, 2).toUpperCase();
    return 'US';
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-light">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-light">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-accent mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-concrete mb-2">Inicia sesión para ver tu perfil</h1>
            <p className="text-warm-steel/70 mb-6">Necesitas tener una cuenta para acceder a esta página</p>
            <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-warm-steel/20 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={formData.full_name || user.email}
                    className="w-24 h-24 rounded-full object-cover border-4 border-accent/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-accent/20">
                    <span className="text-3xl font-bold text-white">{getInitials(formData.full_name, user.email)}</span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-surface transition-colors border-2 border-warm-steel/20">
                  <Camera className="w-5 h-5 text-concrete" aria-hidden="true" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Cambiar foto de perfil"
                  />
                </label>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-concrete">Mi perfil</h1>
                <p className="text-warm-steel/60">Gestiona tu información personal y preferencias</p>
              </div>
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

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-concrete mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleNameChange}
                    className="w-full pl-10 pr-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                    placeholder="Tu nombre"
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-concrete mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-warm-steel/10 border border-warm-steel/20 rounded-xl text-concrete/60 cursor-not-allowed"
                    placeholder="No se puede cambiar"
                  />
                </div>
                <p className="text-warm-steel/50 text-xs mt-1">El email no se puede modificar por seguridad</p>
              </div>

              <div className="pt-4 border-t border-warm-steel/20">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" aria-hidden="true" />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-warm-steel/20">
              <h3 className="font-medium text-concrete mb-4">Zona de peligro</h3>
              <p className="text-warm-steel/60 text-sm mb-4">Esta acción no se puede deshacer</p>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            </div>
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