import { createClient } from '@supabase/supabase-js';

// Cliente Supabase con permisos de servicio para consultas del Bot
function getBotSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function makeProgressBar(percent: number, length = 10): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filledCount = Math.round((clamped / 100) * length);
  const emptyCount = length - filledCount;
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
}

// ─────────────────────────────────────────────────────────────────────────────
// 🟢 CONSULTAS VALISFIN (0 TOKENS)
// ─────────────────────────────────────────────────────────────────────────────

export async function getPendingPaymentsMessage(): Promise<string> {
  const supabase = getBotSupabase();
  const d = new Date();
  const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const { data: payments, error } = await supabase
    .from('fixed_payments')
    .select('*')
    .eq('period', period)
    .order('due_date', { ascending: true });

  if (error || !payments) {
    return '❌ Error al consultar pagos en la base de datos.';
  }

  const pending = payments.filter(p => !p.is_paid);
  const completed = payments.filter(p => p.is_paid);
  const totalPending = pending.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  if (pending.length === 0) {
    return `🎉 <b>¡Todo al día!</b>\nNo tienes pagos fijos pendientes para el periodo <b>${period}</b>.\nPagos completados este mes: ${completed.length}.`;
  }

  let text = `💳 <b>Pagos Fijos Pendientes (${period})</b>\n\n`;
  pending.forEach(p => {
    const due = p.due_date ? p.due_date : 'Sin fecha';
    text += `• <b>${p.title || p.concept || 'Pago'}</b>: ${formatMoney(Number(p.amount || 0))}\n  📅 Vence: <code>${due}</code>\n`;
  });

  text += `\n💰 <b>Total Pendiente: ${formatMoney(totalPending)}</b>\n`;
  text += `✅ Pagos ya cancelados: ${completed.length}`;
  return text;
}

