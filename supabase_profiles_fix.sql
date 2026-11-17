ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banned_at timestamptz;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.rol = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Admin ve todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuario actualiza su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuario ve su perfil" ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
