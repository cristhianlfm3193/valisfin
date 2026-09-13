
INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Casa El Distribuidor', 'Distribuidora', 'Panamá Oeste, La Chorrera, Av. Libertador, Casa 3525', 8.879282, -79.781709, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Casa El Distribuidor' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Casa Zing', 'Distribuidora', 'Panamá Oeste, La Chorrera, Urb. Frente al Parque Libertador', 8.879434, -79.784445, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Casa Zing' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Central de productos y Equipos GC', 'Tienda', 'Panamá Oeste, La Chorrera, Planta, Calle Naciones Unidas Edf. Fatima', 8.879597, -79.785364, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Central de productos y Equipos GC' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Compañía Goly, S.A. - Compañía Goly, S.A.- Coronado', 'Supermercado', 'Panamá Oeste, Chame (Cabecera), Coronado, Vía Interamericana, Edf. CC P.H. The Village', 8.530834, -79.903276, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Compañía Goly, S.A. - Compañía Goly, S.A.- Coronado' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Compañía Goly, S.A. - Compañía Goly, S.A.-Hato Montaña', 'Supermercado', 'Panamá Oeste, Juan Demóstenes Arosemena, Vía Interamericana, Edf. CC Hato Montaña', 8.920935, -79.709539, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Compañía Goly, S.A. - Compañía Goly, S.A.-Hato Montaña' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Criollissimo', 'Restaurante', 'Panamá Oeste, Arraiján, Vista Alegre, Westland Mall, Dep. FC-10', 8.920516, -79.705655, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Criollissimo' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Delicias Cardona', 'Restaurante', 'Panamá Oeste, Burunga, Arraiján', 8.906593, -79.835502, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Delicias Cardona' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Cielo Azul', 'Distribuidora', 'Panamá Oeste, La Chorrera, Detrás del Mercado de Abastos', 8.87779, -79.77851, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Cielo Azul' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora David Zhang', 'Distribuidora', 'Panamá Oeste, Arraiján, Urb. Vista Alegre, Nuevo Arraijan, Calle 7ma, Vía Matadero, Local 2', 8.925412, -79.703625, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora David Zhang' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Frutas y Vegetales Tito', 'Distribuidora', 'Panamá Oeste, La Chorrera, Barrio Colón, Ave. Mariano Rivera', 8.870158, -79.779841, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Frutas y Vegetales Tito' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Jun', 'Distribuidora', 'Panamá Oeste, La Chorrera, Calle Del Puerto', 8.878972, -79.778955, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Jun' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Kingdom', 'Distribuidora', 'Panamá Oeste, La Chorrera, Barrio Colón, Calle del Puerto casa 3791', 8.870122, -79.779445, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Kingdom' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Mayorista Angelica', 'Distribuidora', 'Panamá Oeste, Carretera Panamericana, Vista Alegre', 8.928112, -79.702885, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Mayorista Angelica' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Mayorista Angelica : Distribuidora Mayorista Angelica', 'Distribuidora', 'Panamá Oeste, La Chorrera, Frente a Banco Mercantil cerca de banistmo, Calle Las Américas, Barrio Balboa', 8.872039, -79.781359, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Mayorista Angelica : Distribuidora Mayorista Angelica' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Mayorista Angelica : Distribuidora Mayorista Angelica N 2', 'Distribuidora', 'Panamá Oeste, Arraiján, Vista Alegre, Vía Panamericana, Urb. Residencial Vista Alegre, Edf. Angelica, Local N 2', 8.925909, -79.701545, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Mayorista Angelica : Distribuidora Mayorista Angelica N 2' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Mayorista Angelica CH- NO USAR', 'Distribuidora', 'Panamá Oeste, Arraiján, Vista Alegre, Vía Panamericana, Dep. 2., Urb. Residencial Vista Alegre', 8.924961, -79.702331, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Mayorista Angelica CH- NO USAR' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Pompon', 'Distribuidora', 'Panamá Oeste, Arraiján, Juan Demóstenes, Calle 1ra, Mercadito Nuevo Arraiján', 8.932954, -79.685332, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Pompon' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Prosperidad, S.A', 'Distribuidora', 'Panamá Oeste, La Chorrera, Avenida de las Américas, Edif. 3520', 8.877929, -79.781639, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Prosperidad, S.A' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Real Lio', 'Distribuidora', 'Panamá Oeste, Capira, Villa Rosario, Urb. Villa Milagro', 8.775432, -79.850935, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Real Lio' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Smart', 'Distribuidora', 'Panamá Oeste, Capira, Cabecera, Vía Interamericana', 8.758421, -79.866451, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Smart' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora Victoria Sofia', 'Distribuidora', 'Panamá Oeste, Arraiján, Vista Alegre, Frente al Super 15 Rex. Vía Principal', 8.92762, -79.703922, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora Victoria Sofia' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora 168', 'Distribuidora', 'Panamá Oeste, La Chorrera, Barrio Colón, Ave. Mariano Rivera', 8.870086, -79.780429, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora 168' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Distribuidora 3 Estrellas', 'Distribuidora', 'Panamá Oeste, La Chorrera, Barrio Colón, Frente al Mercado de abastos', 8.879852, -79.781258, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Distribuidora 3 Estrellas' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'El Peruano Ceviches', 'Restaurante', 'Panamá Oeste, La Chorrera, Barrio Colón, Urb. Calle Larga, Ave. San Martín', 8.878215, -79.778272, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'El Peruano Ceviches' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Golden Express', 'Restaurante', 'Panamá Oeste, Arraiján, Vista Alegre, Westland Mall, FC-8', 8.921397, -79.705656, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Golden Express' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);
