-- =========================================================================
-- VALISVEN: ESTRUCTURA DE BASE DE DATOS Y RLS
-- =========================================================================

-- 1. TABLA: CLIENTES
CREATE TABLE IF NOT EXISTS valisven_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  correo TEXT,
  celular TEXT
);

-- 2. TABLA: LICENCIAS (Catálogo de productos)
CREATE TABLE IF NOT EXISTS valisven_licencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- Ej: 'Streaming', 'Office & Windows', 'Seguridad'
  producto TEXT NOT NULL, -- Ej: 'Microsoft 365 Familia'
  costo_distribuidor NUMERIC NOT NULL DEFAULT 0,
  costo_venta NUMERIC NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: LICENCIAS ACTIVAS (Inventario / Bóveda / Asignadas)
CREATE TABLE IF NOT EXISTS valisven_licencias_activas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  licencia_id UUID REFERENCES valisven_licencias(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES valisven_clientes(id) ON DELETE SET NULL, -- Null si está en Bóveda
  clave_credencial TEXT, -- El código de activación o credencial
  fecha_activacion DATE,
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'Bóveda', -- 'Bóveda', 'Activa', 'Por Vencer', 'Vencida'
  observacion TEXT,
  fecha_ingreso TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: VENTAS
CREATE TABLE IF NOT EXISTS valisven_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  cliente_id UUID REFERENCES valisven_clientes(id) ON DELETE CASCADE NOT NULL,
  licencia_activa_id UUID REFERENCES valisven_licencias_activas(id) ON DELETE SET NULL,
  tipo_venta TEXT NOT NULL, -- Ej: 'Nueva Venta', 'Renovación'
  tiempo_vigencia TEXT, -- Ej: '1 Mes', '1 Año'
  costo_distribuidor NUMERIC NOT NULL DEFAULT 0,
  costo_venta NUMERIC NOT NULL DEFAULT 0,
  ganancia_neta NUMERIC NOT NULL DEFAULT 0
);

-- 5. VISTA AUTOMÁTICA: FINANZAS (Resumen Mensual)
-- Esta vista agrupa las ventas por mes y año y suma los valores automáticamente.
CREATE OR REPLACE VIEW valisven_finanzas AS
SELECT
  user_id,
  DATE_TRUNC('month', fecha)::DATE AS mes_periodo,
  COUNT(id) as total_ventas,
  SUM(costo_venta) AS facturacion_bruta,
  SUM(ganancia_neta) AS ganancia_real,
  SUM(costo_distribuidor) AS costo_proveedores
FROM valisven_ventas
GROUP BY user_id, DATE_TRUNC('month', fecha);

-- =========================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- Esto asegura que cada usuario solo vea sus propios datos.
-- =========================================================================

ALTER TABLE valisven_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE valisven_licencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE valisven_licencias_activas ENABLE ROW LEVEL SECURITY;
ALTER TABLE valisven_ventas ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA CLIENTES
CREATE POLICY "Usuarios pueden ver sus propios clientes" 
ON valisven_clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden crear sus clientes" 
ON valisven_clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus clientes" 
ON valisven_clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden borrar sus clientes" 
ON valisven_clientes FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS PARA LICENCIAS (Catálogo)
CREATE POLICY "Usuarios pueden ver sus propias licencias" 
ON valisven_licencias FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden crear sus licencias" 
ON valisven_licencias FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus licencias" 
ON valisven_licencias FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden borrar sus licencias" 
ON valisven_licencias FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS PARA LICENCIAS ACTIVAS
CREATE POLICY "Usuarios pueden ver sus licencias activas" 
ON valisven_licencias_activas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden crear sus licencias activas" 
ON valisven_licencias_activas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus licencias activas" 
ON valisven_licencias_activas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden borrar sus licencias activas" 
ON valisven_licencias_activas FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS PARA VENTAS
CREATE POLICY "Usuarios pueden ver sus ventas" 
ON valisven_ventas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden crear sus ventas" 
ON valisven_ventas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus ventas" 
ON valisven_ventas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden borrar sus ventas" 
ON valisven_ventas FOR DELETE USING (auth.uid() = user_id);
