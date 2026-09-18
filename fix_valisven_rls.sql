-- SCRIPT PARA COMPARTIR DATOS DE VALISVEN ENTRE USUARIOS (CRISTHIAN Y JENNIFER)
-- Ejecuta esto en el SQL Editor de Supabase

-- Eliminar las políticas restrictivas antiguas (por si existen)
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios clientes" ON valisven_clientes;
DROP POLICY IF EXISTS "Usuarios pueden crear sus clientes" ON valisven_clientes;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus clientes" ON valisven_clientes;
DROP POLICY IF EXISTS "Usuarios pueden borrar sus clientes" ON valisven_clientes;

DROP POLICY IF EXISTS "Usuarios pueden ver sus propias licencias" ON valisven_licencias;
DROP POLICY IF EXISTS "Usuarios pueden crear sus licencias" ON valisven_licencias;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus licencias" ON valisven_licencias;
DROP POLICY IF EXISTS "Usuarios pueden borrar sus licencias" ON valisven_licencias;

DROP POLICY IF EXISTS "Usuarios pueden ver sus licencias activas" ON valisven_licencias_activas;
DROP POLICY IF EXISTS "Usuarios pueden crear sus licencias activas" ON valisven_licencias_activas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus licencias activas" ON valisven_licencias_activas;
DROP POLICY IF EXISTS "Usuarios pueden borrar sus licencias activas" ON valisven_licencias_activas;

DROP POLICY IF EXISTS "Usuarios pueden ver sus ventas" ON valisven_ventas;
DROP POLICY IF EXISTS "Usuarios pueden crear sus ventas" ON valisven_ventas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus ventas" ON valisven_ventas;
DROP POLICY IF EXISTS "Usuarios pueden borrar sus ventas" ON valisven_ventas;

-- CREAR NUEVAS POLÍTICAS COMPARTIDAS (Cualquier usuario logueado puede ver y editar todo)

-- CLIENTES
CREATE POLICY "Compartido: Ver clientes" ON valisven_clientes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Crear clientes" ON valisven_clientes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Actualizar clientes" ON valisven_clientes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Borrar clientes" ON valisven_clientes FOR DELETE USING (auth.role() = 'authenticated');

-- LICENCIAS
CREATE POLICY "Compartido: Ver licencias" ON valisven_licencias FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Crear licencias" ON valisven_licencias FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Actualizar licencias" ON valisven_licencias FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Borrar licencias" ON valisven_licencias FOR DELETE USING (auth.role() = 'authenticated');

-- LICENCIAS ACTIVAS
CREATE POLICY "Compartido: Ver licencias activas" ON valisven_licencias_activas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Crear licencias activas" ON valisven_licencias_activas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Actualizar licencias activas" ON valisven_licencias_activas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Borrar licencias activas" ON valisven_licencias_activas FOR DELETE USING (auth.role() = 'authenticated');

-- VENTAS
CREATE POLICY "Compartido: Ver ventas" ON valisven_ventas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Crear ventas" ON valisven_ventas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Actualizar ventas" ON valisven_ventas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Compartido: Borrar ventas" ON valisven_ventas FOR DELETE USING (auth.role() = 'authenticated');
