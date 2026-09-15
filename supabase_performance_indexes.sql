-- ==============================================================================
-- INDICES DE RENDIMIENTO PARA SUPABASE (VALISHUB / VALISFIN / VALISBIZ / VALISAN)
-- Ejecutar en el Editor SQL de tu proyecto en Supabase (Dashboard -> SQL Editor)
-- Estos índices aceleran drásticamente las consultas, filtros y uniones de tablas.
-- ==============================================================================

-- 1. Visitas Mensuales (ValisBiz)
CREATE INDEX IF NOT EXISTS idx_visitas_mensuales_fecha ON visitas_mensuales(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_visitas_mensuales_vendedor ON visitas_mensuales(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_visitas_mensuales_local ON visitas_mensuales(local_id);

-- 2. Locales y Vendedores (ValisBiz)
CREATE INDEX IF NOT EXISTS idx_locales_vendedor ON locales(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_locales_tipo ON locales(tipo);
CREATE INDEX IF NOT EXISTS idx_locales_activo ON locales(activo);

-- 3. Facturado y Registros de Ventas (ValisBiz)
CREATE INDEX IF NOT EXISTS idx_facturado_periodo ON facturado(anio_periodo, mes_periodo);
CREATE INDEX IF NOT EXISTS idx_facturado_vendedor ON facturado(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_registros_ventas_periodo ON registros_ventas(anio_periodo, mes_periodo);
CREATE INDEX IF NOT EXISTS idx_registros_ventas_vendedor ON registros_ventas(vendedor_id);

-- 4. Pagos Fijos (ValisFin)
CREATE INDEX IF NOT EXISTS idx_fixed_payments_period ON fixed_payments(period);
CREATE INDEX IF NOT EXISTS idx_fixed_payments_profile ON fixed_payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_fixed_payments_is_paid ON fixed_payments(is_paid);

-- 5. Gastos Diarios e Ingresos (ValisFin)
CREATE INDEX IF NOT EXISTS idx_daily_expenses_date ON daily_expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_expenses_profile ON daily_expenses(profile_id);
CREATE INDEX IF NOT EXISTS idx_daily_expenses_category ON daily_expenses(category);
CREATE INDEX IF NOT EXISTS idx_incomes_date_expected ON incomes(date_expected DESC);
CREATE INDEX IF NOT EXISTS idx_incomes_profile ON incomes(profile_id);

-- 6. ValisAN - BD-RH (Más de 5,200 registros de personal)
CREATE INDEX IF NOT EXISTS idx_bdrh_cip ON valisan_bdrh(cip);
CREATE INDEX IF NOT EXISTS idx_bdrh_cedula ON valisan_bdrh(cedula);
CREATE INDEX IF NOT EXISTS idx_bdrh_rango ON valisan_bdrh(rango);
CREATE INDEX IF NOT EXISTS idx_bdrh_departamento ON valisan_bdrh(departamento);

-- 7. ValisAN - Reportes Operativos
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_departamento ON reportes(departamento);
CREATE INDEX IF NOT EXISTS idx_reportes_created_at ON reportes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reporte_unidades_rep_id ON reporte_unidades(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reporte_vehiculos_rep_id ON reporte_vehiculos(reporte_id);

-- 8. Vehículos, Mantenimiento y Auditoría
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
