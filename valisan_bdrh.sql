-- Script para crear la tabla valisan_bdrh en Supabase
-- Ejecuta este script en el SQL Editor de tu panel de Supabase

CREATE TABLE IF NOT EXISTS valisan_bdrh (
    id SERIAL PRIMARY KEY,
    pos_id VARCHAR(50),
    rango VARCHAR(100),
    nombre_completo VARCHAR(255),
    cedula VARCHAR(50),
    grupo_pd VARCHAR(100),
    turno VARCHAR(100),
    base VARCHAR(255),
    direccion VARCHAR(255),
    jef VARCHAR(100),
    departamento VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar las políticas de seguridad (RLS)
ALTER TABLE valisan_bdrh ENABLE ROW LEVEL SECURITY;

-- Política para permitir que cualquier usuario autenticado pueda ver los registros
CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON valisan_bdrh FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir insertar/actualizar/eliminar solo si es necesario (puedes ajustarla)
CREATE POLICY "Permitir gestión completa a administradores" 
ON valisan_bdrh FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);
