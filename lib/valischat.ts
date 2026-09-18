export type Connector = {
  id: string
  provider: string
  name: string
  config: any
  is_active: boolean
  updated_at: string
}

export type ConnectorEnvStatus = {
  gemini: { hasKey: boolean; source: string }
  openai: { hasKey: boolean; source: string }
  pinecone: { hasKey: boolean; source: string }
  google_calendar: { hasKey: boolean; source: string }
  supabase: { hasKey: boolean; url: string }
}

export type AvailableTable = {
  id: string
  name: string
  category: 'finanzas' | 'vehiculos' | 'comercial' | 'sistema'
  description: string
}

export const KNOWN_SUPABASE_TABLES: AvailableTable[] = [
  { id: 'daily_expenses', name: 'Gastos Diarios', category: 'finanzas', description: 'Registro de gastos diarios clasificados por categoría' },
  { id: 'incomes', name: 'Ingresos', category: 'finanzas', description: 'Fuentes de ingresos y montos recibidos' },
  { id: 'fixed_payments', name: 'Pagos Fijos', category: 'finanzas', description: 'Compromisos mensuales recurrentes y fechas de vencimiento' },
  { id: 'savings_goals', name: 'Metas de Ahorro', category: 'finanzas', description: 'Metas financieras, montos acumulados y objetivos' },
  { id: 'vehicles', name: 'Vehículos', category: 'vehiculos', description: 'Flota de vehículos registrados, marcas y placas' },
  { id: 'maintenance', name: 'Mantenimiento de Autos', category: 'vehiculos', description: 'Historial y próximos mantenimientos de vehículos' },
  { id: 'valisven_clientes', name: 'Clientes ValisVen', category: 'comercial', description: 'Directorio de clientes y contactos comerciales' },
  { id: 'valisven_licencias', name: 'Licencias ValisVen', category: 'comercial', description: 'Licencias activas, fechas de expiración y planes' },
  { id: 'locales', name: 'Locales ValisBiz', category: 'comercial', description: 'Puntos de venta y comercios registrados' },
  { id: 'registros_ventas', name: 'Ventas ValisBiz', category: 'comercial', description: 'Transacciones y ventas registradas en locales' },
  { id: 'whatsapp_messages', name: 'Mensajes WhatsApp', category: 'sistema', description: 'Historial de mensajes entrantes y salientes' },
  { id: 'profiles', name: 'Perfiles de Usuario', category: 'sistema', description: 'Datos básicos de los usuarios y contactos' },
]

export type AgentConfig = {
  id: string
  agent_name: string
  role_description: string
  system_prompt: string
  model_provider: string
  model_name: string
  temperature: number
  max_tokens: number
  selected_connectors: string[]
  pinecone_index: string
  mode: 'copilot' | 'autonomous'
  is_active: boolean
  updated_at: string
}
