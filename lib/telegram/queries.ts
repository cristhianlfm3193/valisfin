import { createClient } from '@supabase/supabase-js';
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from './bot';

// Cliente Supabase con permisos de servicio para consultas del Bot
function getBotSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = 
    process.env.SUPABASE_SECRET_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY || 
    process.env.SERVICE_ROLE_KEY || 
    process.env.SUPABASE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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

export async function getPendingPaymentsInteractive(): Promise<{ text: string; replyMarkup?: InlineKeyboardMarkup }> {
  const supabase = getBotSupabase();
  const d = new Date();
  const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const { data: payments, error } = await supabase
    .from('fixed_payments')
    .select('*')
    .eq('period', period)
    .order('billing_day', { ascending: true, nullsFirst: false });

  if (error || !payments) {
    console.error('Error getPendingPaymentsInteractive:', error);
    return { text: '❌ Error al consultar pagos en la base de datos.' };
  }

  const pending = payments.filter(p => !p.is_paid);
  const completed = payments.filter(p => p.is_paid);
  const totalPending = pending.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  if (pending.length === 0) {
    return {
      text: `🎉 <b>¡Todo al día!</b>\nNo tienes pagos fijos pendientes para el periodo <b>${period}</b>.\nPagos completados este mes: ${completed.length}.`
    };
  }

  let text = `💳 <b>Pagos Fijos Pendientes (${period})</b>\n\n`;
  pending.forEach(p => {
    const due = p.billing_day ? `Día ${p.billing_day}` : (p.subtitle || 'Mensual');
    text += `• <b>${p.title || 'Pago'}</b>: ${formatMoney(Number(p.amount || 0))} (<code>${due}</code>)\n`;
  });

  text += `\n💰 <b>Total Pendiente: ${formatMoney(totalPending)}</b>\n`;
  text += `✅ Pagos ya cancelados: ${completed.length}\n\n`;
  text += `👇 <i>Toca un botón para registrar el pago con 1 toque:</i>`;

  // Construir botonera interactiva: 1 botón por cada pago pendiente
  const buttons = pending.map(p => ([
    {
      text: `💳 Pagar ${p.title} (${formatMoney(Number(p.amount || 0))})`,
      callback_data: `pay_fp:${p.id}`
    }
  ]));

  return {
    text,
    replyMarkup: { inline_keyboard: buttons }
  };
}

export async function getPendingPaymentsMessage(): Promise<string> {
  const res = await getPendingPaymentsInteractive();
  return res.text;
}

