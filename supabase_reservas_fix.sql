-- =====================================================
-- supabase_reservas_fix.sql
-- Ejecutar en Supabase SQL Editor. Idempotente: se puede repetir.
-- =====================================================

-- 1) Unicidad del slot activo (evita doble reserva concurrente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = 'reservas_slot_activo_unique'
    ) THEN
        CREATE UNIQUE INDEX reservas_slot_activo_unique
            ON public.reservas (salon_id, estilista_id, fecha, hora)
            WHERE estado IN ('pendiente', 'confirmada');
    END IF;
END $$;

-- 2) Columnas nuevas si faltan
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reservas'
          AND column_name = 'codigo'
    ) THEN
        ALTER TABLE public.reservas ADD COLUMN codigo text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'reservas'
          AND column_name = 'actualizado_en'
    ) THEN
        ALTER TABLE public.reservas ADD COLUMN actualizado_en timestamptz;
    END IF;
END $$;

-- 3) Políticas RLS: cliente sobre sus reservas y dueño sobre las de su salón
-- No se habilita RLS aquí: /salon/[id] consulta cupos ocupados sin sesión.
-- Las políticas quedan listas para cuando se habilite con una política pública de cupos.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'reservas'
          AND policyname = 'reservas_cliente_select'
    ) THEN
        CREATE POLICY reservas_cliente_select
            ON public.reservas FOR SELECT TO authenticated
            USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'reservas'
          AND policyname = 'reservas_salon_owner_select'
    ) THEN
        CREATE POLICY reservas_salon_owner_select
            ON public.reservas FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.salones s
                    WHERE s.id = reservas.salon_id
                      AND s.owner_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'reservas'
          AND policyname = 'reservas_admin_all'
    ) THEN
        CREATE POLICY reservas_admin_all
            ON public.reservas FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.rol = 'admin'
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.rol = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'reservas'
          AND policyname = 'reservas_cliente_cancelar'
    ) THEN
        CREATE POLICY reservas_cliente_cancelar
            ON public.reservas FOR UPDATE TO authenticated
            USING (user_id = auth.uid() AND estado IN ('pendiente', 'confirmada'))
            WITH CHECK (user_id = auth.uid() AND estado = 'cancelada');
    END IF;
END $$;
