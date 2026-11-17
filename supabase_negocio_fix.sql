-- Ejecutar este script en Supabase SQL Editor. Es idempotente: se puede volver a ejecutar sin errores.

ALTER TABLE salones
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

COMMENT ON COLUMN salones.stripe_customer_id IS
  'ID de cliente de Stripe. Reservado para uso futuro; el flujo actual solo guarda stripe_subscription_id.';

CREATE UNIQUE INDEX IF NOT EXISTS salones_stripe_subscription_id_key
  ON salones (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

COMMENT ON INDEX salones_stripe_subscription_id_key IS
  'Evita que una misma suscripción de Stripe quede asociada a más de un salón.';
