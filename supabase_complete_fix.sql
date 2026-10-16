-- =====================================================
-- SOLUCIÓN COMPLETA: Arreglar UUID -> TEXT e insertar datos
-- Ejecutar ESTAS 3 BLOQUES en orden en Supabase SQL Editor
-- =====================================================

-- >>> PASO 1: Sueltar todas las FK constraints <<<
ALTER TABLE servicios DROP CONSTRAINT IF EXISTS servicios_salon_id_fkey;
ALTER TABLE estilistas DROP CONSTRAINT IF EXISTS estilistas_salon_id_fkey;
ALTER TABLE disponibilidad DROP CONSTRAINT IF EXISTS disponibilidad_estilista_id_fkey;

ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_salon_id_fkey;
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_servicio_id_fkey;
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_estilista_id_fkey;

-- >>> PASO 2: Cambiar UUID a TEXT en todas tablas <<<
ALTER TABLE salones ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE servicios ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE estilistas ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE disponibilidad ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE reservas ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- >>> PASO 3: VACIAR TABLAS <<<
TRUNCATE TABLE salones, servicios, estilistas, disponibilidad, reservas RESTART IDENTITY CASCADE;

-- >>> PASO 4: POBLAR TABLAS con datos (IDs son TEXT '1', '2', 's1', 'e1')
-- SALONES
INSERT INTO salones (id, nombre, direccion, lat, lng, telefono, rating, imagen_url, activo) VALUES
  ('1', 'Bella Vista Salon', 'Calle Principal #123, Santa Ana Centro', 13.9941, -89.5557, '+503 2200-1111', 4.8, NULL, true),
  ('2', 'Barbería El Clásico', 'Av. Independencia #45, Santa Ana', 13.9915, -89.5521, '+503 2200-2222', 4.9, NULL, true),
  ('3', 'Nails & Spa Glow', 'Centro Comercial Metrocentro, Local 12', 13.9968, -89.5589, '+503 2200-3333', 4.7, NULL, true),
  ('4', 'Estética María José', 'Col. Escalón, Pasaje 5 #10', 13.9889, -89.5498, '+503 2200-4444', 4.6, NULL, true),
  ('5', 'The Gentleman''s Cut', 'Blvd. Los Próceres #200', 13.9992, -89.5623, '+503 2200-5555', 4.9, NULL, true);

-- SERVICIOS
INSERT INTO servicios (id, salon_id, nombre, descripcion, precio, duracion_min, categoria, activo) VALUES
  ('s1', '1', 'Corte de cabello', 'Corte moderno con lavado y peinado incluido', 15.00, 45, 'Cabello', true),
  ('s2', '1', 'Tinte completo', 'Coloración profesional con tratamiento hidratante', 35.00, 90, 'Cabello', true),
  ('s3', '1', 'Manicure spa', 'Limpieza, exfoliación, mascarilla y esmaltado', 18.00, 60, 'Uñas', true),
  ('s4', '1', 'Pedicure spa', 'Tratamiento completo de pies con masaje relajante', 22.00, 75, 'Uñas', true),
  ('s5', '1', 'Maquillaje social', 'Maquillaje para eventos con productos de alta gama', 25.00, 60, 'Maquillaje', true),
  ('s6', '2', 'Corte clásico', 'Corte tradicional con navaja y toalla caliente', 12.00, 30, 'Barbería', true),
  ('s7', '2', 'Corte + Barba', 'Corte de cabello y arreglo de barba completo', 18.00, 45, 'Barbería', true),
  ('s8', '2', 'Afeitado tradicional', 'Afeitado con navaja, toallas calientes y bálsamo', 15.00, 30, 'Barbería', true),
  ('s9', '3', 'Manicure gel', 'Esmaltado en gel de larga duración', 20.00, 45, 'Uñas', true),
  ('s10', '3', 'Pedicure gel', 'Esmaltado en gel para pies', 25.00, 60, 'Uñas', true),
  ('s11', '3', 'Extensiones de pestañas', 'Pestañas pelo a pelo, efecto natural', 45.00, 90, 'Pestañas', true),
  ('s12', '4', 'Limpieza facial profunda', 'Limpieza, extracción, mascarilla y masaje', 30.00, 75, 'Facial', true),
  ('s13', '4', 'Tratamiento anti-edad', 'Radiofrecuencia + sérums especializados', 55.00, 60, 'Facial', true),
  ('s14', '4', 'Depilación láser (axilas)', 'Sesión individual de depilación definitiva', 25.00, 20, 'Depilación', true),
  ('s15', '5', 'Corte premium', 'Corte personalizado con asesoría de imagen', 22.00, 45, 'Barbería', true),
  ('s16', '5', 'Barba diseño', 'Diseño y perfilado de barba con navaja', 15.00, 30, 'Barbería', true),
  ('s17', '5', 'Tratamiento capilar', 'Hidratación profunda + masaje craneal', 18.00, 30, 'Cabello', true);

