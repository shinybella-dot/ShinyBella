-- RECREAR FOREIGN KEYS DESPUÉS DE CAMBIAR UUID A TEXT
-- Ejecutar en Supabase SQL Editor DESPUÉS de tu script de migración
-- Esto restaura la integridad referencial

-- Servicios -> Salones
ALTER TABLE servicios 
ADD CONSTRAINT servicios_salon_id_fkey 
FOREIGN KEY (salon_id) REFERENCES salones(id);

-- Estilistas -> Salones
ALTER TABLE estilistas 
ADD CONSTRAINT estilistas_salon_id_fkey 
FOREIGN KEY (salon_id) REFERENCES salones(id);

-- Disponibilidad -> Estilistas
ALTER TABLE disponibilidad 
ADD CONSTRAINT disponibilidad_estilista_id_fkey 
FOREIGN KEY (estilista_id) REFERENCES estilistas(id);

-- Reservas -> Salones
ALTER TABLE reservas 
ADD CONSTRAINT reservas_salon_id_fkey 
FOREIGN KEY (salon_id) REFERENCES salones(id);

-- Reservas -> Servicios
ALTER TABLE reservas 
ADD CONSTRAINT reservas_servicio_id_fkey 
FOREIGN KEY (servicio_id) REFERENCES servicios(id);

-- Reservas -> Estilistas
ALTER TABLE reservas 
ADD CONSTRAINT reservas_estilista_id_fkey 
FOREIGN KEY (estilista_id) REFERENCES estilistas(id);

-- Verificar que todas las FKs se crearon correctamente
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('servicios', 'estilistas', 'disponibilidad', 'reservas')
ORDER BY tc.table_name, tc.constraint_name;