export async function getMonthlyExpensesMessage(): Promise<string> {
  const supabase = getBotSupabase();
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDayDate = new Date(year, month + 1, 0);
  const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
  const period = `${year}-${String(month + 1).padStart(2, '0')}`;

  const { data: expenses, error } = await supabase
    .from('daily_expenses')
    .select('*')
    .gte('date', firstDay)
    .lte('date', lastDay);

  if (error || !expenses) {
    console.error('Error fetching daily expenses:', error);
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

export async function getItemizedExpensesList(): Promise<string> {
  const supabase = getBotSupabase();
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDayDate = new Date(year, month + 1, 0);
  const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

  const { data: expenses, error } = await supabase
    .from('daily_expenses')
    .select('date, category, detail, amount, is_credit_card')
    .gte('date', firstDay)
    .lte('date', lastDay)
    .order('date', { ascending: false });

  if (error || !expenses || expenses.length === 0) {
    return 'No hay compras registradas en este mes.';
  }

  return expenses.map((e: any) => `- ${e.date} | ${e.category}: ${e.detail} (${formatMoney(Number(e.amount || 0))})${e.is_credit_card ? ' [TC]' : ''}`).join('\n');
}

function cleanText(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/Capit[\ufffd\xef\xbf\xbd]n/gi, 'Capitán')
    .replace(/[\ufffd]/g, 'á');
}

export async function getVehiclesMessage(): Promise<string> {
  const supabase = getBotSupabase();

  const [vehiclesRes, maintenanceRes, profilesRes] = await Promise.all([
    supabase.from('vehicles').select('*').order('created_at', { ascending: true }),
    supabase.from('maintenance').select('*').order('date', { ascending: false }),
    supabase.from('profiles').select('id, first_name')
  ]);

  const vehicles = vehiclesRes.data || [];
  if (vehicles.length === 0) {
    return '🚗 No hay vehículos registrados en el sistema.';
  }

  const profilesMap: Record<string, string> = {};
  (profilesRes.data || []).forEach((p: any) => {
    profilesMap[p.id] = p.first_name;
  });

  const allMaint = maintenanceRes.data || [];

  let text = `🚗 <b>Flota Familiar - ValisFin</b>\n\n`;

  vehicles.forEach((v: any) => {
    const brand = v.brand || v.make || 'Auto';
    const currentKm = Number(v.current_km ?? v.current_mileage ?? 0);
    const owner = profilesMap[v.owner_id] || 'Familiar';

    // Buscar último mantenimiento y próximo mantenimiento
    const vMaint = allMaint.filter((m: any) => m.vehicle_id === v.id);
    const nextMaint = vMaint.find((m: any) => m.next_km && Number(m.next_km) > currentKm);
    const lastDone = vMaint.find((m: any) => m.is_pending === false || m.status === 'completed');
    const pendingList = vMaint.filter((m: any) => m.is_pending === true || m.status === 'pending');

    text += `🚘 <b>${brand} ${v.model} (${v.year || ''})</b>\n`;
    text += `• Propietario: <b>${owner}</b>\n`;
    text += `• Placa: <code>${v.plate || 'N/A'}</code>\n`;
    text += `• Odómetro: <b>${currentKm.toLocaleString()} km</b>\n`;

    if (nextMaint) {
      const diff = Number(nextMaint.next_km) - currentKm;
      text += `• Próximo Servicio: <b>${Number(nextMaint.next_km).toLocaleString()} km</b> (le faltan <b>${Math.max(0, diff).toLocaleString()} km</b>)\n`;
    }

    if (lastDone) {
      const sDesc = lastDone.service || lastDone.title || 'Mantenimiento';
      text += `• Último servicio: ${sDesc} (${lastDone.date || 'S/F'}) - ${formatMoney(Number(lastDone.cost || 0))}\n`;
    }

    if (pendingList.length > 0) {
      text += `• ⚠️ Servicios pendientes (${pendingList.length}):\n`;
      pendingList.slice(0, 3).forEach((p: any) => {
        text += `   - ${p.service || p.title}: ${formatMoney(Number(p.cost || 0))}\n`;
      });
    }

    text += `\n`;
  });

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
    supabase.from('vendedores').select('*'),
    supabase.from('facturado').select('*').eq('mes_periodo', mes).eq('anio_periodo', anio)
  ]);

  const vendedores = vendedoresRes.data || [];
  const facturado = facturadoRes.data || [];

  const cuotaGlobal = vendedores.reduce((acc, v) => acc + Number(v.cuota_mensual || 0), 0) || 85000;
  
  const facturadoDelMes = facturado.reduce((acc, f) => acc + Number(f.monto_facturado || 0), 0);
  const ventaAcumuladaVendedores = vendedores.reduce((acc, v) => acc + Number(v.venta_real_acumulada || 0), 0);
  const totalVentas = facturadoDelMes > 0 ? facturadoDelMes : ventaAcumuladaVendedores;

  const porcentaje = cuotaGlobal > 0 ? (totalVentas / cuotaGlobal) * 100 : 0;
  const gap = cuotaGlobal - totalVentas;
  const bar = makeProgressBar(porcentaje, 10);

  let text = `📈 <b>Métricas ValisBiz • Supervisión Keiko</b>\n`;
  text += `📅 Periodo: <b>${mes}/${anio}</b>\n\n`;
  text += `🎯 Cuota Global: <b>${formatMoney(cuotaGlobal)}</b>\n`;
  text += `💰 Ventas Reales: <b>${formatMoney(totalVentas)}</b>\n`;
  text += `📊 Avance: [${bar}] <b>${porcentaje.toFixed(1)}%</b>\n`;
  if (gap > 0) {
    text += `📉 GAP Restante: <b>${formatMoney(gap)}</b>\n\n`;
  } else {
    text += `🎉 <b>Meta Superada por ${formatMoney(Math.abs(gap))}</b>\n\n`;
  }
  text += `👥 Vendedores registrados: ${vendedores.length}`;

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
    return '👥 No se encontraron vendedores registrados en la base de datos.';
  }

  let text = `👥 <b>Rendimiento por Vendedor (${mes}/${anio})</b>\n\n`;

  vendedores.forEach((v: any) => {
    const ventasFacturado = facturado
      .filter((f: any) => f.vendedor_id === v.id)
      .reduce((acc: number, f: any) => acc + Number(f.monto_facturado || 0), 0);
    
    const total = ventasFacturado > 0 ? ventasFacturado : Number(v.venta_real_acumulada || 0);
    const cuota = Number(v.cuota_mensual || 0);
    const pct = cuota > 0 ? (total / cuota) * 100 : Number(v.porcentaje_alcance || 0);
    const gap = cuota - total;
    const estado = v.estado ? `[${v.estado.toUpperCase()}]` : '';

    text += `👤 <b>${v.nombre}</b> ${estado} (${v.ruta_asignada || 'Ruta'})\n`;
    text += `  • Cuota: <b>${formatMoney(cuota)}</b>\n`;
    text += `  • Venta Real: <b>${formatMoney(total)}</b>\n`;
    text += `  • Logro: <b>${pct.toFixed(1)}%</b>`;
    if (gap > 0) {
      text += ` | GAP: <b>${formatMoney(gap)}</b>\n\n`;
    } else {
      text += ` | 🎉 <b>+${formatMoney(Math.abs(gap))} sobre cuota</b>\n\n`;
    }
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
  return await searchOperationalReports();
}

export async function searchOperationalReports(termOrDate?: string): Promise<string> {
  const supabase = getBotSupabase();
  let query = supabase
    .from('reportes')
    .select('*')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })
    .limit(6);

  if (termOrDate && termOrDate.trim()) {
    const clean = termOrDate.trim();
    query = supabase
      .from('reportes')
      .select('*')
      .or(`fecha.ilike.%${clean}%,asunto.ilike.%${clean}%,narrativa.ilike.%${clean}%,reporta_nombre.ilike.%${clean}%,departamento.ilike.%${clean}%`)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })
      .limit(6);
  }

  const { data: reportes, error } = await query;
  if (error || !reportes || reportes.length === 0) {
    return `📋 No se encontraron reportes operativos para: <code>${termOrDate || 'recientes'}</code>`;
  }

  let text = `📋 <b>Reportes Operativos AIPP (${reportes.length} encontrados)</b>\n\n`;
  reportes.forEach((r: any, idx: number) => {
    text += `<b>${idx + 1}. ${r.asunto || 'Novedad'}</b>\n`;
    text += `📅 Fecha: <code>${r.fecha}</code> | ⏰ Hora: <code>${r.hora ? r.hora.slice(0, 5) : 'S/H'}</code>\n`;
    text += `🏢 Depto: ${r.departamento || 'AIPP'}\n`;
    if (r.reporta_nombre) text += `👮 Informa: ${r.reporta_rango || ''} ${r.reporta_nombre} (${r.reporta_placa || ''})\n`;
    if (r.narrativa) {
      const shortNarrativa = r.narrativa.length > 280 ? r.narrativa.slice(0, 277) + '...' : r.narrativa;
      text += `📝 <i>${shortNarrativa}</i>\n`;
    }
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
  text += `🔍 <b>¿Cómo consultar o buscar?</b>\n`;
  text += `Puedes escribir directamente en este chat cualquier dato:\n`;
  text += `• <b>Nombre:</b> <code>Cristhian Fuentes</code>\n`;
  text += `• <b>Posición:</b> <code>70846</code>\n`;
  text += `• <b>Cédula:</b> <code>4-770-399</code>\n\n`;
  text += `👇 <i>Escribe el nombre o dato aquí abajo y te enviaré la ficha inmediatamente.</i>`;

  return text;
}

export async function searchBdrhPerson(term: string): Promise<string> {
  const cleanTerm = term.trim();
  if (!cleanTerm) return 'Ingresa un término de búsqueda. Ej: <code>Cristhian Fuentes</code> o <code>70846</code>';

  const supabase = getBotSupabase();

  const { data, error } = await supabase
    .from('valisan_bdrh')
    .select('id, pos_id, nombre_completo, rango, cedula, cargo, departamento, base, salario, sobresueldo, estado')
    .or(`pos_id.ilike.%${cleanTerm}%,cedula.ilike.%${cleanTerm}%,nombre_completo.ilike.%${cleanTerm}%,cargo.ilike.%${cleanTerm}%`)
    .limit(4);

  if (error || !data || data.length === 0) {
    return `🔍 No se encontraron registros en BD-RH para: <code>${cleanTerm}</code>`;
  }

  let text = `🔍 <b>Resultados en BD-RH para "${cleanTerm}":</b>\n\n`;
  data.forEach((p: any) => {
    const rangoClean = cleanText(p.rango) || 'N/A';
    const cargoClean = cleanText(p.cargo) || 'N/A';
    text += `👤 <b>${cleanText(p.nombre_completo) || 'Efectivo'}</b>\n`;
    text += `• Rango: <b>${rangoClean}</b>\n`;
    text += `• Posición: <code>${p.pos_id || 'N/A'}</code> | Cédula: <code>${p.cedula || 'N/A'}</code>\n`;
    text += `• Cargo: ${cargoClean}\n`;
    if (p.departamento) text += `• Departamento: ${cleanText(p.departamento)}\n`;
    if (p.base) text += `• Base: ${cleanText(p.base)}\n`;
    if (p.salario) text += `• Salario: ${formatMoney(Number(p.salario))} ${p.sobresueldo ? `(+${formatMoney(Number(p.sobresueldo))} sobresueldo)` : ''}\n`;
    if (p.estado) text += `• Condición: <i>${cleanText(p.estado)}</i>\n`;
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
// 🛡️ GESTIÓN DE BORRADORES (DRAFTS) Y CONFIRMACIÓN PREVIA (REGLA DE ORO)
// ─────────────────────────────────────────────────────────────────────────────

export interface TelegramDraft {
  tipo: 'gasto' | 'pago_fijo' | 'vendido' | 'ingreso' | 'kilometraje';
  origen: 'foto_gemini' | 'texto_local' | 'texto_gemini' | 'boton_inline';
  fecha: string; // YYYY-MM-DD
  // Gasto o Ingreso
  monto?: number;
  detalle?: string;
  categoria?: string;
  sub_category?: string;
  is_credit_card?: boolean;
  profile_id?: string;
  // Pago Fijo
  payment_id?: string;
  pago_titulo?: string;
  pago_periodo?: string;
  // Vendido (Keiko)
  vendedor_id?: string;
  vendedor_nombre?: string;
  vistas?: number;
  con_compra?: number;
  sin_compra?: number;
  contado?: number;
  credito?: number;
  total?: number;
  // Kilometraje
  vehicle_id?: string;
  vehicle_name?: string;
  km?: number;
}

export async function saveTelegramDraft(chatId: string | number, draft: TelegramDraft): Promise<boolean> {
  const supabase = getBotSupabase();
  const key = `telegram_draft:${chatId}`;
  const { error } = await supabase.from('app_settings').upsert({ key, value: draft });
  if (error) {
    console.error('Error guardando draft en app_settings:', error);
    return false;
  }
  return true;
}

export async function getTelegramDraft(chatId: string | number): Promise<TelegramDraft | null> {
  const supabase = getBotSupabase();
  const key = `telegram_draft:${chatId}`;
  const { data, error } = await supabase.from('app_settings').select('value').eq('key', key).single();
  if (error || !data?.value) return null;
  return data.value as TelegramDraft;
}

export async function deleteTelegramDraft(chatId: string | number): Promise<boolean> {
  const supabase = getBotSupabase();
  const key = `telegram_draft:${chatId}`;
  const { error } = await supabase.from('app_settings').delete().eq('key', key);
  if (error) {
    console.error('Error eliminando draft de app_settings:', error);
    return false;
  }
  return true;
}

export function formatDraftSummaryCard(draft: TelegramDraft): { text: string; replyMarkup: InlineKeyboardMarkup } {
  let text = `📋 <b>RESUMEN DE REGISTRO</b>\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;

  if (draft.tipo === 'gasto') {
    text += `🏢 <b>Comercio / Detalle:</b> ${draft.detalle || 'Gasto'}\n`;
    text += `💵 <b>Monto:</b> ${formatMoney(Number(draft.monto || 0))}\n`;
    text += `🏷️ <b>Categoría:</b> ${draft.categoria || 'Varios'}\n`;
    text += `📅 <b>Fecha:</b> <code>${draft.fecha}</code>\n`;
    text += `👤 <b>Pagador:</b> Cristhian Fuentes\n`;
    if (draft.is_credit_card) text += `💳 <b>Método:</b> Tarjeta de Crédito\n`;
    text += `🗄️ <b>Tabla destino:</b> <code>daily_expenses</code> (Gastos Diarios • ValisFin)\n`;
  } else if (draft.tipo === 'ingreso') {
    text += `💵 <b>Monto a ingresar:</b> ${formatMoney(Number(draft.monto || 0))}\n`;
    text += `📝 <b>Concepto:</b> ${draft.detalle || 'Ingreso'}\n`;
    text += `🏷️ <b>Categoría:</b> ${draft.categoria || 'Ventas / Otros'}\n`;
    text += `📅 <b>Fecha:</b> <code>${draft.fecha}</code>\n`;
    text += `👤 <b>Beneficiario:</b> Cristhian Fuentes\n`;
    text += `🗄️ <b>Tabla destino:</b> <code>incomes</code> (Módulo Ingresos • ValisFin)\n`;
  } else if (draft.tipo === 'pago_fijo') {
    text += `💳 <b>Compromiso:</b> ${draft.pago_titulo}\n`;
    text += `💵 <b>Monto a liquidar:</b> ${formatMoney(Number(draft.monto || 0))}\n`;
    text += `📅 <b>Periodo:</b> <code>${draft.pago_periodo}</code>\n`;
    text += `🗄️ <b>Tabla destino:</b> <code>fixed_payments</code> (is_paid = true • ValisFin)\n`;
  } else if (draft.tipo === 'vendido') {
    text += `👤 <b>Vendedor:</b> ${draft.vendedor_nombre}\n`;
    text += `📅 <b>Fecha:</b> <code>${draft.fecha}</code>\n`;
    text += `👥 <b>Visitas del día:</b> ${draft.vistas ?? 0}\n`;
    text += `✅ <b>Con Compra:</b> ${draft.con_compra ?? 0}  |  ❌ <b>Sin Compra:</b> ${draft.sin_compra ?? 0}\n`;
    text += `💵 <b>Contado:</b> ${formatMoney(Number(draft.contado ?? 0))}\n`;
    text += `💳 <b>Crédito:</b> ${formatMoney(Number(draft.credito ?? 0))}\n`;
    const tot = draft.total || (Number(draft.contado ?? 0) + Number(draft.credito ?? 0));
    text += `💰 <b>Total Vendido:</b> ${formatMoney(tot)}\n`;
    text += `🗄️ <b>Tabla destino:</b> <code>registros_ventas</code> (Reporte Ventas Keiko • ValisBiz)\n`;
  } else if (draft.tipo === 'kilometraje') {
    text += `🚗 <b>Vehículo:</b> ${draft.vehicle_name}\n`;
    text += `📟 <b>Nueva lectura:</b> ${draft.km?.toLocaleString()} km\n`;
    text += `📅 <b>Fecha:</b> <code>${draft.fecha}</code>\n`;
    text += `🗄️ <b>Tabla destino:</b> <code>vehicles</code> & <code>mileage_logs</code> (ValisFin)\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (draft.origen === 'foto_gemini') {
    text += `📸 <i>Extraído mediante Gemini Vision de tu factura/recibo.</i>\n`;
  } else if (draft.origen === 'texto_local') {
    text += `⚡ <i>Procesado al instante con script local (0 tokens).</i>\n`;
  } else if (draft.origen === 'texto_gemini') {
    text += `🤖 <i>Detectado inteligentemente por IA desde tu mensaje.</i>\n`;
  } else if (draft.origen === 'boton_inline') {
    text += `👆 <i>Seleccionado desde la lista de pagos pendientes.</i>\n`;
  }

  text += `\n⚠️ <b>Verifica los datos y la tabla antes de autorizar el envío:</b>`;

  const replyMarkup: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: '💾 Enviar a la base de datos', callback_data: 'draft:commit' },
        { text: '❌ Cancelar', callback_data: 'draft:cancel' }
      ]
    ]
  };

  return { text, replyMarkup };
}

