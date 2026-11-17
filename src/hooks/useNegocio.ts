'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from './useAuth';

interface Salon {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  lat: number;
  lng: number;
  rating: number;
  imagen_url: string | null;
  activo: boolean;
  estado_verificacion: 'pendiente' | 'aprobada' | 'rechazada' | 'suspendida';
  stripe_account_id: string | null;
  stripe_subscription_id: string | null;
  plan_activo: string;
  verificado_at: string | null;
  rechazado_motivo: string | null;
  owner_id: string;
}

export function useNegocio() {
  const { user, profile, loading: authLoading } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [fetchedFor, setFetchedFor] = useState<string | null>(null);
  const shouldFetch = !authLoading && !!user && profile?.rol === 'negocio';

  useEffect(() => {
    if (!shouldFetch || !user) return;

    let active = true;

    const fetchSalon = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('salones')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!active) return;
      if (error) {
        console.error('Error fetching salon:', error);
      } else {
        setSalon(data);
      }
      setFetchedFor(user.id);
    };

    fetchSalon();

    return () => {
      active = false;
    };
  }, [shouldFetch, user]);

  const loading = authLoading || (shouldFetch && fetchedFor !== user?.id);

  const estado: 'pendiente' | 'aprobada_sin_pago' | 'conectando_stripe' | 'activo' | 'rechazada' | 'suspendida' = !salon
    ? 'pendiente'
    : salon.estado_verificacion === 'rechazada'
    ? 'rechazada'
    : salon.estado_verificacion === 'suspendida'
    ? 'suspendida'
    : salon.estado_verificacion === 'pendiente'
    ? 'pendiente'
    : salon.estado_verificacion === 'aprobada' && !salon.stripe_subscription_id
    ? 'aprobada_sin_pago'
    : salon.stripe_subscription_id && !salon.stripe_account_id
    ? 'conectando_stripe'
    : !salon.activo
    ? 'suspendida'
    : 'activo';

  return { salon, estado, loading };
}
