-- RPC: create_reserva_atomic
-- Ejecutar en Supabase SQL Editor DESPUÉS de supabase_reservas_fix.sql
-- (esta función escribe las columnas codigo y actualizado_en).
-- La firma YA NO acepta p_user_id: usa auth.uid() directamente.

DROP FUNCTION IF EXISTS public.create_reserva_atomic(uuid, text, text, text, date, time, text, text);
DROP FUNCTION IF EXISTS public.create_reserva_atomic(text, text, text, date, time, text, text);

CREATE OR REPLACE FUNCTION public.create_reserva_atomic(
    p_salon_id TEXT,
    p_servicio_id TEXT,
    p_estilista_id TEXT,
    p_fecha DATE,
    p_hora TIME,
    p_payment_intent_id TEXT DEFAULT NULL,
    p_estado TEXT DEFAULT 'confirmada'
) RETURNS TABLE (
    success BOOLEAN,
    reserva_id TEXT,
    codigo TEXT,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user UUID;
    v_servicio_salon TEXT;
    v_estilista_salon TEXT;
    v_new_id TEXT;
    v_codigo TEXT;
BEGIN
    v_user := auth.uid();

    IF v_user IS NULL THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 'Debes iniciar sesión para reservar';
        RETURN;
    END IF;

    IF p_salon_id IS NULL OR p_servicio_id IS NULL OR p_estilista_id IS NULL
       OR p_fecha IS NULL OR p_hora IS NULL THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 'Datos de reserva incompletos';
        RETURN;
    END IF;

    IF p_estado IS NULL OR p_estado NOT IN ('pendiente', 'confirmada') THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 'Estado de reserva inválido';
        RETURN;
    END IF;

    SELECT s.salon_id INTO v_servicio_salon
    FROM public.servicios s
    WHERE s.id = p_servicio_id
      AND s.activo = true;

    IF v_servicio_salon IS NULL THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 'Servicio no disponible';
        RETURN;
    END IF;

    IF v_servicio_salon <> p_salon_id THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 'El servicio no pertenece al salón';
        RETURN;
    END IF;

    SELECT e.salon_id INTO v_estilista_salon
    FROM public.estilistas e
    WHERE e.id = p_estilista_id
      AND e.activo = true;

    IF v_estilista_salon IS NULL OR v_estilista_salon <> p_salon_id THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 'El estilista no pertenece al salón';
        RETURN;
    END IF;

    PERFORM pg_advisory_xact_lock(
        hashtext(p_salon_id || '|' || p_estilista_id || '|' || p_fecha::TEXT || '|' || p_hora::TEXT)
    );

    PERFORM 1
    FROM public.reservas r
    WHERE r.salon_id = p_salon_id
      AND r.estilista_id = p_estilista_id
      AND r.fecha = p_fecha
      AND r.hora = p_hora
      AND r.estado IN ('pendiente', 'confirmada')
    FOR UPDATE;

    IF FOUND THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, 'El horario ya no está disponible';
        RETURN;
    END IF;

    v_new_id := gen_random_uuid()::TEXT;
    v_codigo := 'SB-' || to_char(now(), 'YYYY') || '-' ||
        upper(substring(replace(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 8));

    INSERT INTO public.reservas (
        id, user_id, salon_id, servicio_id, estilista_id, fecha, hora,
        estado, payment_intent_id, codigo, created_at, actualizado_en
    ) VALUES (
        v_new_id, v_user, p_salon_id, p_servicio_id, p_estilista_id, p_fecha, p_hora,
        p_estado, p_payment_intent_id, v_codigo, now(), now()
    );

    RETURN QUERY SELECT true, v_new_id, v_codigo, NULL::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.create_reserva_atomic(text, text, text, date, time, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_reserva_atomic(text, text, text, date, time, text, text) TO authenticated;
