'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Bot, 
  Sparkles, 
  Workflow, 
  Cpu, 
  Database, 
  Layers, 
  MessageSquare, 
  Send, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Zap, 
  Shield, 
  ArrowRight, 
  FileText, 
  CornerDownLeft, 
  Loader2,
  Trash2,
  HelpCircle,
  Code,
  Check
} from 'lucide-react'
import { AgentConfig, updateAgentConfig, testAgentInSandbox } from '@/app/actions/valischat_agent'
import { Connector } from '@/app/actions/valischat_connectors'

interface Props {
  initialConfig: AgentConfig
  connectors: Connector[]
}

interface SandboxMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  usedContext?: string
}

export default function AgentStudioClient({ initialConfig, connectors }: Props) {
  const [config, setConfig] = useState<AgentConfig>(initialConfig)
  const [selectedNode, setSelectedNode] = useState<'trigger' | 'rag' | 'llm' | 'action'>('llm')
  const [activeTab, setActiveTab] = useState<'prompt' | 'llm' | 'rag' | 'action'>('prompt')
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Sandbox state
  const [sandboxMessages, setSandboxMessages] = useState<SandboxMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola! Soy ${initialConfig.agent_name || 'ValisBot'}. Estoy listo para simular conversaciones y responder con el contexto de tu negocio. Escríbeme un mensaje para probar mis respuestas.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [sandboxInput, setSandboxInput] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)
  const [expandedContextId, setExpandedContextId] = useState<string | null>(null)

  // Presets
  const presets = [
    {
      name: 'Atención al Cliente & Ventas',
      role: 'Asesor comercial y soporte al cliente para WhatsApp',
      prompt: `Eres el agente oficial de atención al cliente de ValisFin. Tu meta es atender a los clientes con amabilidad, rapidez y profesionalismo.
Pautas:
- Saluda cordialmente mencionando ValisFin.
- Responde dudas sobre productos, precios y horarios.
- Si el cliente desea contratar un servicio o solicitar una cita, pide amablemente su nombre y detalles.
- Sé breve y claro, ideal para lectura en WhatsApp (máximo 2 a 3 párrafos cortos).`
    },
    {
      name: 'Asistente Financiero & Consultas',
      role: 'Asistente de orientación sobre finanzas y estado de cuenta',
      prompt: `Eres el asesor financiero digital de ValisFin. Tu objetivo es orientar a los usuarios sobre gestión de finanzas, planes y servicios de la plataforma.
Pautas:
- Utiliza un tono empático, pedagógico y confiable.
- Para consultas de saldos o transacciones, explica que los datos están protegidos y brinda información puntual.
- Recuerda siempre al usuario que no debe compartir contraseñas ni códigos de seguridad por este canal.`
    },
    {
      name: 'Soporte Técnico Especializado',
      role: 'Especialista en soporte técnico y resolución de incidencias',
      prompt: `Eres el especialista de soporte técnico de la plataforma.
Pautas:
- Realiza preguntas de diagnóstico precisas paso a paso.
- Ofrece soluciones claras numeradas.
- Si el problema requiere escalamiento con un agente humano, indícale al usuario que transferirás el caso de inmediato.`
    }
  ]

  const applyPreset = (preset: typeof presets[0]) => {
    setConfig(prev => ({
      ...prev,
      role_description: preset.role,
      system_prompt: preset.prompt
    }))
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    setErrorMessage(null)
    setSaveSuccess(false)

    try {
      const res = await updateAgentConfig(config)
      if (res.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setErrorMessage(res.error || 'Error al guardar la configuración')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendSandbox = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = sandboxInput.trim()
    if (!text || isSimulating) return

    const userMsg: SandboxMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setSandboxMessages(prev => [...prev, userMsg])
    setSandboxInput('')
    setIsSimulating(true)

    try {
      const history = sandboxMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await testAgentInSandbox(text, history)
      if (res.success && res.reply) {
        const assistantMsg: SandboxMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          usedContext: res.usedContext
        }
        setSandboxMessages(prev => [...prev, assistantMsg])
      } else {
        const errorMsg: SandboxMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Error de simulación: ${res.error || 'No se pudo obtener respuesta del modelo configurado.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setSandboxMessages(prev => [...prev, errorMsg])
      }
    } catch (err: any) {
      const errorMsg: SandboxMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error de conexión: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setSandboxMessages(prev => [...prev, errorMsg])
    } finally {
      setIsSimulating(false)
    }
  }

  // Get active models based on selected provider
  const geminiConn = connectors.find(c => c.id === 'gemini')
  const openaiConn = connectors.find(c => c.id === 'openai')

  const availableModels = config.model_provider === 'gemini' 
    ? (geminiConn?.config?.models || ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-flash-latest', 'gemini-1.5-pro'])
    : (openaiConn?.config?.models || ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'o1'])

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#090a0f]/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Estudio de Agente IA
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    v2.5 Orchestrator
                  </span>
                </h1>
              </div>
              <p className="text-xs text-gray-400">
                Diseña el flujo de razonamiento RAG, contexto empresarial y directivas de respuesta para WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode Switcher Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs">
              <span className="text-gray-400">Modo de Operación:</span>
              <button
                onClick={() => setConfig(prev => ({ ...prev, mode: prev.mode === 'copilot' ? 'autonomous' : 'copilot' }))}
                className={`font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  config.mode === 'autonomous'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {config.mode === 'autonomous' ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Autónomo (Auto-Respuesta)
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Copiloto (Sugerencias)
                  </>
                )}
              </button>
            </div>

            {/* Active Toggle */}
            <button
              onClick={() => setConfig(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                config.is_active 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-gray-800/40 border-gray-700 text-gray-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${config.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              {config.is_active ? 'Agente Activo' : 'En Pausa'}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Guardando...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="max-w-7xl mx-auto mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1 flex flex-col gap-6">
        
        {/* Visual Pipeline n8n style Canvas */}
        <section className="bg-gradient-to-b from-[#11131a] to-[#0c0d12] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#34d399 0.75px, transparent 0.75px)`,
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  Flujo de Orquestación n8n (Canal WhatsApp → Cerebro IA)
                </h2>
              </div>
              <span className="text-xs text-gray-500">
                Haz clic en cualquier nodo para inspeccionar y ajustar sus parámetros
              </span>
            </div>

            {/* Pipeline Nodes in Grid / Flex */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch relative">
              
              {/* NODE 1: Trigger */}
              <div
                onClick={() => { setSelectedNode('trigger'); setActiveTab('action'); }}
                className={`group relative rounded-xl p-4 border transition-all cursor-pointer backdrop-blur-md ${
                  selectedNode === 'trigger'
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                    : 'bg-white/[0.03] border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-emerald-300">1. Disparador</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                    Webhook
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">WhatsApp Inbound</h3>
                <p className="text-[11px] text-gray-400 mb-3">
                  Mensaje entrante de cliente al +507 6234-6917
                </p>
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>POST /api/webhooks/whatsapp</span>
                </div>
              </div>

              {/* NODE 2: Context / RAG */}
              <div
                onClick={() => { setSelectedNode('rag'); setActiveTab('rag'); }}
                className={`group relative rounded-xl p-4 border transition-all cursor-pointer backdrop-blur-md ${
                  selectedNode === 'rag'
                    ? 'bg-indigo-950/30 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/40'
                    : 'bg-white/[0.03] border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-indigo-300">2. Contexto & RAG</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-400">
                    Vector + SQL
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Pinecone + Supabase</h3>
                <p className="text-[11px] text-gray-400 mb-3">
                  Recuperación semántica de documentos y perfil en base de datos.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-indigo-300 font-mono bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 truncate">
                  <span>Índice: {config.pinecone_index || 'pinecone-general'}</span>
                </div>
              </div>

              {/* NODE 3: AI Engine */}
              <div
                onClick={() => { setSelectedNode('llm'); setActiveTab('llm'); }}
                className={`group relative rounded-xl p-4 border transition-all cursor-pointer backdrop-blur-md ${
                  selectedNode === 'llm'
                    ? 'bg-purple-950/30 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/40'
                    : 'bg-white/[0.03] border-white/10 hover:border-purple-500/40 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-purple-300">3. Cerebro IA</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400 uppercase">
                    {config.model_provider}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 truncate">{config.model_name}</h3>
                <p className="text-[11px] text-gray-400 mb-3">
                  Razonamiento, directivas del negocio y generación de respuesta.
                </p>
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-mono bg-purple-500/5 px-2 py-1 rounded border border-purple-500/10">
                  <span>Temp: {config.temperature}</span>
                  <span>Tokens: {config.max_tokens}</span>
                </div>
              </div>

              {/* NODE 4: Action */}
              <div
                onClick={() => { setSelectedNode('action'); setActiveTab('action'); }}
                className={`group relative rounded-xl p-4 border transition-all cursor-pointer backdrop-blur-md ${
                  selectedNode === 'action'
                    ? 'bg-pink-950/30 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/40'
                    : 'bg-white/[0.03] border-white/10 hover:border-pink-500/40 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-pink-300">4. Acción Final</span>
                  </div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    config.mode === 'autonomous' ? 'bg-amber-500/20 text-amber-400' : 'bg-pink-500/20 text-pink-400'
                  }`}>
                    {config.mode === 'autonomous' ? 'Autónomo' : 'Copiloto'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {config.mode === 'autonomous' ? 'Envío Directo WhatsApp' : 'Borrador en ValisChat'}
                </h3>
                <p className="text-[11px] text-gray-400 mb-3">
                  {config.mode === 'autonomous'
                    ? 'El agente responde automáticamente al cliente.'
                    : 'Sugiere la respuesta al operador humano para aprobar con 1 clic.'}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-pink-300 font-mono bg-pink-500/5 px-2 py-1 rounded border border-pink-500/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Canal Oficial ValisChat</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2-Column Layout: Left (Configuration Tabs) & Right (Live Interactive Sandbox) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Configuration & System Prompt Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('prompt')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'prompt'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4" />
                Directivas & Contexto
              </button>

              <button
                onClick={() => setActiveTab('llm')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'llm'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Cpu className="w-4 h-4" />
                Cerebro IA & Parámetros
              </button>

              <button
                onClick={() => setActiveTab('rag')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'rag'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Database className="w-4 h-4" />
                RAG & Base Vectorial
              </button>

              <button
                onClick={() => setActiveTab('action')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'action'
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap className="w-4 h-4" />
                Modo & Despliegue
              </button>
            </div>

            {/* TAB CONTENT 1: System Prompt & Directives */}
            {activeTab === 'prompt' && (
              <div className="bg-[#11131a]/90 border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Directivas & Personalidad del Agente
                    </h3>
                    <p className="text-xs text-gray-400">
                      Define cómo debe hablar el agente, qué reglas debe respetar y qué contexto de tu negocio debe tener.
                    </p>
                  </div>

                  {/* Presets dropdown */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">Plantillas:</span>
                    {presets.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                      >
                        {p.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent Name & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                      Nombre del Agente
                    </label>
                    <input
                      type="text"
                      value={config.agent_name || ''}
                      onChange={e => setConfig(prev => ({ ...prev, agent_name: e.target.value }))}
                      placeholder="Ej: ValisBot, Sofía de ValisFin"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                      Rol / Objetivo Principal
                    </label>
                    <input
                      type="text"
                      value={config.role_description || ''}
                      onChange={e => setConfig(prev => ({ ...prev, role_description: e.target.value }))}
                      placeholder="Ej: Asistente comercial para ventas y atención"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* System Prompt Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                      Prompt de Sistema & Contexto del Negocio
                      <span className="text-[10px] text-gray-500 font-normal">(Markdown soportado)</span>
                    </label>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {(config.system_prompt || '').length} caracteres
                    </span>
                  </div>

                  <textarea
                    rows={12}
                    value={config.system_prompt || ''}
                    onChange={e => setConfig(prev => ({ ...prev, system_prompt: e.target.value }))}
                    placeholder="Escribe las directivas completas, reglas de negocio, preguntas frecuentes y tono..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-200 leading-relaxed placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 resize-y"
                  />
                </div>

                {/* Dynamic Variables helper */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Code className="w-3.5 h-3.5" />
                    <span>Variables disponibles inyectadas automáticamente:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { tag: '{{cliente_nombre}}', desc: 'Nombre del remitente de WhatsApp' },
                      { tag: '{{numero_telefono}}', desc: 'Número del cliente (+507...)' },
                      { tag: '{{contexto_pinecone}}', desc: 'Fragmentos recuperados del catálogo RAG' },
                      { tag: '{{historial_chat}}', desc: 'Mensajes previos en la conversación' }
                    ].map((v, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
                        <code className="text-emerald-400 font-mono font-bold">{v.tag}</code>
                        <span className="text-gray-500 text-[10px]">• {v.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: LLM Engine & Parameters */}
            {activeTab === 'llm' && (
              <div className="bg-[#11131a]/90 border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    Selección del Modelo & Hiperparámetros
                  </h3>
                  <p className="text-xs text-gray-400">
                    Elige el proveedor de inteligencia artificial y calibra la creatividad de las respuestas.
                  </p>
                </div>

                {/* Provider Selector Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        model_provider: 'gemini',
                        model_name: geminiConn?.config?.active_model || 'gemini-3.6-flash'
                      }))
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      config.model_provider === 'gemini'
                        ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-300">Google Gemini</span>
                      {config.model_provider === 'gemini' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Excelente velocidad, ventana de contexto gigante y razonamiento multimodal nativo.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        model_provider: 'openai',
                        model_name: openaiConn?.config?.active_model || 'gpt-4o'
                      }))
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      config.model_provider === 'openai'
                        ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-300">OpenAI</span>
                      {config.model_provider === 'openai' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Modelos insignia GPT-4o y mini, alto seguimiento estricto de directivas de sistema.
                    </p>
                  </div>
                </div>

                {/* Model Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-300">
                      Modelo Seleccionado ({config.model_provider.toUpperCase()})
                    </label>
                    <Link
                      href="/conectores"
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <span>Gestionar modelos en Conectores</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <select
                    value={config.model_name}
                    onChange={e => setConfig(prev => ({ ...prev, model_name: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {availableModels.map((m: string) => (
                      <option key={m} value={m} className="bg-[#11131a] text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperature Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      Temperatura (Creatividad vs Precisión)
                    </label>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {config.temperature}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.temperature}
                    onChange={e => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>0.0 (Estricto / Preciso)</span>
                    <span>0.7 (Equilibrado Comercial)</span>
                    <span>1.0 (Muy Creativo)</span>
                  </div>
                </div>

                {/* Max Tokens Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-300">
                      Límite de Tokens por Respuesta
                    </label>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {config.max_tokens} tokens
                    </span>
                  </div>

                  <input
                    type="range"
                    min="150"
                    max="2048"
                    step="50"
                    value={config.max_tokens}
                    onChange={e => setConfig(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />

                  <p className="text-[10px] text-gray-500 mt-1">
                    Para WhatsApp, se recomienda entre 300 y 800 tokens para respuestas concisas y directas.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: RAG & Pinecone */}
            {activeTab === 'rag' && (
              <div className="bg-[#11131a]/90 border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    Recuperación Aumentada (RAG) & Documentos Largos
                  </h3>
                  <p className="text-xs text-gray-400">
                    Conecta Pinecone y Supabase para que el agente entienda catálogos extensos y reglamentos sin saturar el prompt inicial.
                  </p>
                </div>

                {/* Pinecone Index Configuration */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Índice Vectorial de Pinecone
                    </span>
                    <Link
                      href="/conectores"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Configurar Llave API</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div>
                    <label className="text-xs text-gray-300 mb-1.5 block">
                      Nombre del Índice en Pinecone
                    </label>
                    <input
                      type="text"
                      value={config.pinecone_index || ''}
                      onChange={e => setConfig(prev => ({ ...prev, pinecone_index: e.target.value }))}
                      placeholder="valis-docs-index"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                    />
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Cuando un usuario envíe una consulta larga o técnica, el sistema buscará los vectores más similares (Top 3) y los anexará como contexto contextual al LLM.
                  </p>
                </div>

                {/* Supabase Context Source */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      Tablas de Supabase Conectadas para el Agente
                    </span>
                    <Link
                      href="/conectores"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Modificar en Conectores</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {(connectors.find(c => c.id === 'supabase')?.config?.tables || [
                      'daily_expenses', 
                      'fixed_payments', 
                      'incomes', 
                      'valisven_clientes'
                    ]).map((tbl: string) => (
                      <div key={tbl} className="p-2.5 bg-black/40 border border-white/5 rounded-lg flex items-center gap-2 text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-white font-mono">{tbl}</p>
                          <p className="text-[10px] text-gray-400">Lectura de datos en vivo</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-gray-400">
                    El Agente consulta estas tablas en vivo para responder con exactitud preguntas sobre gastos, pagos fijos pendientes o clientes registrados.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: Mode & Deployment */}
            {activeTab === 'action' && (
              <div className="bg-[#11131a]/90 border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-pink-400" />
                    Modo de Despliegue en WhatsApp
                  </h3>
                  <p className="text-xs text-gray-400">
                    Decide si el agente asistirá a los humanos o responderá de forma independiente.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Copilot Mode */}
                  <div
                    onClick={() => setConfig(prev => ({ ...prev, mode: 'copilot' }))}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      config.mode === 'copilot'
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        Modo Copiloto (Recomendado)
                      </span>
                      {config.mode === 'copilot' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                      El agente genera borradores de respuesta automáticos en la interfaz de ValisChat. El operador puede revisarlos, editarlos y enviarlos con un solo clic.
                    </p>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      ✓ Control humano garantizado al 100%
                    </div>
                  </div>

                  {/* Autonomous Mode */}
                  <div
                    onClick={() => setConfig(prev => ({ ...prev, mode: 'autonomous' }))}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      config.mode === 'autonomous'
                        ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Modo Autónomo (24/7)
                      </span>
                      {config.mode === 'autonomous' && (
                        <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                      El agente responde directamente y sin demora a cada mensaje entrante en WhatsApp a través de la Cloud API de Meta.
                    </p>
                    <div className="text-[11px] text-amber-400 font-medium">
                      ⚠️ Requiere prompts probados en el Sandbox
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Live Interactive Sandbox / Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#11131a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
              
              {/* Sandbox Top Header */}
              <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Sandbox de Pruebas en Vivo
                      <span className="text-[10px] text-gray-400 font-normal">
                        ({config.model_provider}: {config.model_name})
                      </span>
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Simulador en tiempo real del razonamiento del agente
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSandboxMessages([
                    {
                      id: 'welcome',
                      role: 'assistant',
                      content: `Sandbox reiniciado. Prueba enviarme una pregunta como cliente de WhatsApp.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ])}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Reiniciar chat de prueba"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                {sandboxMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {msg.role === 'user' ? 'Cliente Simulado' : (config.agent_name || 'Agente')}
                      </span>
                      <span className="text-[9px] text-gray-600">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-900/20'
                          : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.usedContext && (
                      <div className="mt-1 max-w-[85%]">
                        <button
                          type="button"
                          onClick={() => setExpandedContextId(expandedContextId === msg.id ? null : msg.id)}
                          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>{expandedContextId === msg.id ? 'Ocultar contexto RAG' : 'Ver contexto inyectado'}</span>
                        </button>
                        {expandedContextId === msg.id && (
                          <div className="mt-1 p-2 bg-black/60 rounded border border-indigo-500/30 text-[10px] text-indigo-300 font-mono">
                            {msg.usedContext}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isSimulating && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Razonando con {config.model_name}...</span>
                  </div>
                )}
              </div>

              {/* Sandbox Input Form */}
              <form onSubmit={handleSendSandbox} className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
                <input
                  type="text"
                  value={sandboxInput}
                  onChange={e => setSandboxInput(e.target.value)}
                  placeholder="Escribe un mensaje de prueba (ej: ¿Cuáles son sus precios?)..."
                  disabled={isSimulating}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                />

                <button
                  type="submit"
                  disabled={!sandboxInput.trim() || isSimulating}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black rounded-xl font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

            {/* Quick Test Prompt suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap px-1">
              <span className="text-[11px] text-gray-500">Probar rápido:</span>
              {[
                'Hola, ¿qué servicios tienen?',
                '¿Cómo funciona el pago de membresía?',
                'Quiero hablar con un asesor'
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSandboxInput(suggestion)}
                  className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}