-- ESTILISTAS
INSERT INTO estilistas (id, salon_id, nombre, especialidad, imagen_url, activo) VALUES
  ('e1', '1', 'Ana Martínez', 'Colorimetría y cortes modernos', NULL, true),
  ('e2', '1', 'Carlos Rodríguez', 'Barbería y cortes masculinos', NULL, true),
  ('e3', '1', 'Laura Gómez', 'Uñas y spa de manos/pies', NULL, true),
  ('e4', '2', 'Roberto Díaz', 'Barbería clásica y afeitado', NULL, true),
  ('e5', '2', 'Miguel Torres', 'Cortes fade y diseños', NULL, true),
  ('e6', '3', 'Sofía Herrera', 'Uñas gel y nail art', NULL, true),
  ('e7', '3', 'Valentina Cruz', 'Pestañas y cejas', NULL, true),
  ('e8', '4', 'María José López', 'Estética facial y corporal', NULL, true),
  ('e9', '4', 'Andrea Morales', 'Depilación láser y fotodepilación', NULL, true),
  ('e10', '5', 'Javier Castillo', 'Cortes premium y asesoría', NULL, true),
  ('e11', '5', 'Andrés Vega', 'Barbería artística y tratamientos', NULL, true);

-- DISPONIBILIDAD
INSERT INTO disponibilidad (id, estilista_id, dia_semana, hora_inicio, hora_fin) VALUES
  ('u1', 'e1', 1, '08:00', '20:00'), ('u2', 'e1', 2, '08:00', '20:00'), ('u3', 'e1', 3, '08:00', '20:00'),
  ('u4', 'e1', 4, '08:00', '20:00'), ('u5', 'e1', 5, '08:00', '20:00'), ('u6', 'e1', 6, '08:00', '20:00'),
  ('u7', 'e2', 2, '09:00', '18:00'), ('u8', 'e2', 3, '09:00', '18:00'), ('u9', 'e2', 4, '09:00', '18:00'),
  ('u8', 'e2', 5, '09:00', '18:00'), ('u10', 'e2', 6, '09:00', '18:00'),
  ('u12', 'e4', 1, '08:00', '19:00'), ('u13', 'e4', 2, '08:00', '19:00'), ('u14', 'e4', 3, '08:00', '19:00'),
  ('u15', 'e4', 4, '08:00', '19:00'), ('u16', 'e4', 5, '08:00', '19:00'),
  ('u17', 'e6', 3, '10:00', '19:00'), ('u18', 'e6', 4, '10:00', '19:00'), ('u19', 'e6', 5, '10:00', '19:00'),
  ('u20', 'e6', 6, '10:00', '19:00'),
  ('u21', 'e8', 1, '08:00', '18:00'), ('u22', 'e8', 2, '08:00', '18:00'), ('u23', 'e8', 3, '08:00', '18:00'),
  ('u24', 'e8', 4, '08:00', '18:00'),
  ('u25', 'e9', 2, '09:00', '17:00'), ('u26', 'e9', 3, '09:00', '17:00'), ('u27', 'e9', 4, '09:00', '17:00'),
  ('u28', 'e9', 5, '09:00', '17:00'),
  ('u29', 'e10', 1, '08:00', '20:00'), ('u30', 'e10', 2, '08:00', '20:00'), ('u31', 'e10', 3, '08:00', '20:00'),
  ('u32', 'e10', 4, '08:00', '20:00'), ('u33', 'e10', 5, '08:00', '20:00'), ('u35', 'e11', 2, '09:00', '18:00'),
  ('u36', 'e11', 3, '09:00', '18:00'), ('u37', 'e11', 4, '09:00', '18:00'), ('u38', 'e11', 5, '09:00', '18:00'), ('u39', 'e11', 6, '09:00', '18:00');

-- RESERVAS: QUEDA VACÍA (se llenará con pagos reales)
INSERT INTO reservas (id, user_id, salon_id, servicio_id, estilista_id, fecha, hora, estado, payment_intent_id) VALUES;

-- =====================================================
-- LISTO. Ejecutar este script completo en Supabase SQL Editor.
-- IDs de texto ('1', 's1', 'e1') ahora coinciden con mockData.ts.
-- =====================================================