CREATE TABLE IF NOT EXISTS visitas_mensuales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local_id UUID REFERENCES locales(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES vendedores(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado_visita TEXT CHECK (estado_visita IN ('con_compra', 'sin_compra')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS si aplica
ALTER TABLE visitas_mensuales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a usuarios autenticados" ON visitas_mensuales FOR ALL USING (auth.role() = 'authenticated');

-- Insertar locales de prueba en Panamá Oeste si no existen
INSERT INTO locales (nombre_local, cadena, latitud, longitud, direccion)
SELECT 'Super Xtra Arraiján Cabecera', 'Otro', 8.9483, -79.6541, 'Arraiján'
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE nombre_local = 'Super Xtra Arraiján Cabecera');

INSERT INTO locales (nombre_local, cadena, latitud, longitud, direccion)
SELECT 'Rey Vista Alegre', 'Rey', 8.9197, -79.7025, 'Nuevo Arraiján'
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE nombre_local = 'Rey Vista Alegre');

INSERT INTO locales (nombre_local, cadena, latitud, longitud, direccion)
SELECT 'Super 99 Valle Hermoso', 'Super 99', 8.9052, -79.7314, 'Nuevo Arraiján'
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE nombre_local = 'Super 99 Valle Hermoso');

INSERT INTO locales (nombre_local, cadena, latitud, longitud, direccion)
SELECT 'Riba Smith Costa Verde', 'Riba Smith', 8.8955, -79.7612, 'La Chorrera'
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE nombre_local = 'Riba Smith Costa Verde');

INSERT INTO locales (nombre_local, cadena, latitud, longitud, direccion)
SELECT 'Super 99 La Chorrera Centro', 'Super 99', 8.8781, -79.7828, 'La Chorrera'
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE nombre_local = 'Super 99 La Chorrera Centro');

INSERT INTO locales (nombre_local, cadena, latitud, longitud, direccion)
SELECT 'Mr. Precio La Chorrera', 'Mr. Precio', 8.8824, -79.7853, 'La Chorrera'
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE nombre_local = 'Mr. Precio La Chorrera');

INSERT INTO locales (nombre_local, cadena, latitud, longitud, direccion)
SELECT 'Rey La Chorrera', 'Rey', 8.8856, -79.7801, 'La Chorrera'
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE nombre_local = 'Rey La Chorrera');