export async function commitDraft(chatId: string | number): Promise<{ success: boolean; text: string }> {
  const draft = await getTelegramDraft(chatId);
  if (!draft) {
    return {
      success: false,
      text: '⚠️ <b>No hay ningún registro pendiente</b> o ya fue procesado con anterioridad.'
    };
  }

  const supabase = getBotSupabase();

  if (draft.tipo === 'gasto') {
    const { error } = await supabase.from('daily_expenses').insert({
      date: draft.fecha || new Date().toISOString().split('T')[0],
      category: draft.categoria || 'Varios',
      detail: draft.detalle || 'Gasto registrado vía Telegram',
      amount: Number(draft.monto || 0),
      profile_id: draft.profile_id || 'edc938dc-9fbc-4573-b007-0bdb95114f95', // Cristhian
      is_credit_card: Boolean(draft.is_credit_card),
      sub_category: draft.sub_category || null,
    });

    if (error) {
      console.error('Error commit draft gasto:', error);
      return { success: false, text: `❌ Error al guardar el gasto: ${error.message}` };
    }

    await deleteTelegramDraft(chatId);
    return {
      success: true,
      text: `✅ <b>¡Gasto guardado con éxito en la base de datos!</b>\n` +
            `🗄️ <b>Tabla:</b> <code>daily_expenses</code> (Gastos Diarios • ValisFin)\n\n` +
            `🏢 Comercio / Detalle: <b>${draft.detalle}</b>\n` +
            `💵 Monto: <b>${formatMoney(Number(draft.monto || 0))}</b>\n` +
            `🏷️ Categoría: <code>${draft.categoria || 'Varios'}</code>\n` +
            `📅 Fecha: <code>${draft.fecha}</code>`
    };
  }

  if (draft.tipo === 'ingreso') {
    const fechaDate = new Date((draft.fecha || new Date().toISOString().split('T')[0]) + 'T12:00:00');
    const period = `${fechaDate.getFullYear()}-${String(fechaDate.getMonth() + 1).padStart(2, '0')}`;
    const { error } = await supabase.from('incomes').insert({
      profile_id: draft.profile_id || 'edc938dc-9fbc-4573-b007-0bdb95114f95',
      category: draft.categoria || 'ventas',
      period,
      description: draft.detalle || 'Ingreso registrado vía Telegram',
      amount: Number(draft.monto || 0),
      date_expected: draft.fecha || new Date().toISOString().split('T')[0],
      is_received: true
    });

    if (error) {
      console.error('Error commit draft ingreso:', error);
      return { success: false, text: `❌ Error al guardar el ingreso: ${error.message}` };
    }

    await deleteTelegramDraft(chatId);
    return {
      success: true,
      text: `✅ <b>¡Ingreso guardado con éxito en la base de datos!</b>\n` +
            `🗄️ <b>Tabla:</b> <code>incomes</code> (Módulo Ingresos • ValisFin)\n\n` +
            `💵 Monto: <b>${formatMoney(Number(draft.monto || 0))}</b>\n` +
            `📝 Concepto: <b>${draft.detalle}</b>\n` +
            `🏷️ Categoría: <code>${draft.categoria || 'Ventas'}</code>\n` +
            `📅 Fecha: <code>${draft.fecha}</code>`
    };
  }

  if (draft.tipo === 'pago_fijo') {
    const { error } = await supabase
      .from('fixed_payments')
      .update({ is_paid: true })
      .eq('id', draft.payment_id);

    if (error) {
      console.error('Error commit draft pago_fijo:', error);
      return { success: false, text: `❌ Error al actualizar el pago fijo: ${error.message}` };
    }

    await deleteTelegramDraft(chatId);
    return {
      success: true,
      text: `✅ <b>¡Pago fijo cancelado y guardado en la base de datos!</b>\n` +
            `🗄️ <b>Tabla:</b> <code>fixed_payments</code> (Pagos Fijos • ValisFin)\n\n` +
            `💳 Compromiso: <b>${draft.pago_titulo}</b>\n` +
            `💵 Monto: <b>${formatMoney(Number(draft.monto || 0))}</b>\n` +
            `📅 Periodo: <code>${draft.pago_periodo}</code>`
    };
  }

  if (draft.tipo === 'vendido') {
    const fechaDate = new Date((draft.fecha || new Date().toISOString().split('T')[0]) + 'T12:00:00');
    const total = Number(draft.total || (Number(draft.contado || 0) + Number(draft.credito || 0)));

    const { error } = await supabase.from('registros_ventas').insert({
      vendedor_id: draft.vendedor_id,
      monto_facturado: total,
      fecha_registro: fechaDate.toISOString(),
      mes_periodo: fechaDate.getMonth() + 1,
      anio_periodo: fechaDate.getFullYear(),
      vistas: draft.vistas ?? 0,
      con_compra: draft.con_compra ?? 0,
      sin_compra: draft.sin_compra ?? 0,
      contado: Number(draft.contado ?? 0),
      credito: Number(draft.credito ?? 0),
    });

    if (error) {
      console.error('Error commit draft vendido:', error);
      return { success: false, text: `❌ Error al guardar venta de vendedor: ${error.message}` };
    }

    await deleteTelegramDraft(chatId);
    return {
      success: true,
      text: `✅ <b>¡Reporte de venta guardado con éxito en ValisBiz!</b>\n` +
            `🗄️ <b>Tabla:</b> <code>registros_ventas</code> (Supervisión Keiko • ValisBiz)\n\n` +
            `👤 Vendedor: <b>${draft.vendedor_nombre}</b>\n` +
            `👥 Visitas: <b>${draft.vistas ?? 0}</b> (Efectivos: ${draft.con_compra ?? 0} · Sin compra: ${draft.sin_compra ?? 0})\n` +
            `💵 Contado: <b>${formatMoney(Number(draft.contado ?? 0))}</b>\n` +
            `💳 Crédito: <b>${formatMoney(Number(draft.credito ?? 0))}</b>\n` +
            `💰 <b>TOTAL: ${formatMoney(total)}</b>\n` +
            `📅 Fecha: <code>${draft.fecha}</code>`
    };
  }

  if (draft.tipo === 'kilometraje' && draft.vehicle_id && draft.km) {
    const today = draft.fecha || new Date().toISOString().split('T')[0];
    await supabase.from('mileage_logs').insert({
      vehicle_id: draft.vehicle_id,
      date: today,
      km: draft.km,
      user_id: 'edc938dc-9fbc-4573-b007-0bdb95114f95',
      source: 'telegram'
    });
    await supabase.from('vehicles').update({ current_km: draft.km, km_date: today }).eq('id', draft.vehicle_id);
    await deleteTelegramDraft(chatId);
    return {
      success: true,
      text: `✅ <b>¡Kilometraje actualizado con éxito en la base de datos!</b>\n` +
            `🗄️ <b>Tablas:</b> <code>vehicles</code> & <code>mileage_logs</code> (ValisFin)\n\n` +
            `🚗 Vehículo: <b>${draft.vehicle_name}</b>\n` +
            `📟 Odómetro: <b>${draft.km.toLocaleString()} km</b>\n` +
            `📅 Fecha: <code>${today}</code>`
    };
  }

  return { success: false, text: '⚠️ Tipo de registro desconocido.' };
}

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ PARSERS LOCALES (0 TOKENS - COPIADOS Y ADAPTADOS DE TUS SCRIPTS)
// ─────────────────────────────────────────────────────────────────────────────

