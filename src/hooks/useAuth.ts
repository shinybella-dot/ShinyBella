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

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const rol: UserRole = profile?.rol || (user?.user_metadata?.rol as UserRole) || 'cliente';

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