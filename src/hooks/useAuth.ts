'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'cliente' | 'negocio' | 'admin';

interface Profile {
  id: string;
  nombre: string | null;
  telefono: string | null;
  rol: UserRole;
  creado_en: string;
  actualizado_en: string;
}

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  rol: UserRole;
  loading: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isNegocio: boolean;
  isCliente: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const loadProfile = async (userId: string): Promise<Profile | null> => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      return (data as Profile | null) ?? null;
    };

    const loadAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser ?? null);
        setProfile(authUser ? await loadProfile(authUser.id) : null);
      } catch (err) {
        console.error('Error cargando sesión:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    void loadAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setProfile(currentUser ? await loadProfile(currentUser.id) : null);
      } catch (err) {
        console.error('Error cargando perfil:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const rol: UserRole = profile?.rol ?? 'cliente';

  const hasRole = (roles: UserRole[]) => roles.includes(rol);

  return {
    user,
    profile,
    rol,
    loading,
    hasRole,
    isAdmin: rol === 'admin',
    isNegocio: rol === 'negocio',
    isCliente: rol === 'cliente',
  };
}