export async function getMonthlyExpensesMessage(): Promise<string> {
  const supabase = getBotSupabase();
  const d = new Date();
  const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const { data: expenses, error } = await supabase
    .from('daily_expenses')
    .select('*')
    .gte('date', `${period}-01`)
    .lte('date', `${period}-31`);

  if (error || !expenses) {
    return '❌ Error al consultar los gastos diarios.';
  }

  if (expenses.length === 0) {
    return `🛒 <b>Gastos de ${period}</b>\n\nNo se han registrado gastos en lo que va del mes.`;
  }

  const categoryTotals: Record<string, number> = {};
  let totalSpent = 0;

  expenses.forEach(e => {
    const cat = e.category || 'Otros';
    const amt = Number(e.amount || 0);
    totalSpent += amt;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7);

  let text = `🛒 <b>Resumen de Gastos (${period})</b>\n\n`;
  sortedCategories.forEach(([cat, amt]) => {
    const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
    text += `• <b>${cat}</b>: ${formatMoney(amt)} (<code>${pct}%</code>)\n`;
  });

  text += `\n💵 <b>Total Acumulado: ${formatMoney(totalSpent)}</b> (${expenses.length} transacciones)`;
  return text;
}

export async function getVehiclesMessage(): Promise<string> {
  const supabase = getBotSupabase();

  const [vehiclesRes, maintenanceRes, metricsRes] = await Promise.all([
    supabase.from('vehicles').select('*'),
    supabase.from('maintenance').select('*').order('date', { ascending: false }).limit(6),
    supabase.from('vehicle_metrics').select('*').order('created_at', { ascending: false }).limit(1).single()
  ]);

  const vehicles = vehiclesRes.data || [];
  if (vehicles.length === 0) {
    return '🚗 No hay vehículos registrados en el sistema.';
  }

  let text = `🚗 <b>Flota Familiar - ValisFin</b>\n\n`;

  vehicles.forEach((v: any) => {
    const km = v.current_mileage ? `${Number(v.current_mileage).toLocaleString()} km` : 'No registrado';
    text += `🚘 <b>${v.make} ${v.model} (${v.year || ''})</b>\n`;
    text += `• Placa: <code>${v.plate || 'N/A'}</code>\n`;
    text += `• Odómetro: <b>${km}</b>\n`;
    text += `• Conductor: ${v.primary_driver || 'Familiar'}\n\n`;
  });

  const lastMaint = maintenanceRes.data || [];
  if (lastMaint.length > 0) {
    text += `🔧 <b>Últimos Mantenimientos:</b>\n`;
    lastMaint.slice(0, 3).forEach((m: any) => {
      text += `• ${m.title || m.type} (${m.date || 'S/F'}): ${formatMoney(Number(m.cost || 0))}\n`;
    });
  }

  return text;
}

export async function getGoalsMessage(): Promise<string> {
  const supabase = getBotSupabase();

  const { data: goals, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !goals || goals.length === 0) {
    return '🎯 No hay metas de ahorro activas registradas en ValisFin.';
  }

  let text = `🎯 <b>Metas de Ahorro Familiares</b>\n\n`;

  goals.forEach((g: any) => {
    const current = Number(g.saved_amount ?? g.current_amount ?? 0);
    const target = Number(g.target_amount || 1);
    const pct = Math.min(100, Math.round((current / target) * 100));
    const bar = makeProgressBar(pct, 8);

    text += `• <b>${g.title || g.name}</b>\n`;
    text += `  [${bar}] <b>${pct}%</b>\n`;
    text += `  Ahorrado: ${formatMoney(current)} / ${formatMoney(target)}\n\n`;
  });

  return text;
}

export async function getHomeTasksMessage(): Promise<string> {
  const supabase = getBotSupabase();

  const { data: tasks, error } = await supabase
    .from('home_tasks')
    .select('*')
    .neq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error || !tasks || tasks.length === 0) {
    return '🛠️ <b>Tareas del Hogar:</b>\n\n🎉 ¡No hay tareas pendientes en este momento!';
  }

  let text = `🛠️ <b>Tareas Pendientes del Hogar</b>\n\n`;
  tasks.forEach((t: any) => {
    const prio = t.priority === 'high' ? '🔴 Alta' : (t.priority === 'medium' ? '🟡 Media' : '🟢 Normal');
    text += `• <b>${t.title}</b> (${prio})\n`;
    if (t.description) text += `  ${t.description.slice(0, 50)}...\n`;
  });

  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔴 CONSULTAS VALISBIZ (0 TOKENS)
// ─────────────────────────────────────────────────────────────────────────────

export async function getBizMetricsMessage(): Promise<string> {
  const supabase = getBotSupabase();
  const now = new Date();
  const mes = now.getMonth() + 1;
  const anio = now.getFullYear();

  const [vendedoresRes, facturadoRes] = await Promise.all([
    supabase.from('vendedores').select('*').eq('activo', true),
    supabase.from('facturado').select('*').eq('mes_periodo', mes).eq('anio_periodo', anio)
  ]);

  const vendedores = vendedoresRes.data || [];
  const facturado = facturadoRes.data || [];

  const cuotaGlobal = vendedores.reduce((acc, v) => acc + Number(v.cuota_mensual || 0), 0) || 85000;
  const totalFacturado = facturado.reduce((acc, f) => acc + Number(f.monto_facturado || 0), 0);
  const porcentaje = cuotaGlobal > 0 ? (totalFacturado / cuotaGlobal) * 100 : 0;
  const gap = cuotaGlobal - totalFacturado;
  const bar = makeProgressBar(porcentaje, 10);

  let text = `📈 <b>Métricas ValisBiz • Supervisión Keiko</b>\n`;
  text += `📅 Periodo: <b>${mes}/${anio}</b>\n\n`;
  text += `🎯 Cuota Global: <b>${formatMoney(cuotaGlobal)}</b>\n`;
  text += `💰 Facturado Total: <b>${formatMoney(totalFacturado)}</b>\n`;
  text += `📊 Avance: [${bar}] <b>${porcentaje.toFixed(1)}%</b>\n`;
  text += `📉 GAP Restante: <b>${formatMoney(Math.max(0, gap))}</b>\n\n`;
  text += `👥 Vendedores activos: ${vendedores.length}`;

  return text;
}

export async function getBizSellersMessage(): Promise<string> {
  const supabase = getBotSupabase();
  const now = new Date();
  const mes = now.getMonth() + 1;
  const anio = now.getFullYear();

  const [vendedoresRes, facturadoRes] = await Promise.all([
    supabase.from('vendedores').select('*').order('nombre', { ascending: true }),
    supabase.from('facturado').select('*').eq('mes_periodo', mes).eq('anio_periodo', anio)
  ]);

  const vendedores = vendedoresRes.data || [];
  const facturado = facturadoRes.data || [];

  if (vendedores.length === 0) {
    return '👥 No se encontraron vendedores registrados.';
  }

  let text = `👥 <b>Rendimiento por Vendedor (${mes}/${anio})</b>\n\n`;

  vendedores.forEach((v: any) => {
    const ventasVendedor = facturado.filter((f: any) => f.vendedor_id === v.id);
    const total = ventasVendedor.reduce((acc: number, f: any) => acc + Number(f.monto_facturado || 0), 0);
    const cuota = Number(v.cuota_mensual || 0);
    const pct = cuota > 0 ? (total / cuota) * 100 : 0;

    text += `👤 <b>${v.nombre}</b> (${v.ruta_asignada || 'Ruta'})\n`;
    text += `  • Facturado: ${formatMoney(total)} / ${formatMoney(cuota)}\n`;
    text += `  • Logro: <b>${pct.toFixed(1)}%</b>\n\n`;
  });

  return text;
}

export async function getBizVisitsMessage(): Promise<string> {
  const supabase = getBotSupabase();
  const now = new Date();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const anio = now.getFullYear();

  const { data: visitas, error } = await supabase
    .from('visitas_mensuales')
    .select('id, estado_visita')
    .gte('fecha', `${anio}-${mes}-01`)
    .lt('fecha', `${anio}-${String(Number(mes) + 1).padStart(2, '0')}-01`);

  if (error || !visitas) {
    return '❌ Error al consultar las visitas.';
  }

  const total = visitas.length;
  const conCompra = visitas.filter(v => v.estado_visita === 'con_compra').length;
  const sinCompra = total - conCompra;
  const conversion = total > 0 ? Math.round((conCompra / total) * 100) : 0;

  let text = `📍 <b>Visitas a Locales (${mes}/${anio})</b>\n\n`;
  text += `• Total Visitas Realizadas: <b>${total}</b>\n`;
  text += `• Con Compra (Efectivas): <b>${conCompra}</b> (${conversion}%)\n`;
  text += `• Sin Compra: <b>${sinCompra}</b>\n`;

  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔵 CONSULTAS VALISAN (0 TOKENS)
// ─────────────────────────────────────────────────────────────────────────────

export async function getRecentReportsMessage(): Promise<string> {
  const supabase = getBotSupabase();

  const { data: reportes, error } = await supabase
    .from('reportes')
    .select('id, asunto, departamento, fecha, hora, reporta_nombre')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !reportes || reportes.length === 0) {
    return '📋 No hay reportes operativos recientes en AIPP.';
  }

  let text = `📋 <b>Últimos 5 Reportes Operativos AIPP</b>\n\n`;
  reportes.forEach((r: any, idx: number) => {
    text += `<b>${idx + 1}. ${r.asunto || 'Novedad'}</b>\n`;
    text += `• Depto: <code>${r.departamento}</code>\n`;
    text += `• Fecha: ${r.fecha} ${r.hora ? r.hora.slice(0, 5) : ''}\n`;
    if (r.reporta_nombre) text += `• Reporta: ${r.reporta_nombre}\n`;
    text += `\n`;
  });

  return text;
}

export async function getBdrhStatsMessage(): Promise<string> {
  const supabase = getBotSupabase();

  const { count, error } = await supabase
    .from('valisan_bdrh')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return '❌ Error al consultar estadísticas de BD-RH.';
  }

  let text = `👥 <b>Base de Datos de Recursos Humanos (BD-RH)</b>\n\n`;
  text += `🎖️ Total Personal Registrado: <b>${(count || 0).toLocaleString()} efectivos</b>\n\n`;
  text += `💡 <i>Puedes buscar cualquier persona escribiendo:</i>\n`;
  text += `<code>/cip 12345</code> o <code>/cedula 8-123-456</code>`;

  return text;
}

