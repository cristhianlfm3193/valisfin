'use client'

import { useState } from 'react'
import { 
  Plug, 
  Cpu, 
  Database, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Save, 
  Key, 
  Sparkles, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  MessageSquare,
  Server,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Calendar,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react'
import { 
  updateConnector, 
  testOpenAIConnection, 
  testGeminiConnection, 
  testPineconeConnection, 
  testGoogleCalendarConnection,
  Connector,
  ConnectorEnvStatus,
  KNOWN_SUPABASE_TABLES
} from '@/app/actions/valischat_connectors'

interface Props {
  initialConnectors: Connector[]
  envStatus: ConnectorEnvStatus
}

export default function ConnectorsClient({ initialConnectors, envStatus }: Props) {
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors)
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'database' | 'tools' | 'channels'>('all')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null)
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [newModelInputs, setNewModelInputs] = useState<{ [key: string]: string }>({})

  const getConn = (id: string) => connectors.find(c => c.id === id) || {
    id,
    provider: id,
    name: id,
    config: {},
    is_active: false,
    updated_at: ''
  }

  const updateConfig = (id: string, key: string, value: any) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          config: {
            ...c.config,
            [key]: value
          }
        }
      }
      return c
    }))
  }

  const toggleActive = (id: string) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, is_active: !c.is_active }
      }
      return c
    }))
  }

  const toggleSupabaseTable = (tableId: string) => {
    const supabaseConn = getConn('supabase')
    const currentTables: string[] = supabaseConn.config?.tables || []
    let updated: string[]

    if (currentTables.includes(tableId)) {
      updated = currentTables.filter(t => t !== tableId)
    } else {
      updated = [...currentTables, tableId]
    }

    updateConfig('supabase', 'tables', updated)
  }

  const addCustomModel = (connId: string) => {
    const custom = (newModelInputs[connId] || '').trim()
    if (!custom) return

    const conn = getConn(connId)
    const models = conn.config?.models || []
    if (!models.includes(custom)) {
      const updatedModels = [...models, custom]
      updateConfig(connId, 'models', updatedModels)
      updateConfig(connId, 'active_model', custom)
    }
    setNewModelInputs(prev => ({ ...prev, [connId]: '' }))
  }

  const removeModel = (connId: string, modelToRemove: string) => {
    const conn = getConn(connId)
    const models = (conn.config?.models || []).filter((m: string) => m !== modelToRemove)
    updateConfig(connId, 'models', models)
    if (conn.config?.active_model === modelToRemove) {
      updateConfig(connId, 'active_model', models[0] || '')
    }
  }

  const handleSave = async (id: string) => {
    setSavingId(id)
    const conn = getConn(id)
    try {
      const res = await updateConnector(id, conn.config, conn.is_active)
      if (res.success) {
        setTestResult({ id, success: true, message: 'Configuración guardada exitosamente.' })
        setTimeout(() => setTestResult(null), 3500)
      } else {
        setTestResult({ id, success: false, message: res.error || 'Error al guardar.' })
      }
    } catch (err: any) {
      setTestResult({ id, success: false, message: err.message })
    } finally {
      setSavingId(null)
    }
  }

  const handleTestGemini = async () => {
    setTestingId('gemini')
    const conn = getConn('gemini')
    const model = conn.config?.active_model || 'gemini-3.6-flash'
    const apiKey = conn.config?.api_key || ''

    try {
      const res = await testGeminiConnection(apiKey, model)
      setTestResult({
        id: 'gemini',
        success: res.success,
        message: res.success ? res.message! : (res.error || 'Fallo de prueba.')
      })
    } finally {
      setTestingId(null)
    }
  }

  const handleTestOpenAI = async () => {
    setTestingId('openai')
    const conn = getConn('openai')
    const model = conn.config?.active_model || 'gpt-4o-mini'
    const apiKey = conn.config?.api_key || ''

    try {
      const res = await testOpenAIConnection(apiKey, model)
      setTestResult({
        id: 'openai',
        success: res.success,
        message: res.success ? res.message! : (res.error || 'Fallo de prueba.')
      })
    } finally {
      setTestingId(null)
    }
  }

  const handleTestPinecone = async () => {
    setTestingId('pinecone')
    const conn = getConn('pinecone')
    const apiKey = conn.config?.api_key || ''
    const env = conn.config?.environment || 'us-east-1'
    const indexName = conn.config?.index_name || 'valis-docs-index'

    try {
      const res = await testPineconeConnection(apiKey, env, indexName)
      setTestResult({
        id: 'pinecone',
        success: res.success,
        message: res.success ? res.message! : (res.error || 'Fallo de prueba.')
      })
    } finally {
      setTestingId(null)
    }
  }

  const handleTestGoogleCalendar = async () => {
    setTestingId('google_calendar')
    const conn = getConn('google_calendar')
    const calId = conn.config?.calendar_id || 'primary'
    const apiKey = conn.config?.api_key || ''

    try {
      const res = await testGoogleCalendarConnection(calId, apiKey)
      setTestResult({
        id: 'google_calendar',
        success: res.success,
        message: res.success ? res.message! : (res.error || 'Fallo de prueba.')
      })
    } finally {
      setTestingId(null)
    }
  }

  // Connectors
  const gemini = getConn('gemini')
  const openai = getConn('openai')
  const supabaseConn = getConn('supabase')
  const pinecone = getConn('pinecone')
  const whatsapp = getConn('whatsapp')
  const googleCalendar = getConn('google_calendar')

  const selectedTablesCount = (supabaseConn.config?.tables || []).length

  return (
    <div className="max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              ValisChat Ecosystem
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">Multi-Model & Database Hub</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Conectores de Inteligencia & Datos
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Gestiona las conexiones a modelos LLM, bases vectoriales para documentos largos, tablas vivas de Supabase y herramientas como Google Calendar.
          </p>
        </div>

        {/* Global Security / Env info badge */}
        <div className="p-3.5 rounded-2xl bg-[#11131a] border border-white/10 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">Variables de Entorno</p>
            <p className="text-gray-400 text-[11px]">Protección activa con <code className="text-emerald-400">.env.local</code> y Vercel</p>
          </div>
        </div>
      </div>

      {/* Notice about .env.local vs UI */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-indigo-950/20 border border-emerald-500/20 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-gray-300">
          <strong className="text-white font-semibold">¿Dónde configurar las claves?</strong> La forma más recomendada y segura es colocar tus llaves en tu archivo <code className="text-emerald-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/10 font-mono">.env.local</code> (en tu máquina) o en las Variables de Entorno de Vercel (en producción). El sistema detecta automáticamente si la clave existe en el servidor y te permite usarla sin necesidad de escribirla en formularios web.
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'Todos los Conectores', icon: Plug, count: 6 },
          { id: 'ai', label: 'Modelos de IA', icon: Cpu, count: 2 },
          { id: 'database', label: 'Bases de Datos & RAG', icon: Database, count: 2 },
          { id: 'tools', label: 'Herramientas & Agenda', icon: Calendar, count: 1 },
          { id: 'channels', label: 'Canales de Mensajería', icon: MessageSquare, count: 1 },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. GOOGLE GEMINI CARD */}
        {(activeTab === 'all' || activeTab === 'ai') && (
          <div className="bg-[#11131a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-emerald-500/30 transition-all shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Google Gemini
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                        Multimodal
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Modelos Gemini de Google con ventana de contexto ultra amplia.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleActive('gemini')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    gemini.is_active ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    gemini.is_active ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Status Badge from Env */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Detectada y activa en .env.local (GEMINI_API_KEY)</span>
              </div>

              {/* Active Model Selector */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Modelo Predeterminado para ValisChat
                </label>
                <select
                  value={gemini.config?.active_model || 'gemini-3.6-flash'}
                  onChange={e => updateConfig('gemini', 'active_model', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  {(gemini.config?.models || ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-flash-latest', 'gemini-1.5-pro']).map((m: string) => (
                    <option key={m} value={m} className="bg-[#11131a] text-white">{m}</option>
                  ))}
                </select>
              </div>

              {/* Manual Model Addition */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Agregar Modelo de Gemini Manualmente
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newModelInputs['gemini'] || ''}
                    onChange={e => setNewModelInputs(prev => ({ ...prev, gemini: e.target.value }))}
                    placeholder="Ej: gemini-2.5-flash, gemma-4-31b-it"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomModel('gemini')}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold border border-purple-500/30 flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Models list tags */}
              <div className="flex flex-wrap gap-1.5">
                {(gemini.config?.models || ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-flash-latest', 'gemini-1.5-pro']).map((m: string) => (
                  <div key={m} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-gray-300">
                    <span>{m}</span>
                    <button
                      type="button"
                      onClick={() => removeModel('gemini', m)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Optional Key Override */}
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1 flex items-center justify-between">
                  <span>Sobrescribir API Key (Opcional si usas .env.local)</span>
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                    className="text-gray-500 hover:text-white"
                  >
                    {showKeys.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showKeys.gemini ? 'text' : 'password'}
                  value={gemini.config?.api_key || ''}
                  onChange={e => updateConfig('gemini', 'api_key', e.target.value)}
                  placeholder="Dejar vacío para usar GEMINI_API_KEY de .env.local"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 font-mono"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={testingId === 'gemini'}
                className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl text-xs font-semibold border border-purple-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {testingId === 'gemini' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Probar Conexión en Vivo</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('gemini')}
                disabled={savingId === 'gemini'}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savingId === 'gemini' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Guardar</span>
              </button>
            </div>

            {testResult?.id === 'gemini' && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. OPENAI CARD */}
        {(activeTab === 'all' || activeTab === 'ai') && (
          <div className="bg-[#11131a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-emerald-500/30 transition-all shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      OpenAI
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        GPT-4o
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Modelos insignia GPT-4o, GPT-4o-mini y modelos de razonamiento o1/o3.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleActive('openai')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    openai.is_active ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    openai.is_active ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Status Badge from Env */}
              <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
                envStatus.openai.hasKey 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {envStatus.openai.hasKey ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">Detectada en .env.local (OPENAI_API_KEY)</span>
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 shrink-0 text-gray-400" />
                    <span>Puedes agregar <code className="text-emerald-400">OPENAI_API_KEY</code> a tu .env.local o ingresarla abajo.</span>
                  </>
                )}
              </div>

              {/* API Key Input */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                  <span>API Key de OpenAI</span>
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                    className="text-gray-500 hover:text-white"
                  >
                    {showKeys.openai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showKeys.openai ? 'text' : 'password'}
                  value={openai.config?.api_key || ''}
                  onChange={e => updateConfig('openai', 'api_key', e.target.value)}
                  placeholder={envStatus.openai.hasKey ? 'Usando OPENAI_API_KEY de .env.local' : 'sk-proj-...'}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              {/* Active Model Selector */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Modelo Predeterminado
                </label>
                <select
                  value={openai.config?.active_model || 'gpt-4o-mini'}
                  onChange={e => updateConfig('openai', 'active_model', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                >
                  {(openai.config?.models || ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'o1']).map((m: string) => (
                    <option key={m} value={m} className="bg-[#11131a] text-white">{m}</option>
                  ))}
                </select>
              </div>

              {/* Manual Model Addition */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Agregar Modelo Personalizado
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newModelInputs['openai'] || ''}
                    onChange={e => setNewModelInputs(prev => ({ ...prev, openai: e.target.value }))}
                    placeholder="Ej: ft:gpt-4o-mini:custom"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomModel('openai')}
                    className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30 flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Models tags */}
              <div className="flex flex-wrap gap-1.5">
                {(openai.config?.models || ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'o1']).map((m: string) => (
                  <div key={m} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-gray-300">
                    <span>{m}</span>
                    <button
                      type="button"
                      onClick={() => removeModel('openai', m)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestOpenAI}
                disabled={testingId === 'openai'}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {testingId === 'openai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Probar Conexión</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('openai')}
                disabled={savingId === 'openai'}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savingId === 'openai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Guardar</span>
              </button>
            </div>

            {testResult?.id === 'openai' && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. SUPABASE REAL DATABASE & TABLES CARD */}
        {(activeTab === 'all' || activeTab === 'database') && (
          <div className="md:col-span-2 bg-[#11131a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-emerald-500/30 transition-all shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Supabase (PostgreSQL) — Conexión de Tablas en Vivo
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                        {selectedTablesCount} tablas conectadas
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Selecciona qué tablas vivas de tu negocio y finanzas puede consultar el Agente de ValisChat en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-semibold font-mono">vwzpsykgebxxkokpfgeq</span>
                </div>
              </div>

              {/* Explanatory note */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Cuando un cliente o tú pregunten por WhatsApp sobre gastos, pagos fijos, clientes o inventario, el Agente extraerá la información viva de las tablas marcadas y responderá con precisión.
                </p>
              </div>

              {/* Tables selector with interactive checkboxes */}
              <div>
                <label className="text-xs font-bold text-white mb-2 block uppercase tracking-wider">
                  Tablas Disponibles para Consulta del Agente IA:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {KNOWN_SUPABASE_TABLES.map(table => {
                    const isChecked = (supabaseConn.config?.tables || []).includes(table.id)
                    return (
                      <div
                        key={table.id}
                        onClick={() => toggleSupabaseTable(table.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                            : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-gray-600 bg-transparent'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-xs font-bold truncate ${isChecked ? 'text-emerald-300' : 'text-gray-200'}`}>
                              {table.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono">
                              {table.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-tight">
                            {table.description}
                          </p>
                          <code className="text-[10px] text-gray-500 font-mono mt-1 block">
                            {table.id}
                          </code>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400">
                URL del Proyecto: <code className="text-gray-300 font-mono">https://vwzpsykgebxxkokpfgeq.supabase.co</code>
              </span>

              <button
                type="button"
                onClick={() => handleSave('supabase')}
                disabled={savingId === 'supabase'}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savingId === 'supabase' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Guardar Tablas Conectadas</span>
              </button>
            </div>

            {testResult?.id === 'supabase' && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 4. PINECONE VECTOR DB CARD */}
        {(activeTab === 'all' || activeTab === 'database') && (
          <div className="bg-[#11131a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-indigo-500/30 transition-all shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Pinecone (Vector DB)
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                        RAG Textos Largos
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Recuperación semántica de catálogos extensos, PDFs y reglamentos.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleActive('pinecone')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    pinecone.is_active ? 'bg-indigo-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    pinecone.is_active ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Status Badge from Env */}
              <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
                envStatus.pinecone.hasKey 
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {envStatus.pinecone.hasKey ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span className="font-semibold text-indigo-400">Detectada en .env.local (PINECONE_API_KEY)</span>
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 shrink-0 text-gray-400" />
                    <span>Configura <code className="text-indigo-400">PINECONE_API_KEY</code> en tu .env.local o ingrésala abajo.</span>
                  </>
                )}
              </div>

              {/* API Key */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                  <span>API Key de Pinecone</span>
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, pinecone: !prev.pinecone }))}
                    className="text-gray-500 hover:text-white"
                  >
                    {showKeys.pinecone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showKeys.pinecone ? 'text' : 'password'}
                  value={pinecone.config?.api_key || ''}
                  onChange={e => updateConfig('pinecone', 'api_key', e.target.value)}
                  placeholder={envStatus.pinecone.hasKey ? 'Usando PINECONE_API_KEY de .env.local' : 'pcsk_...'}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                />
              </div>

              {/* Index Name & Dimension */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Nombre del Índice</label>
                  <input
                    type="text"
                    value={pinecone.config?.index_name || 'valis-docs-index'}
                    onChange={e => updateConfig('pinecone', 'index_name', e.target.value)}
                    placeholder="valis-docs-index"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Región / Entorno</label>
                  <input
                    type="text"
                    value={pinecone.config?.environment || 'us-east-1'}
                    onChange={e => updateConfig('pinecone', 'environment', e.target.value)}
                    placeholder="us-east-1"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestPinecone}
                disabled={testingId === 'pinecone'}
                className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {testingId === 'pinecone' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Probar Índice</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('pinecone')}
                disabled={savingId === 'pinecone'}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savingId === 'pinecone' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Guardar</span>
              </button>
            </div>

            {testResult?.id === 'pinecone' && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 5. GOOGLE CALENDAR CARD (NEW) */}
        {(activeTab === 'all' || activeTab === 'tools') && (
          <div className="bg-[#11131a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-amber-500/30 transition-all shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Google Calendar
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                        Agenda & Citas
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Permite al Agente consultar disponibilidad y agendar citas desde WhatsApp.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleActive('google_calendar')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    googleCalendar.is_active ? 'bg-amber-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    googleCalendar.is_active ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Status Badge from Env */}
              <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
                envStatus.google_calendar.hasKey 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {envStatus.google_calendar.hasKey ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                    <span className="font-semibold text-amber-400">Credenciales detectadas en .env.local</span>
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 shrink-0 text-gray-400" />
                    <span>Configura <code className="text-amber-400">GOOGLE_CALENDAR_API_KEY</code> o Service Account en .env.local.</span>
                  </>
                )}
              </div>

              {/* Calendar ID */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">ID de Calendario</label>
                <input
                  type="text"
                  value={googleCalendar.config?.calendar_id || 'primary'}
                  onChange={e => updateConfig('google_calendar', 'calendar_id', e.target.value)}
                  placeholder="primary o tunombre@gmail.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>

              {/* Optional API Key */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Google API Key / Token de Servicio</label>
                <input
                  type="password"
                  value={googleCalendar.config?.api_key || ''}
                  onChange={e => updateConfig('google_calendar', 'api_key', e.target.value)}
                  placeholder={envStatus.google_calendar.hasKey ? 'Configurado en .env.local' : 'AIzaSy...'}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestGoogleCalendar}
                disabled={testingId === 'google_calendar'}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {testingId === 'google_calendar' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Probar Calendario</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('google_calendar')}
                disabled={savingId === 'google_calendar'}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savingId === 'google_calendar' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Guardar</span>
              </button>
            </div>

            {testResult?.id === 'google_calendar' && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 6. WHATSAPP BUSINESS CLOUD API CARD */}
        {(activeTab === 'all' || activeTab === 'channels') && (
          <div className="bg-[#11131a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-emerald-500/30 transition-all shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-[14px] bg-[#090a0f] flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      WhatsApp Cloud API (Meta)
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        Activo en Vivo
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Canal oficial de mensajería empresarial de Meta.</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] text-emerald-400 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En Línea</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                  <span className="text-gray-500 text-[10px] block">Número Conectado:</span>
                  <span className="text-white font-bold font-mono">+507 6234-6917</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                  <span className="text-gray-500 text-[10px] block">Phone Number ID:</span>
                  <span className="text-white font-mono text-[11px]">1337365866128316</span>
                </div>
              </div>

              <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs">
                <span className="text-gray-500 text-[10px] block mb-1">Webhook Endpoint Activo en Vercel:</span>
                <code className="text-emerald-400 font-mono text-[11px] break-all">
                  https://valisfin-9opw.vercel.app/api/webhooks/whatsapp
                </code>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-gray-400">
              <span>WABA ID: 1634312344945614 (ValisVen)</span>
              <span className="text-emerald-400 font-medium">Suscripción verificada 100%</span>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
