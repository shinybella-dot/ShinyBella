-- ACTUALIZAR IMÁGENES DE SALONES EN SUPABASE
-- Ejecutar en Supabase SQL Editor

UPDATE salones SET imagen_url = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80' WHERE id = '1';
UPDATE salones SET imagen_url = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80' WHERE id = '2';
UPDATE salones SET imagen_url = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80' WHERE id = '3';
UPDATE salones SET imagen_url = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80' WHERE id = '4';
UPDATE salones SET imagen_url = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80' WHERE id = '5';

-- Verificar
SELECT id, nombre, imagen_url FROM salones ORDER BY id;