const VENDEDORES_LOCALES = [
  { id: '1b3f2384-0469-4a49-8fd8-6c803209f556', nombre: 'Andrés Chávez', aliases: ['andres', 'andrés', 'chavez', 'chávez'] },
  { id: '7be9dd90-9e32-4659-b46d-c307217175b9', nombre: 'Joseph Domínguez', aliases: ['joseph', 'josep', 'dominguez', 'domínguez'] },
  { id: 'cfb71bc9-697b-4a5f-b618-cd62bee01c05', nombre: 'Enrique del Rosario', aliases: ['enrique', 'del rosario', 'rosario'] },
  { id: '10a47134-528f-4ac4-8c63-bec4a9224d5b', nombre: 'Carolina Sucre', aliases: ['carolina', 'sucre', 'caro'] },
];

function numLocal(s: string | undefined): number {
  if (!s) return 0;
  let v = s.trim();
  if (v.includes(',') && v.includes('.')) {
    v = v.replace(/,/g, '');
  } else if (/,\d{3}$/.test(v) || /^\d{1,3}(,\d{3})+$/.test(v)) {
    v = v.replace(/,/g, '');
  } else if (/,\d{1,2}$/.test(v)) {
    v = v.replace(',', '.');
  }
  return parseFloat(v) || 0;
}

