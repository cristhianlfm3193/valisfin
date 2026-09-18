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
  BookOpen
} from 'lucide-react'
import { 
  updateConnector, 
  testOpenAIConnection, 
  testGeminiConnection, 
  testPineconeConnection, 
  Connector 
} from '@/app/actions/valischat_connectors'

export default function ConnectorsClient({ initialConnectors }: { initialConnectors: Connector[] }) {
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors)
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'database' | 'channels'>('all')
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
    const conn = getConn(id)
    setSavingId(id)
    setTestResult(null)
    const res = await updateConnector(id, conn.config, conn.is_active)
    setSavingId(null)

    if (res.success) {
      setTestResult({ id, success: true, message: '¡Configuración guardada exitosamente!' })
    } else {
      setTestResult({ id, success: false, message: res.error || 'Error al guardar configuración.' })
    }
  }

  const handleTestOpenAI = async () => {
    const conn = getConn('openai')
    setTestingId('openai')
    setTestResult(null)
    const res = await testOpenAIConnection(conn.config?.api_key, conn.config?.active_model)
    setTestingId(null)
    setTestResult({
      id: 'openai',
      success: res.success,
      message: res.success ? (res.message || 'Conexión exitosa.') : (res.error || 'Fallo de conexión.')
    })
  }

  const handleTestGemini = async () => {
    const conn = getConn('gemini')
    setTestingId('gemini')
    setTestResult(null)
    const res = await testGeminiConnection(conn.config?.api_key, conn.config?.active_model)
    setTestingId(null)
    setTestResult({
      id: 'gemini',
      success: res.success,
      message: res.success ? (res.message || 'Conexión exitosa.') : (res.error || 'Fallo de conexión.')
    })
  }

  const handleTestPinecone = async () => {
    const conn = getConn('pinecone')
    setTestingId('pinecone')
    setTestResult(null)
    const res = await testPineconeConnection(
      conn.config?.api_key,
      conn.config?.environment,
      conn.config?.index_name || 'valischat-knowledge'
    )
    setTestingId(null)
    setTestResult({
      id: 'pinecone',
      success: res.success,
      message: res.success ? (res.message || 'Conexión exitosa.') : (res.error || 'Fallo de conexión.')
    })
  }

  const gemini = getConn('gemini')
  const openai = getConn('openai')
  const supabaseConn = getConn('supabase')
  const pinecone = getConn('pinecone')
  const whatsapp = getConn('whatsapp')

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#121c27] to-teal-950/30 border border-emerald-500/20 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Plug className="w-3.5 h-3.5" />
              Ecosistema de Conectividad & IA
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Centro de Conectores ValisChat
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
              Integra modelos de Inteligencia Artificial (OpenAI, Gemini), almacenes de datos relacionales (Supabase) y bases de datos vectoriales semánticas (Pinecone) para nutrir de contexto real a tu agente de WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="/agente" 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              <span>Ir al Estudio de Agente</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'all' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:bg-white/5'}`}
          >
            Todos los Conectores
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${activeTab === 'ai' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Modelos de IA (OpenAI / Gemini)
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${activeTab === 'database' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Database className="w-3.5 h-3.5" />
            Bases de Datos & Pinecone (RAG)
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${activeTab === 'channels' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Canales de Mensajería
          </button>
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. GOOGLE GEMINI */}
        {(activeTab === 'all' || activeTab === 'ai') && (
          <div className="rounded-2xl bg-[#121c27]/60 border border-white/10 p-6 flex flex-col justify-between space-y-6 backdrop-blur-xl relative hover:border-emerald-500/30 transition-all shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-sky-400 to-indigo-500 p-[2px] shadow-md shadow-sky-500/20">
                    <div className="w-full h-full rounded-[14px] bg-[#090a0f] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-sky-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Google Gemini
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold">
                        Nativo
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Modelos multimodales rápidos y de alto razonamiento</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={gemini.is_active} 
                    onChange={() => toggleActive('gemini')}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* API Key Input */}
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  API Key de Gemini
                  <span className="text-[10px] text-gray-500 font-normal">(Usa GEMINI_API_KEY del servidor por defecto)</span>
                </label>
                <div className="relative">
                  <input
                    type={showKeys['gemini'] ? 'text' : 'password'}
                    value={gemini.config?.api_key || ''}
                    onChange={(e) => updateConfig('gemini', 'api_key', e.target.value)}
                    placeholder="AQ.Ab8RN6... (o deja en blanco para usar la del servidor)"
                    className="w-full bg-[#090a0f] text-sm text-white rounded-xl pl-3.5 pr-10 py-2.5 border border-white/10 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKeys['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Model selection */}
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-gray-300">Modelos disponibles</label>
                <div className="flex flex-wrap gap-2">
                  {(gemini.config?.models || ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash']).map((m: string) => (
                    <div 
                      key={m}
                      onClick={() => updateConfig('gemini', 'active_model', m)}
                      className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        gemini.config?.active_model === m 
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm' 
                          : 'bg-[#090a0f] text-gray-400 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span>{m}</span>
                      {gemini.config?.active_model === m && <CheckCircle2 className="w-3 h-3 text-sky-400" />}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeModel('gemini', m); }}
                        className="text-gray-500 hover:text-rose-400 ml-1"
                        title="Eliminar modelo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Model Manually */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newModelInputs['gemini'] || ''}
                    onChange={(e) => setNewModelInputs(prev => ({ ...prev, gemini: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomModel('gemini'); } }}
                    placeholder="Agregar modelo manualmente (ej. gemini-2.0-flash-exp)..."
                    className="flex-1 bg-[#090a0f] text-xs text-white rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-sky-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomModel('gemini')}
                    className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & Result */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={testingId === 'gemini'}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                {testingId === 'gemini' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                Probar Conexión
              </button>

              <button
                type="button"
                onClick={() => handleSave('gemini')}
                disabled={savingId === 'gemini'}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
              >
                {savingId === 'gemini' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar
              </button>
            </div>

            {testResult?.id === 'gemini' && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${testResult.success ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. OPENAI */}
        {(activeTab === 'all' || activeTab === 'ai') && (
          <div className="rounded-2xl bg-[#121c27]/60 border border-white/10 p-6 flex flex-col justify-between space-y-6 backdrop-blur-xl relative hover:border-emerald-500/30 transition-all shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-green-600 p-[2px] shadow-md shadow-emerald-500/20">
                    <div className="w-full h-full rounded-[14px] bg-[#090a0f] flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      OpenAI
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        GPT-4o & Reasoning
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Modelos GPT y modelos de razonamiento avanzado</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={openai.is_active} 
                    onChange={() => toggleActive('openai')}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* API Key Input */}
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  API Key de OpenAI
                </label>
                <div className="relative">
                  <input
                    type={showKeys['openai'] ? 'text' : 'password'}
                    value={openai.config?.api_key || ''}
                    onChange={(e) => updateConfig('openai', 'api_key', e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full bg-[#090a0f] text-sm text-white rounded-xl pl-3.5 pr-10 py-2.5 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Model selection */}
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-gray-300">Modelos disponibles</label>
                <div className="flex flex-wrap gap-2">
                  {(openai.config?.models || ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini']).map((m: string) => (
                    <div 
                      key={m}
                      onClick={() => updateConfig('openai', 'active_model', m)}
                      className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        openai.config?.active_model === m 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' 
                          : 'bg-[#090a0f] text-gray-400 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span>{m}</span>
                      {openai.config?.active_model === m && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeModel('openai', m); }}
                        className="text-gray-500 hover:text-rose-400 ml-1"
                        title="Eliminar modelo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Model Manually */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newModelInputs['openai'] || ''}
                    onChange={(e) => setNewModelInputs(prev => ({ ...prev, openai: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomModel('openai'); } }}
                    placeholder="Agregar modelo manualmente (ej. gpt-4.5-preview o fine-tune)..."
                    className="flex-1 bg-[#090a0f] text-xs text-white rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomModel('openai')}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & Result */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestOpenAI}
                disabled={testingId === 'openai'}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                {testingId === 'openai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                Probar Conexión
              </button>

              <button
                type="button"
                onClick={() => handleSave('openai')}
                disabled={savingId === 'openai'}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
              >
                {savingId === 'openai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar
              </button>
            </div>

            {testResult?.id === 'openai' && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${testResult.success ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. PINECONE (Vector Database para RAG de Textos Largos) */}
        {(activeTab === 'all' || activeTab === 'database') && (
          <div className="rounded-2xl bg-[#121c27]/60 border border-white/10 p-6 flex flex-col justify-between space-y-6 backdrop-blur-xl relative hover:border-amber-500/30 transition-all shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-500 p-[2px] shadow-md shadow-amber-500/20">
                    <div className="w-full h-full rounded-[14px] bg-[#090a0f] flex items-center justify-center">
                      <Layers className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Pinecone Vector DB
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                        RAG Semántico
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Almacenamiento de textos largos, manuales y catálogos en vectores</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={pinecone.is_active} 
                    onChange={() => toggleActive('pinecone')}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* RAG Description Box */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>¿Para qué sirve Pinecone?</strong> Permite dividir documentos extensos (catálogos de precios, manuales de servicio, políticas de garantía) en fragmentos semánticos. Cuando el cliente pregunte por WhatsApp, la IA buscará en milisegundos los párrafos exactos relevantes para responder con total precisión.
                </p>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">API Key de Pinecone</label>
                  <input
                    type={showKeys['pinecone'] ? 'text' : 'password'}
                    value={pinecone.config?.api_key || ''}
                    onChange={(e) => updateConfig('pinecone', 'api_key', e.target.value)}
                    placeholder="pcsk_..."
                    className="w-full bg-[#090a0f] text-xs text-white rounded-xl px-3 py-2.5 border border-white/10 outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Nombre del Índice (Index)</label>
                  <input
                    type="text"
                    value={pinecone.config?.index_name || 'valischat-knowledge'}
                    onChange={(e) => updateConfig('pinecone', 'index_name', e.target.value)}
                    placeholder="valischat-knowledge"
                    className="w-full bg-[#090a0f] text-xs text-white rounded-xl px-3 py-2.5 border border-white/10 outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Host / Environment (Opcional)</label>
                  <input
                    type="text"
                    value={pinecone.config?.environment || ''}
                    onChange={(e) => updateConfig('pinecone', 'environment', e.target.value)}
                    placeholder="us-east-1 o aws"
                    className="w-full bg-[#090a0f] text-xs text-white rounded-xl px-3 py-2.5 border border-white/10 outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Dimensiones vectoriales</label>
                  <input
                    type="number"
                    value={pinecone.config?.dimension || 1536}
                    onChange={(e) => updateConfig('pinecone', 'dimension', Number(e.target.value))}
                    placeholder="1536 (OpenAI) / 768 (Gemini)"
                    className="w-full bg-[#090a0f] text-xs text-white rounded-xl px-3 py-2.5 border border-white/10 outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestPinecone}
                disabled={testingId === 'pinecone'}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                {testingId === 'pinecone' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                Verificar Índice
              </button>

              <button
                type="button"
                onClick={() => handleSave('pinecone')}
                disabled={savingId === 'pinecone'}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
              >
                {savingId === 'pinecone' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar
              </button>
            </div>

            {testResult?.id === 'pinecone' && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${testResult.success ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* 4. SUPABASE DATABASE */}
        {(activeTab === 'all' || activeTab === 'database') && (
          <div className="rounded-2xl bg-[#121c27]/60 border border-white/10 p-6 flex flex-col justify-between space-y-6 backdrop-blur-xl relative hover:border-emerald-500/30 transition-all shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-green-600 p-[2px] shadow-md shadow-emerald-500/20">
                    <div className="w-full h-full rounded-[14px] bg-[#090a0f] flex items-center justify-center">
                      <Database className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Supabase PostgreSQL
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Activa & Conectada
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Base de datos transaccional relacional del ecosistema Valis</p>
                  </div>
                </div>

                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="p-3 bg-[#090a0f] rounded-xl border border-white/5 space-y-1">
                  <p className="text-[11px] text-gray-400">Instancia conectada</p>
                  <p className="text-xs font-mono text-emerald-400 truncate">https://vwzpsykgebxxkokpfgeq.supabase.co</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-2">Tablas accesibles para contexto del Agente</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'whatsapp_messages', desc: 'Historial de chats' },
                      { name: 'whatsapp_chats', desc: 'Directorio de clientes' },
                      { name: 'valisbiz_ventas', desc: 'Registros de ventas' },
                      { name: 'pagos_fijos', desc: 'Suscripciones y cuotas' }
                    ].map(t => (
                      <span key={t.name} className="px-3 py-1.5 rounded-lg bg-[#090a0f] border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Seguridad RLS y Service Role activa
              </span>
              <span className="text-[11px] text-gray-500">Totalmente integrado</span>
            </div>
          </div>
        )}

        {/* 5. WHATSAPP CLOUD API CHANNEL */}
        {(activeTab === 'all' || activeTab === 'channels') && (
          <div className="rounded-2xl bg-[#121c27]/60 border border-white/10 p-6 flex flex-col justify-between space-y-6 backdrop-blur-xl relative hover:border-emerald-500/30 transition-all shadow-lg lg:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-md shadow-emerald-500/20">
                    <div className="w-full h-full rounded-[14px] bg-[#090a0f] flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      WhatsApp Business Cloud API (Meta)
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        Enlace Bidireccional Activo
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Canal oficial de entrada y salida conectado mediante Meta Graph API</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectado (Live)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="p-3 bg-[#090a0f] rounded-xl border border-white/5 space-y-1">
                  <p className="text-[11px] text-gray-400">Número de WhatsApp</p>
                  <p className="text-sm font-semibold text-white">+507 6234-6917</p>
                </div>
                <div className="p-3 bg-[#090a0f] rounded-xl border border-white/5 space-y-1">
                  <p className="text-[11px] text-gray-400">WABA ID (WhatsApp Account)</p>
                  <p className="text-sm font-mono text-gray-300">1634312344945614</p>
                </div>
                <div className="p-3 bg-[#090a0f] rounded-xl border border-white/5 space-y-1">
                  <p className="text-[11px] text-gray-400">Webhook Endpoint</p>
                  <p className="text-xs font-mono text-emerald-400 truncate">https://valisfin-9opw.vercel.app/api/whatsapp/webhook</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Suscrito a eventos: <strong>messages</strong>, statuses (sent, delivered, read)
              </span>
              <a 
                href="/whatsapp" 
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                Abrir ValisChat
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
