-- RPC Function: create_reserva_atomic (CORREGIDA)
-- Ejecutar en Supabase SQL Editor
-- Esta función atómica valida disponibilidad y crea la reserva en una sola transacción
-- Evita race conditions (double booking)

CREATE OR REPLACE FUNCTION create_reserva_atomic(
    p_user_id UUID,
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
    error_message TEXT
) AS $$
DECLARE
    v_conflict BOOLEAN;
    v_new_id TEXT;
BEGIN
    -- Verificar que el slot está libre (bloqueo fila)
    SELECT EXISTS (
        SELECT 1 FROM reservas
        WHERE salon_id = p_salon_id
          AND estilista_id = p_estilista_id
          AND fecha = p_fecha
          AND hora = p_hora
          AND estado IN ('pendiente', 'confirmada')
        FOR UPDATE
    ) INTO v_conflict;

    IF v_conflict THEN
        RETURN QUERY SELECT false, NULL, 'El horario ya no está disponible';
        RETURN;
    END IF;

    -- Generar ID único para la reserva (usando gen_random_uuid convertido a TEXT)
    v_new_id := gen_random_uuid()::TEXT;

    -- Insertar la reserva
    INSERT INTO reservas (
        id,
        user_id,
        salon_id,
        servicio_id,
        estilista_id,
        fecha,
        hora,
        estado,
        payment_intent_id,
        created_at
    ) VALUES (
        v_new_id,
        p_user_id,
        p_salon_id,
        p_servicio_id,
        p_estilista_id,
        p_fecha,
        p_hora,
        p_estado,
        p_payment_intent_id,
        NOW()
    );

    RETURN QUERY SELECT true, v_new_id, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION create_reserva_atomic TO authenticated;

-- Verificar que la función existe
SELECT proname, prosrc FROM pg_proc WHERE proname = 'create_reserva_atomic';