
INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Mini Super Mary', 'Mini Super', 'Panamá Oeste, La Chorrera, El Coco, Calle principal, Urb. El Coco', 8.874196, -79.798867, 'https://images.unsplash.com/photo-1604719311366-8512e8227c6a?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Mini Super Mary' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Panadería Dulcería y Rest. Cesarin', 'Tienda', 'Panamá Oeste, La Chorrera, Barrio Balboa, Ave. Las Américas', 8.87603, -79.781846, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Panadería Dulcería y Rest. Cesarin' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Barrio Matuna', 'Tienda', 'Panamá Oeste, La Chorrera, Barrio Matuna, Ave. Las Americas', 8.87741, -79.779892, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Barrio Matuna' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Capira', 'Tienda', 'Panamá Oeste, Capira', 8.757933, -79.866254, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Capira' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-C.C. Vista Mar', 'Tienda', 'Panamá Oeste, La Chorrera, C.C. Vista Mar Frente Al Hospital Nicolas Solano', 8.880072, -79.781276, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-C.C. Vista Mar' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-El Puerto', 'Tienda', 'Panamá Oeste, La Chorrera, Calle El Puerto Frente A Estacion Terpel, Cesarin 7', 8.877584, -79.781429, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-El Puerto' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-On D Go La Chorrera', 'Tienda', 'Panamá Oeste, La Chorrera, On D Go al Lado del Super 99', 8.870655, -79.779054, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-On D Go La Chorrera' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-San Carlos', 'Tienda', 'Panamá Oeste, San Carlos', 8.899295, -79.999435, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-San Carlos' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Valle Hermoso', 'Tienda', 'Panamá Oeste, Arraiján, Valle Hermoso', 8.941995, -79.695692, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Panadería Dulcería y Rest. Cesarin : Panadería y Rest. Cesarin-Valle Hermoso' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Productos Hierro', 'Distribuidora', 'Panamá Oeste, La Chorrera, Barrio Balboa, Ave. Las Américas, Edif. Lupita, Dep. 2do piso', 8.875515, -79.777556, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Productos Hierro' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Suministros Alimenticios, S.A.', 'Supermercado', 'Panamá Oeste, La Chorrera, Barrio Balboa, Calle del Puerto Casa 3284', 8.880027, -79.781492, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Suministros Alimenticios, S.A.' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Super Calidad', 'Mini Super', 'Panamá Oeste, La Chorrera, Guadalupe, Calle interamericana, Casa 1504', 8.867002, -79.8004, 'https://images.unsplash.com/photo-1604719311366-8512e8227c6a?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Super Calidad' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Super Centro de la Carne #2', 'Supermercado', 'Panamá Oeste, La Chorrera, Barrio Colón, Vía Rockefeller', 8.86601, -79.777582, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Super Centro de la Carne #2' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Super Diferente', 'Mini Super', 'Panamá Oeste, Arraiján, Juan Demóstenes Arosemena, Calle Principal, Urb. Rio Potrero', 8.946766, -79.649676, 'https://images.unsplash.com/photo-1604719311366-8512e8227c6a?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Super Diferente' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supercentro de la carne', 'Mini Super', 'Panamá Oeste, La Chorrera, Plaza de la carne', 8.879035, -79.781226, 'https://images.unsplash.com/photo-1604719311366-8512e8227c6a?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supercentro de la carne' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supercentro Infinito', 'Mini Super', 'Panamá Oeste, Arraiján, Cerro silvestre, Nuevo Chorrillo', 8.869016, -79.800195, 'https://images.unsplash.com/photo-1604719311366-8512e8227c6a?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supercentro Infinito' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supercentro La Gran Vía', 'Supermercado', 'Panamá Oeste, Arraiján, Vista Alegre, Autopista', 8.827503, -79.780171, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supercentro La Gran Vía' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Superm. y Distribuidora H. D. L.', 'Supermercado', 'Panamá Oeste, La Chorrera, Barrio Balboa, Ave. Mariano Rivera', 8.880416, -79.782103, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Superm. y Distribuidora H. D. L.' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Superm. y May. La Estrella Roja', 'Supermercado', 'Panamá Oeste, Arraiján, Urb. Caceres, Plaza la Estrella Roja', 8.949642, -79.651477, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Superm. y May. La Estrella Roja' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermarket Vacamonte', 'Supermercado', 'Panamá Oeste, Vista Alegre, Calle principal, diagonal a Super Jumbo, Plaza Comercial y Brisas de Punta, Urb. Vacamonte, Arraijan', 8.920753, -79.701761, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermarket Vacamonte' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Casa de Oro', 'Supermercado', 'Panamá Oeste, La Chorrera, El Coco', 8.872007, -79.800716, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Casa de Oro' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado El Progreso', 'Supermercado', 'Panamá Oeste, La Chorrera, Feuilleth, Urb. El Espino, Calle Principal', 8.887138, -79.789655, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado El Progreso' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado El Surtidor', 'Supermercado', 'Panamá Oeste, Arraiján, Juan Demóstenes Arosemena', 8.935087, -79.682052, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado El Surtidor' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Fou Eleth', 'Supermercado', 'Panamá Oeste, La Chorrera, Ave. Las Americas', 8.886209, -79.792257, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Fou Eleth' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado La Hacienda', 'Supermercado', 'Panamá Oeste, Arraiján, Vista Alegre, Urb. La Hacienda, Calle Providencia La Hacienda', 8.928045, -79.700304, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado La Hacienda' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);