export function parsearTextoWhatsAppLocal(texto: string, todayInput?: string): TelegramDraft | null {
  const today = todayInput || new Date().toISOString().split('T')[0];

  // Patrones de visitas
  const visitasMatch = texto.match(
    /(?:clientes?\s+(?:visitados?|atendidos?|del\s+d[ií]a)|visitas?(?:\s+del\s+d[ií]a)?|locales?\s+visitados?|recorridos?|clientes?\s+recorridos?)\s*[:\-.]?\s*(\d+)/i
  );

  // Patrones de con compra / efectivos
  const efectivosMatch = texto.match(
    /(?:clientes?\s+(?:efectivos?|con\s+p(?:e|e)didos?|con\s+compra?|facturados?|cerrados?)|efectivos?|con\s+p(?:e|e)didos?|con\s+compra|compraron|ventas?\s+cerradas?|p(?:e|e)didos?\s+tomados?)\s*[:\-.]?\s*(\d+)/i
  );

  // Sin compra explícito
  const sinCompraMatch = texto.match(/(?:sin\s+compra|no\s+compraron|sin\s+p(?:e|e)didos?|clientes?\s+sin\s+(?:compra|pedido))\s*[:\-.]?\s*(\d+)/i);

  // Contado
  const contadoMatch = texto.match(/(?:al?\s+contado|en\s+efectivo|contado)\s*[:\-.]?\s*(\d[\d,\.]*)/i);
  // Crédito
  const creditoMatch = texto.match(/(?:a?\s*cr[eé]dito|en\s+cr[eé]dito)\s*[:\-.]?\s*(\d[\d,\.]*)/i);
  // Valor recaudado / total
  const recaudadoMatch = texto.match(/(?:valor\s+recaudado|total\s+recaudado|recaud[eé]|recaudado|vendido\s+hoy|total\s+del\s+d[ií]a|monto\s+total|valor\s+cobrado|cobrado)\s*[:\-.]?\s*(\d[\d,\.]*)/i);

  const tieneVentas = visitasMatch || efectivosMatch || contadoMatch || creditoMatch || recaudadoMatch;
  if (!tieneVentas) return null;

  const vistas = visitasMatch ? parseInt(visitasMatch[1]) : undefined;
  const con_compra = efectivosMatch ? parseInt(efectivosMatch[1]) : undefined;
  const sin_compra_explicito = sinCompraMatch ? parseInt(sinCompraMatch[1]) : undefined;
  const sin_compra = sin_compra_explicito ?? (vistas !== undefined && con_compra !== undefined ? Math.max(0, vistas - con_compra) : 0);

  let contado = contadoMatch ? numLocal(contadoMatch[1]) : 0;
  const credito = creditoMatch ? numLocal(creditoMatch[1]) : 0;
  if (!contadoMatch && recaudadoMatch && !creditoMatch) {
    contado = numLocal(recaudadoMatch[1]);
  } else if (!contadoMatch && recaudadoMatch && creditoMatch) {
    contado = Math.max(0, numLocal(recaudadoMatch[1]) - credito);
  }

  // Detectar vendedor
  const t = texto.toLowerCase();
  let vend = VENDEDORES_LOCALES.find(v => v.aliases.some(a => t.includes(a)));
  if (!vend) {
    // Si no lo menciona, predeterminado Joseph si menciona ventas comunes o dejar primer vendedor
    vend = VENDEDORES_LOCALES[1]; // Joseph
  }

  // Detectar fecha
  let fecha = today;
  if (/\bayer\b/i.test(texto)) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    fecha = d.toISOString().split('T')[0];
  }

  return {
    tipo: 'vendido',
    origen: 'texto_local',
    fecha,
    vendedor_id: vend.id,
    vendedor_nombre: vend.nombre,
    vistas: vistas ?? 0,
    con_compra: con_compra ?? 0,
    sin_compra: sin_compra ?? 0,
    contado,
    credito,
    total: contado + credito,
  };
}

