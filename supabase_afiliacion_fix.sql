-- =====================================================
-- Afiliación: folio único y Storage de verificaciones
-- Ejecutar en Supabase SQL Editor (idempotente)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'solicitudes_afiliacion'
      AND column_name = 'folio'
  ) THEN
    ALTER TABLE public.solicitudes_afiliacion ADD COLUMN folio text;
  END IF;
END $$;

DO $$
DECLARE
  rec RECORD;
  v_year text;
  v_folio text;
  v_n integer;
BEGIN
  FOR rec IN
    SELECT id, creado_en
    FROM public.solicitudes_afiliacion
    WHERE folio IS NULL OR btrim(folio) = ''
    ORDER BY creado_en NULLS LAST, id
  LOOP
    v_year := to_char(COALESCE(rec.creado_en, now()), 'YYYY');
    v_n := 1;
    LOOP
      v_folio := 'AF-' || v_year || '-' || lpad(v_n::text, 4, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.solicitudes_afiliacion WHERE folio = v_folio
      );
      v_n := v_n + 1;
    END LOOP;
    UPDATE public.solicitudes_afiliacion
    SET folio = v_folio
    WHERE id = rec.id;
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.solicitudes_afiliacion
    WHERE folio IS NOT NULL
    GROUP BY folio
    HAVING count(*) > 1
  ) THEN
    WITH duplicados AS (
      SELECT
        ctid,
        row_number() OVER (PARTITION BY folio ORDER BY creado_en NULLS LAST, id) AS rn
      FROM public.solicitudes_afiliacion
      WHERE folio IS NOT NULL
    )
    UPDATE public.solicitudes_afiliacion AS s
    SET folio = s.folio || '-' || lpad((d.rn - 1)::text, 2, '0')
    FROM duplicados d
    WHERE s.ctid = d.ctid AND d.rn > 1;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS solicitudes_afiliacion_folio_key
  ON public.solicitudes_afiliacion (folio);

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

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verificaciones',
  'verificaciones',
  false,
  5242880,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET public = false
WHERE id = 'verificaciones';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'verificaciones_anon_insert'
  ) THEN
    CREATE POLICY verificaciones_anon_insert
      ON storage.objects FOR INSERT TO anon
      WITH CHECK (
        bucket_id = 'verificaciones'
        AND (storage.foldername(name))[1] = 'solicitudes'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'verificaciones_owner_insert'
  ) THEN
    CREATE POLICY verificaciones_owner_insert
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'verificaciones'
        AND (storage.foldername(name))[1] = 'solicitudes'
        AND (storage.foldername(name))[2] = auth.jwt()->>'email'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'verificaciones_owner_select'
  ) THEN
    CREATE POLICY verificaciones_owner_select
      ON storage.objects FOR SELECT TO authenticated
      USING (
        bucket_id = 'verificaciones'
        AND (storage.foldername(name))[1] = 'solicitudes'
        AND (storage.foldername(name))[2] = auth.jwt()->>'email'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'verificaciones_admin_select'
  ) THEN
    CREATE POLICY verificaciones_admin_select
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'verificaciones' AND public.is_admin());
  END IF;
END $$;
