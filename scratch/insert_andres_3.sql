
INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Maxi Carnes', 'Supermercado', 'Panamá Oeste, Arraiján, Vacamonte, Calle 9na, Principal', 8.89855, -79.605295, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Maxi Carnes' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Superprecio', 'Supermercado', 'Panamá Oeste, Arraiján, Arraiján Cabecera, Urb. 7 de septiembre', 8.946833, -79.659966, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Superprecio' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Anclas Mall', 'Supermercado', 'Panamá Oeste, Anclas Mall', 8.882926, -79.768245, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Anclas Mall' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Arraiján', 'Supermercado', 'Panamá Oeste, Arraiján', 8.930024, -79.648061, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Arraiján' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Capira', 'Supermercado', 'Panamá Oeste, Capira, Villa Carmen, Xtra Market', 8.757182, -79.866706, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Capira' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Coronado', 'Supermercado', 'Panamá Oeste, Coronado, Mi Feria Xtra', 8.528991, -79.902875, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Coronado' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera', 'Supermercado', 'Panamá Oeste, La Chorrera', 8.876628, -79.782775, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera, Maxi Feria Xtra', 'Supermercado', 'Panamá Oeste, La Chorrera, Maxi Feria Xtra', 8.878715, -79.779126, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera, Maxi Feria Xtra' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera, Xtra Market', 'Supermercado', 'Panamá Oeste, La Chorrera, Xtra Market', 8.877485, -79.778562, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Chorrera, Xtra Market' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Marquesa', 'Supermercado', 'Panamá, La Marquesa', 8.879554, -79.78035, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-La Marquesa' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Llano Largo, Maxi Feria Xtra', 'Supermercado', 'Panamá Oeste, La Chorrera, Playa Leona, Calle principal Llano Largo, Maxi Feria Xtra, Dep. Maxi Feria, Urb. Llano Largo', 8.896558, -79.775004, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Llano Largo, Maxi Feria Xtra' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Vacamonte, Maxi Feria Xtra', 'Supermercado', 'Panamá Oeste, Arraiján, Vista Alegre, Vía Puerto Vacamonte, Edf. Vacamonte Plaza, Dep. Maxi Feria Xtra, Urb. La Hacienda', 8.928797, -79.700392, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Vacamonte, Maxi Feria Xtra' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Vista Alegre', 'Supermercado', 'Panamá Oeste, Vista Alegre', 8.920049, -79.705857, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Supermercado Xtra, S.A. : Supermercado Xtra, S.A.-Vista Alegre' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Temek, S.A. : Temek, S.A.-El Fuerte 6 - La Onda', 'Supermercado', 'Panamá Oeste, Arraiján, Burunga, Calle principal, C.C. Burunga, Planta Baja, Urb. Después de la Delta de Burunga', 8.964609, -79.655106, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Temek, S.A. : Temek, S.A.-El Fuerte 6 - La Onda' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Temek, S.A. : Temek, S.A.-Westland Mall', 'Supermercado', 'Panamá Oeste, Westland Mall', 8.920797, -79.704578, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Temek, S.A. : Temek, S.A.-Westland Mall' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);

INSERT INTO locales (nombre_local, tipo, direccion, latitud, longitud, foto_url, vendedor_id, activo)
SELECT 'Viveros y Legumbres Urriola', 'Distribuidora', 'Panamá, La Chorrera, Barrio Balboa, Urb. El Marañonal, Mercado de Abastos', 8.876511, -79.781689, 'https://images.unsplash.com/photo-1586528116311-ad8eb745d447?w=800&q=80', '1b3f2384-0469-4a49-8fd8-6c803209f556', true
WHERE NOT EXISTS (
  SELECT 1 FROM locales WHERE nombre_local = 'Viveros y Legumbres Urriola' AND vendedor_id = '1b3f2384-0469-4a49-8fd8-6c803209f556'
);