export async function matchPendingFixedPayment(query: string): Promise<TelegramDraft | null> {
  const supabase = getBotSupabase();
  const d = new Date();
  const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const cleanQuery = query.toLowerCase().replace(/^\/pagado\s*/i, '').replace(/^ya\s+pagu[eé]\s*/i, '').replace(/^pagu[eé]\s*/i, '').trim();
  if (!cleanQuery) return null;

  const { data: payments } = await supabase
    .from('fixed_payments')
    .select('*')
    .eq('period', period)
    .eq('is_paid', false);

  if (!payments || payments.length === 0) return null;

  // Buscar coincidencia parcial por título
  const match = payments.find(p => p.title.toLowerCase().includes(cleanQuery) || cleanQuery.includes(p.title.toLowerCase()));
  if (!match) return null;

  return {
    tipo: 'pago_fijo',
    origen: 'texto_local',
    fecha: d.toISOString().split('T')[0],
    payment_id: match.id,
    pago_titulo: match.title,
    pago_periodo: match.period,
    monto: Number(match.amount || 0)
  };
}

export async function getFixedPaymentById(id: string) {
  const supabase = getBotSupabase();
  const { data } = await supabase.from('fixed_payments').select('*').eq('id', id).single();
  return data;
}

export function parseQuickExpenseLocal(texto: string, todayInput?: string): TelegramDraft | null {
  const today = todayInput || new Date().toISOString().split('T')[0];
  const t = texto.trim();

  // Patrones: "gasto 15 almuerzo", "gasté 22.50 gasolina", "compré 45 súper 99", "pagué 8 farmacia"
  const m = t.match(/^(?:gasto|gast[eé]|compr[eé]|pagu[eé])\s+(\d+(?:[.,]\d+)?)\s+(?:en\s+)?(.+)$/i);
  if (!m) return null;

  const monto = numLocal(m[1]);
  const detalle = m[2].trim();

  // Inferencia básica de categoría
  let categoria = 'Varios';
  const detLow = detalle.toLowerCase();
  if (/super|comida|almuerzo|cena|desayuno|restaurante|cafe|mcdonalds|kfc/i.test(detLow)) categoria = 'Alimentación';
  else if (/gasolina|carro|combustible|taller|lavado|yaris|tucson/i.test(detLow)) categoria = 'Transporte / Auto';
  else if (/farmacia|medicina|clinica|doctor/i.test(detLow)) categoria = 'Salud';
  else if (/luz|agua|cable|internet|telefono|naturgy|idaan|tigo/i.test(detLow)) categoria = 'Servicios Básicos';

  return {
    tipo: 'gasto',
    origen: 'texto_local',
    fecha: today,
    monto,
    detalle,
    categoria,
    profile_id: 'edc938dc-9fbc-4573-b007-0bdb95114f95', // Cristhian
    is_credit_card: false,
  };
}

