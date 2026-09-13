-- Tabla principal de Reportes
CREATE TABLE IF NOT EXISTS reportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    departamento VARCHAR(255) NOT NULL, -- POLICÍA AEROPORTUARIA, G.O.T.A, BATORG
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora TIME NOT NULL DEFAULT CURRENT_TIME,
    asunto VARCHAR(255) NOT NULL, -- Recorrido Perimetral, Relevo de Turno / Puesto Fijo, Traslado de Personal
    narrativa TEXT,
    areas_recorrido TEXT,
    equipos_novedad TEXT,
    reporta_rango VARCHAR(100),
    reporta_placa VARCHAR(100),
    reporta_nombre VARCHAR(255),
    informa_rango VARCHAR(100),
    informa_placa VARCHAR(100),
    informa_nombre VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla para personal involucrado (Unidades)
CREATE TABLE IF NOT EXISTS reporte_unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    rol VARCHAR(100), -- Entrante, Saliente, Patrullaje, Correría, Trasladada
    rango VARCHAR(100),
    placa_institucional VARCHAR(100),
    nombre VARCHAR(255),
    destino VARCHAR(255), -- Destino (para traslados)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla para vehículos
CREATE TABLE IF NOT EXISTS reporte_vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    numero_movil VARCHAR(100),
    placa_vehiculo VARCHAR(100),
    conductor_nombre VARCHAR(255),
    conductor_id VARCHAR(100), -- Cédula o CIP
    correria VARCHAR(255), -- Correría (para BATORG)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas RLS básicas
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporte_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporte_vehiculos ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura/escritura (Ajustar según esquema de auth si es necesario)
CREATE POLICY "Permitir lectura autenticada reportes" ON reportes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada reportes" ON reportes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura autenticada reporte_unidades" ON reporte_unidades FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada reporte_unidades" ON reporte_unidades FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura autenticada reporte_vehiculos" ON reporte_vehiculos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada reporte_vehiculos" ON reporte_vehiculos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
