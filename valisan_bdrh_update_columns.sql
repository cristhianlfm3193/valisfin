-- =====================================================================
-- EJECUTA ESTE SCRIPT EN EL EDITOR SQL DE TU PANEL DE SUPABASE
-- Proyecto: ValisFin / ValisAN BD-RH
-- =====================================================================

ALTER TABLE valisan_bdrh 
ADD COLUMN IF NOT EXISTS nombre VARCHAR(150),
ADD COLUMN IF NOT EXISTS apellido VARCHAR(150),
ADD COLUMN IF NOT EXISTS genero VARCHAR(50),
ADD COLUMN IF NOT EXISTS cargo VARCHAR(255),
ADD COLUMN IF NOT EXISTS codigo_cargo VARCHAR(100),
ADD COLUMN IF NOT EXISTS salario NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sobresueldo NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
ADD COLUMN IF NOT EXISTS objeto_gasto VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado VARCHAR(100);

-- Opcional: Índice para acelerar búsquedas por cédula
CREATE INDEX IF NOT EXISTS idx_valisan_bdrh_cedula ON valisan_bdrh(cedula);
CREATE INDEX IF NOT EXISTS idx_valisan_bdrh_pos_id ON valisan_bdrh(pos_id);