export function parseQuickIncomeLocal(texto: string, todayInput?: string): TelegramDraft | null {
  const today = todayInput || new Date().toISOString().split('T')[0];
  const clean = texto.trim().toLowerCase().replace(/^hoy\s+/i, '').replace(/^ayer\s+/i, '').trim();

  // Caso 1: vendi [detalle] a/por/en [monto] (dolares)
  // Ej: vendi una licencia de office a 1 dolar
  const m1 = clean.match(/^(?:vendi|vend[ií]|cobr[eé]|gan[eé]|recib[ií]|ingreso|me pagaron)\s+(.+?)\s+(?:a|por|en)\s+(\d+(?:[.,]\d+)?)(?:\s*(?:d[oó]lares|d[oó]lar|usd|balboas|b\/\.?))?$/i);
  if (m1) {
    const rawDetail = m1[1].trim();
    const detalle = rawDetail.charAt(0).toUpperCase() + rawDetail.slice(1);
    return {
      tipo: 'ingreso',
      origen: 'texto_local',
      detalle,
      monto: numLocal(m1[2]),
      categoria: 'Ventas',
      fecha: today,
      profile_id: 'edc938dc-9fbc-4573-b007-0bdb95114f95',
    };
  }

  // Caso 2: vendi/cobre/recibi [monto] por/de/en [detalle]
  // Ej: cobre 50 por una asesoria, ingreso 100 de salario
  const m2 = clean.match(/^(?:vendi|vend[ií]|cobr[eé]|gan[eé]|recib[ií]|ingreso|me pagaron)\s+(\d+(?:[.,]\d+)?)\s*(?:d[oó]lares|d[oó]lar|usd|balboas|b\/\.?)?\s+(?:por|de|en|a)?\s*(.+)$/i);
  if (m2) {
    const rawDetail = m2[2].trim();
    const detalle = rawDetail.charAt(0).toUpperCase() + rawDetail.slice(1);
    return {
      tipo: 'ingreso',
      origen: 'texto_local',
      detalle,
      monto: numLocal(m2[1]),
      categoria: 'Ventas',
      fecha: today,
      profile_id: 'edc938dc-9fbc-4573-b007-0bdb95114f95',
    };
  }

  return null;
}

