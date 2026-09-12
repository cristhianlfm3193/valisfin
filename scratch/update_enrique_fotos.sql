-- Activar todos los locales de Enrique
UPDATE locales
SET activo = true
WHERE vendedor_id = 'cfb71bc9-697b-4a5f-b618-cd62bee01c05';

-- Actualizar foto_url según el tipo para los locales de Enrique
UPDATE locales
SET foto_url = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80'
WHERE tipo = 'Restaurante' AND vendedor_id = 'cfb71bc9-697b-4a5f-b618-cd62bee01c05';

UPDATE locales
SET foto_url = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80'
WHERE tipo = 'Supermercado' AND vendedor_id = 'cfb71bc9-697b-4a5f-b618-cd62bee01c05';

UPDATE locales
SET foto_url = 'https://images.unsplash.com/photo-1604719311366-8712e1227f40?w=800&q=80'
WHERE tipo = 'Mini Super' AND vendedor_id = 'cfb71bc9-697b-4a5f-b618-cd62bee01c05';

UPDATE locales
SET foto_url = 'https://images.unsplash.com/photo-1584128114253-e96ed199c44e?w=800&q=80'
WHERE tipo = 'Distribuidora' AND vendedor_id = 'cfb71bc9-697b-4a5f-b618-cd62bee01c05';

UPDATE locales
SET foto_url = 'https://images.unsplash.com/photo-1509440159596-024908877227?w=800&q=80'
WHERE tipo = 'Tienda' AND vendedor_id = 'cfb71bc9-697b-4a5f-b618-cd62bee01c05';