export async function searchBdrhPerson(term: string): Promise<string> {
  const cleanTerm = term.trim();
  if (!cleanTerm) return 'Ingresa un término de búsqueda. Ej: <code>/cip 12345</code>';

  const supabase = getBotSupabase();

  const { data, error } = await supabase
    .from('valisan_bdrh')
    .select('*')
    .or(`cip.ilike.%${cleanTerm}%,cedula.ilike.%${cleanTerm}%,nombre_completo.ilike.%${cleanTerm}%`)
    .limit(4);

  if (error || !data || data.length === 0) {
    return `🔍 No se encontraron registros en BD-RH para: <code>${cleanTerm}</code>`;
  }

  let text = `🔍 <b>Resultados en BD-RH para "${cleanTerm}":</b>\n\n`;
  data.forEach((p: any) => {
    text += `👤 <b>${p.nombre_completo || p.nombre || 'Efectivo'}</b>\n`;
    text += `• Rango: <b>${p.rango || 'N/A'}</b>\n`;
    text += `• CIP: <code>${p.cip || 'N/A'}</code> | Cédula: <code>${p.cedula || 'N/A'}</code>\n`;
    if (p.departamento) text += `• Departamento: ${p.departamento}\n`;
    text += `\n`;
  });

  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📊 RESUMEN GENERAL (VALISHUB)
// ─────────────────────────────────────────────────────────────────────────────

export async function getValisHubSummaryMessage(): Promise<string> {
  const supabase = getBotSupabase();
  const d = new Date();
  const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const [paymentsRes, expensesRes, sellersRes] = await Promise.all([
    supabase.from('fixed_payments').select('amount, is_paid').eq('period', period),
    supabase.from('daily_expenses').select('amount').gte('date', `${period}-01`),
    supabase.from('vendedores').select('cuota_mensual').eq('activo', true)
  ]);

  const payments = paymentsRes.data || [];
  const pendingPayments = payments.filter(p => !p.is_paid).reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalExpenses = (expensesRes.data || []).reduce((acc, e) => acc + Number(e.amount || 0), 0);

  let text = `📊 <b>Resumen General • ValisHub (${period})</b>\n\n`;
  text += `🟢 <b>ValisFin:</b>\n`;
  text += `• Pagos pendientes: <b>${formatMoney(pendingPayments)}</b>\n`;
  text += `• Gastos del mes: <b>${formatMoney(totalExpenses)}</b>\n\n`;

  text += `🔴 <b>ValisBiz:</b>\n`;
  text += `• Vendedores activos Keiko: ${(sellersRes.data || []).length}\n\n`;

  text += `💡 <i>Toca los botones abajo para explorar cada módulo en detalle sin consumir tokens.</i>`;
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ REGISTRO RÁPIDO DE GASTO
// ─────────────────────────────────────────────────────────────────────────────

export async function registerQuickExpense(amount: number, category: string, detail: string): Promise<string> {
  const supabase = getBotSupabase();
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase.from('daily_expenses').insert({
    date: today,
    category,
    detail,
    amount,
    is_credit_card: false,
  });

  if (error) {
    console.error('Error insertando gasto:', error);
    return `❌ No se pudo guardar el gasto: ${error.message}`;
  }

  return `✅ <b>Gasto guardado con éxito</b>\n\n💵 Monto: <b>${formatMoney(amount)}</b>\n📂 Categoría: <b>${category}</b>\n📝 Detalle: <i>${detail}</i>\n📅 Fecha: <code>${today}</code>`;
}