export async function classifyAndExtractTransactionAI(texto: string, todayInput?: string): Promise<TelegramDraft | null> {
  const today = todayInput || new Date().toISOString().split('T')[0];

  // Si no contiene ningún número ni palabra clave de transacción, no llamar a IA
  const hasNumber = /\d+/.test(texto);
  const hasTransWord = /(vendi|vendí|cobre|cobré|gane|gané|recibi|recibí|gaste|gasté|compre|compré|pague|pagué|pagado|costo|costó|odometro|odómetro|km|kilometraje)/i.test(texto);
  if (!hasNumber && !hasTransWord) return null;

  const prompt = `Analiza este mensaje de Cristhian para el sistema ValisHub:
"${texto}"
Fecha actual de referencia: ${today}.

Clasifica la intención del mensaje:
- Si el usuario está comunicando que realizó una transacción (gasto, compra, venta, cobro, ingreso, pago de servicio o actualización de kilometraje), clasifícalo y extrae sus datos.
- Si el usuario solo está haciendo una pregunta informativa ("¿cuánto gasté?", "¿cuáles pagos debo?", "¿cómo va el vendedor?", etc.), clasifícalo como tipo="consulta".`;

  try {
    const { GoogleGenAI, Type } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tipo: {
              type: Type.STRING,
              enum: ['gasto', 'ingreso', 'pago_fijo', 'kilometraje', 'consulta'],
              description: "Tipo de acción"
            },
            monto: { type: Type.NUMBER },
            detalle: { type: Type.STRING },
            categoria: { type: Type.STRING },
            fecha: { type: Type.STRING },
            vehiculo_nombre: { type: Type.STRING },
            km: { type: Type.NUMBER }
          },
          required: ['tipo']
        }
      }
    });

    const parsed = JSON.parse(res.text || '{}');
    if (!parsed.tipo || parsed.tipo === 'consulta') return null;

    if (parsed.tipo === 'ingreso' && parsed.monto) {
      return {
        tipo: 'ingreso',
        origen: 'texto_gemini',
        fecha: parsed.fecha || today,
        monto: parsed.monto,
        detalle: parsed.detalle || 'Ingreso personal',
        categoria: parsed.categoria || 'Ventas',
        profile_id: 'edc938dc-9fbc-4573-b007-0bdb95114f95'
      };
    }

    if (parsed.tipo === 'gasto' && parsed.monto) {
      return {
        tipo: 'gasto',
        origen: 'texto_gemini',
        fecha: parsed.fecha || today,
        monto: parsed.monto,
        detalle: parsed.detalle || 'Gasto registrado',
        categoria: parsed.categoria || 'Varios',
        profile_id: 'edc938dc-9fbc-4573-b007-0bdb95114f95',
        is_credit_card: false
      };
    }

    if (parsed.tipo === 'kilometraje' && parsed.km) {
      const isTucson = /tucson/i.test(parsed.vehiculo_nombre || texto);
      const vehicleId = isTucson ? 'f47ac10b-58cc-4372-a567-0e02b2c3d480' : 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const vehicleName = isTucson ? 'Hyundai Tucson' : 'Toyota Yaris';
      return {
        tipo: 'kilometraje',
        origen: 'texto_gemini',
        fecha: parsed.fecha || today,
        vehicle_id: vehicleId,
        vehicle_name: vehicleName,
        km: parsed.km
      };
    }

    return null;
  } catch (err) {
    console.error('Error en classifyAndExtractTransactionAI:', err);
    return null;
  }
}

export function getValisPersistentKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [
      [{ text: '📊 Menú ValisHub' }, { text: '💳 Pagos Pendientes' }],
      [{ text: '📈 Reporte Keiko' }, { text: '💡 Guía de Registro' }]
    ],
    resize_keyboard: true,
    is_persistent: true
  };
}

export function getRegistrationGuideMessage(): string {
  return `💡 <b>Guía Rápida de Registro en ValisHub</b>\n\n` +
    `Recuerda: <b>¡NUNCA se guarda directo!</b> Siempre verás una tarjeta de resumen con el botón <code>[💾 Enviar a la base de datos]</code> para tu aprobación.\n\n` +
    `📸 <b>1. Fotos de Facturas o Recibos:</b>\n` +
    `Envía cualquier foto de un ticket o recibo. La IA leerá el comercio, monto total, categoría y fecha impresa.\n\n` +
    `💳 <b>2. Pagos Fijos:</b>\n` +
    `• Toca el botón <b>💳 Pagos Pendientes</b> y pulsa sobre el compromiso a pagar.\n` +
    `• O escribe: <code>/pagado Naturgy</code> o <code>Pagué el internet</code>.\n\n` +
    `📈 <b>3. Reportes de Ventas Keiko (0 Tokens):</b>\n` +
    `Pega el reporte tal como llega en WhatsApp:\n` +
    `<code>Joseph: 12 visitados, 7 efectivos, 588.28 contado</code>\n` +
    `El script local lo procesa en 1 ms a costo $0.\n\n` +
    `💸 <b>4. Gastos Diarios Rápidos:</b>\n` +
    `Escribe: <code>Gasto 15 almuerzo en Trapiche</code>\n\n` +
    `🚫 <i>Si te equivocas en cualquier momento, pulsa Cancelar o escribe /cancelar.</i>`;
}

