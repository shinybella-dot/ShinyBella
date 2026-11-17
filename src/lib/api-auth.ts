import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type UserRole = 'cliente' | 'negocio' | 'admin';

export interface ApiAuthContext {
  user: { id: string; email?: string };
  rol: UserRole;
  supabase: ReturnType<typeof createServerClient>;
}

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase credentials not configured');
  }
  return { url, anonKey };
}

export async function getApiAuth(): Promise<ApiAuthContext | null> {
  const { url, anonKey } = getEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Los route handlers no siempre pueden escribir cookies; el middleware las refresca.
        }
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Error leyendo perfil en API:', profileError.message);
    return null;
  }

  const { data: banRow } = await supabase
    .from('profiles')
    .select('banned_at')
    .eq('id', user.id)
    .maybeSingle();
  if (banRow?.banned_at) return null;

  return {
    user: { id: user.id, email: user.email },
    rol: (profile?.rol as UserRole) || 'cliente',
    supabase,
  };
}

export async function requireApiRole(
  roles: UserRole[]
): Promise<ApiAuthContext | NextResponse> {
  const auth = await getApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  if (!roles.includes(auth.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }
  return auth;
}

export async function requireAdmin(): Promise<ApiAuthContext | NextResponse> {
  return requireApiRole(['admin']);
}

export async function requireNegocio(): Promise<ApiAuthContext | NextResponse> {
  return requireApiRole(['negocio', 'admin']);
}

export async function requireSalonOwner(
  salonId: string
): Promise<ApiAuthContext | NextResponse> {
  const auth = await getApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: salon, error } = await auth.supabase
    .from('salones')
    .select('owner_id, email')
    .eq('id', salonId)
    .maybeSingle();

  if (error) {
    console.error('Error verificando dueño del salón:', error.message);
    return NextResponse.json({ error: 'Error verificando salón' }, { status: 500 });
  }
  if (!salon) {
    return NextResponse.json({ error: 'Salón no encontrado' }, { status: 404 });
  }
  if (salon.owner_id !== auth.user.id && auth.rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permisos sobre este salón' }, { status: 403 });
  }
  return auth;
}

export function isApiError(value: ApiAuthContext | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
