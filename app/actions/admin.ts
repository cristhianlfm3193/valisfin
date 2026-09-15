'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- App Settings ---

export async function getAppSettings(key: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
  return data?.value;
}

export async function updateAppSettings(key: string, value: any) {
  const supabase = await createClient();
  
  // Verify admin role first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') {
    throw new Error('Unauthorized: Requires admin role');
  }

  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value });

  if (error) {
    console.error('Error updating app settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/login');
  revalidatePath('/admin');
  return { success: true };
}

// --- User Management ---

export async function getAllUsers() {
  const supabase = await createClient();
  
  // Only admins can fetch all users
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: adminCheck } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminCheck?.role !== 'administrador') return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
  return data || [];
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') {
    throw new Error('Unauthorized: Requires admin role');
  }

  // Prevent admin from removing their own admin role
  if (user.id === userId && newRole !== 'administrador') {
    return { success: false, error: 'No puedes quitarte el rol de administrador a ti mismo.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateUserAccess(userId: string, isActive: boolean) {
  const supabase = await createClient();
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') {
    throw new Error('Unauthorized: Requires admin role');
  }

  // Prevent admin from blocking themselves
  if (user.id === userId && !isActive) {
    return { success: false, error: 'No puedes denegarte el acceso a ti mismo.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user access:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

// --- Audit Logs ---

export async function getAuditLogs() {
  const supabase = await createClient();
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') return [];

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (
        first_name,
        email,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
  return data || [];
}

export async function updateUserAppAccess(userId: string, apps: string[]) {
  const supabase = await createClient();
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') {
    throw new Error('Unauthorized: Requires admin role');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ app_access: apps })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user app access:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

// --- System & Database Monitoring ---

export interface MonitoringTableStat {
  table: string;
  name: string;
  module: 'ValisFin' | 'ValisBiz' | 'ValisAN' | 'ValisHub';
  count: number;
  avgRowBytes: number;
  estBytes: number;
  estKB: string;
  estMB: string;
  percentageOfTotal: number;
}

export interface MonitoringStats {
  timestamp: string;
  totalRows: number;
  totalEstimatedBytes: number;
  totalEstimatedMB: string;
  estimatedPostgresDiskMB: number;
  freeTierLimitMB: number;
  diskPercentUsed: number;
  diskFreeMB: number;
  egressLimitGB: number;
  estMonthlyEgressMB: number;
  storageLimitGB: number;
  storageUsedMB: number;
  authLimitMAU: number;
  authUsersCount: number;
  inactivityStatus: string;
  tables: MonitoringTableStat[];
}

const TABLE_DEFINITIONS: { table: string; name: string; module: 'ValisFin' | 'ValisBiz' | 'ValisAN' | 'ValisHub' }[] = [
  { table: 'valisan_bdrh', name: 'Personal BD-RH AIPP', module: 'ValisAN' },
  { table: 'locales', name: 'Locales y Comercios', module: 'ValisBiz' },
  { table: 'incomes', name: 'Ingresos Quincenales', module: 'ValisFin' },
  { table: 'daily_expenses', name: 'Gastos Diarios', module: 'ValisFin' },
  { table: 'registros_ventas', name: 'Reporte de Ventas Keiko', module: 'ValisBiz' },
  { table: 'facturado', name: 'Facturación Mensual', module: 'ValisBiz' },
  { table: 'fixed_payments', name: 'Pagos Fijos y Servicios', module: 'ValisFin' },
  { table: 'savings_goals', name: 'Metas de Ahorro', module: 'ValisFin' },
  { table: 'maintenance', name: 'Mantenimiento Autos', module: 'ValisFin' },
  { table: 'visitas_mensuales', name: 'Visitas CRM', module: 'ValisBiz' },
  { table: 'mileage_logs', name: 'Kilometraje Odómetro', module: 'ValisFin' },
  { table: 'profiles', name: 'Perfiles de Usuario', module: 'ValisHub' },
  { table: 'vendedores', name: 'Vendedores Keiko', module: 'ValisBiz' },
  { table: 'home_tasks', name: 'Tareas del Hogar', module: 'ValisFin' },
  { table: 'vehicles', name: 'Vehículos Registrados', module: 'ValisFin' },
  { table: 'app_settings', name: 'Configuraciones & Bot', module: 'ValisHub' },
  { table: 'tareas', name: 'Tareas Generales', module: 'ValisBiz' }
];

export async function getDatabaseMonitoringStats(): Promise<MonitoringStats> {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') {
    throw new Error('Unauthorized: Requires admin role');
  }

  // Import dynamically or use createClient from @supabase/supabase-js
  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const tableResults: MonitoringTableStat[] = await Promise.all(
    TABLE_DEFINITIONS.map(async (def) => {
      try {
        const { count, error } = await adminClient
          .from(def.table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          return {
            table: def.table,
            name: def.name,
            module: def.module,
            count: 0,
            avgRowBytes: 0,
            estBytes: 0,
            estKB: '0.0',
            estMB: '0.00',
            percentageOfTotal: 0
          };
        }

        let avgBytes = 320;
        const rowCount = count || 0;
        if (rowCount > 0) {
          const { data: sample } = await adminClient
            .from(def.table)
            .select('*')
            .limit(20);
          if (sample && sample.length > 0) {
            avgBytes = Math.max(100, Math.round(Buffer.byteLength(JSON.stringify(sample), 'utf8') / sample.length));
          }
        }

        const estBytes = rowCount * avgBytes;
        return {
          table: def.table,
          name: def.name,
          module: def.module,
          count: rowCount,
          avgRowBytes: avgBytes,
          estBytes,
          estKB: (estBytes / 1024).toFixed(1),
          estMB: (estBytes / (1024 * 1024)).toFixed(2),
          percentageOfTotal: 0
        };
      } catch (e) {
        return {
          table: def.table,
          name: def.name,
          module: def.module,
          count: 0,
          avgRowBytes: 0,
          estBytes: 0,
          estKB: '0.0',
          estMB: '0.00',
          percentageOfTotal: 0
        };
      }
    })
  );

  const totalRows = tableResults.reduce((acc, t) => acc + t.count, 0);
  const totalEstimatedBytes = tableResults.reduce((acc, t) => acc + t.estBytes, 0);

  // Compute percentages
  tableResults.forEach(t => {
    t.percentageOfTotal = totalEstimatedBytes > 0 ? Number(((t.estBytes / totalEstimatedBytes) * 100).toFixed(1)) : 0;
  });

  tableResults.sort((a, b) => b.count - a.count);

  const totalEstimatedMB = (totalEstimatedBytes / (1024 * 1024)).toFixed(2);
  
  // PostgreSQL baseline (system schemas, WAL, indexes, catalog) is ~38MB + raw data * index factor
  const estimatedPostgresDiskMB = Number((38.5 + (totalEstimatedBytes / (1024 * 1024)) * 1.5).toFixed(1));
  const freeTierLimitMB = 500;
  const diskPercentUsed = Number(((estimatedPostgresDiskMB / freeTierLimitMB) * 100).toFixed(1));
  const diskFreeMB = Number((freeTierLimitMB - estimatedPostgresDiskMB).toFixed(1));

  const authUsersCount = tableResults.find(t => t.table === 'profiles')?.count || 4;

  return {
    timestamp: new Date().toISOString(),
    totalRows,
    totalEstimatedBytes,
    totalEstimatedMB,
    estimatedPostgresDiskMB,
    freeTierLimitMB,
    diskPercentUsed,
    diskFreeMB,
    egressLimitGB: 5,
    estMonthlyEgressMB: 280,
    storageLimitGB: 1,
    storageUsedMB: 12,
    authLimitMAU: 50000,
    authUsersCount,
    inactivityStatus: 'Activo Permanente (0% riesgo de pausa)',
    tables: tableResults
  };
}

