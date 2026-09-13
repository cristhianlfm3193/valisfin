
INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Golden Express : Golden Express-La Chorrera', 'Restaurante', 'Panamá Oeste, La Chorrera, Barrio Colón, Anclas Mall, Carretera principal', 8.880203, -79.784695, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Golden Express : Golden Express-La Chorrera' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Golden Mini Market : Super Market La Parada', 'Supermercado', 'Panamá Oeste, La Chorrera, Barrio Colón', 8.878511, -79.779775, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Golden Mini Market : Super Market La Parada' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Grupo Benedicto Huang, S.A.', 'Distribuidora', 'Panamá Oeste, La Chorrera, Guadalupe, Vía Panamericana', 8.867914, -79.801479, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Grupo Benedicto Huang, S.A.' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Grupo Yan Xing', 'Distribuidora', 'Panamá Oeste, Capira, Vía Interamericana, Calle principal Edf. Grupo Yan Xing', 8.755785, -79.865505, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Grupo Yan Xing' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Arraiján', 'Supermercado', 'Panamá Oeste, Arraiján, Valle Hermoso', 8.945477, -79.659748, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Arraiján' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Arraiján Town Center', 'Supermercado', 'Panamá Oeste, Arraiján, Town Center Burunga', 8.947547, -79.65287, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Arraiján Town Center' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Brisas Del Golf Arraiján', 'Supermercado', 'Panamá Oeste, Arraiján, Brisas del Golf', 8.900925, -79.669127, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Brisas Del Golf Arraiján' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Coronado', 'Supermercado', 'Panamá Oeste, Coronado', 8.530112, -79.906284, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Coronado' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-El Coco', 'Supermercado', 'Panamá Oeste, El Coco de La Chorrera', 8.875418, -79.800982, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-El Coco' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-La Chorrera', 'Supermercado', 'Panamá Oeste, La Chorrera', 8.876771, -79.783358, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-La Chorrera' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-OnD Go Chorrera', 'Supermercado', 'Panamá Oeste, OnD Go La Chorrera', 8.870279, -79.778775, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-OnD Go Chorrera' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Vacamonte', 'Supermercado', 'Panamá Oeste, Arraiján, Vacamonte, El Tecal', 8.900636, -79.665585, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Ricamar, S.A. : Importadora Ricamar, S.A.-Vacamonte' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 15', 'Supermercado', 'Panamá Oeste, La Chorrera, Herrera, Vía El Trapichito, Vía principal El Trapichito, Casa S/N', 8.875881, -79.789228, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 15' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 11', 'Supermercado', 'Panamá Oeste, La Chorrera, Puerto Caimito, Vía La Mitra', 8.880284, -79.755005, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 11' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 13', 'Supermercado', 'Panamá Oeste, Barrio Colón, Urb. Barrio El Limón', 8.876265, -79.779022, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 13' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 9', 'Supermercado', 'Panamá Oeste, Arraiján, Vista Alegre, Vía Panamericana', 8.926094, -79.70104, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Importadora Virzi, S.A. : Importadora Virzi, S.A. - Super Carnes # 9' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Industrias Velásquez, S.A.', 'Tienda', 'Panamá Oeste, Arraiján, Vacamonte, Centro Comercial Tajonaso, Local # 3', 8.900272, -79.667255, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Industrias Velásquez, S.A.' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Inversiones Casa Marcelito', 'Distribuidora', 'Panamá Oeste, La Chorrera, Barrio Balboa, Ave. Las Américas, Detrás de la Estación Delta', 8.880126, -79.778292, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Inversiones Casa Marcelito' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Islas de Panamá NC Limpiada', 'Restaurante', 'Panamá Oeste, La Chorrera, Barrio Colón, Plaza Uniplaza, Urb. El Limón, Costa Verde, Dep. 4-L5', 8.884287, -79.752282, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Islas de Panamá NC Limpiada' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Jumbo Market, S.A. : Jumbo Market, S.A.-Arraiján', 'Supermercado', 'Panamá Oeste, Arraiján, Juan Demóstenes Arosemena', 8.952524, -79.665859, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Jumbo Market, S.A. : Jumbo Market, S.A.-Arraiján' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Jumbo Market, S.A. : Jumbo Market, S.A.-Costa Verde', 'Supermercado', 'Panamá Oeste, La Chorrera, Costa Verde, PH Plaza Central Costa Verde', 8.899025, -79.747525, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Jumbo Market, S.A. : Jumbo Market, S.A.-Costa Verde' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Jumbo Market, S.A. : Jumbo Market, S.A.-Vacamonte', 'Supermercado', 'Panamá Oeste, Vacamonte, Arraiján, Vista Alegre, Plaza Nueva, Urb. Vacamonte', 8.92629, -79.705667, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Jumbo Market, S.A. : Jumbo Market, S.A.-Vacamonte' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Legumbres Araúz', 'Mini Super', 'Panamá Oeste, La Chorrera, Mercado de Abastos', 8.878786, -79.779741, 'https://images.unsplash.com/photo-1604719311366-8512e8227c6a?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Legumbres Araúz' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Lo Maximo', 'Distribuidora', 'Panamá Oeste, La Chorrera, Barrio Colón, Calle San Francisco', 8.876256, -79.780305, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Lo Maximo' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Mini Super Jennifer', 'Mini Super', 'Panamá Oeste, Barrio Balboa, Ave. Las Américas', 8.876734, -79.780785, 'https://images.unsplash.com/photo-1604719311366-8512e8227c6a?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Mini Super Jennifer' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);
