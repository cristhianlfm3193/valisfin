'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendWhatsAppMessage, markChatAsRead, toggleChatBot, toggleGlobalBot } from '@/app/actions/whatsapp'
import { 
  generateAgentReplyForChat, 
  triggerAgentReplyAndSend, 
  toggleAgentMode 
} from '@/app/actions/valischat_agent'
import { 
  Send, 
  Phone, 
  Search, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Loader2, 
  ArrowLeft,
  Bot,
  UserCheck,
  Zap,
  Shield,
  Sparkles
} from 'lucide-react'
import { format } from 'date-fns'

type Chat = {
  id: string
  phone_number: string
  contact_name: string
  last_message_at: string
  unread_count: number
  is_bot_active?: boolean
}

type Message = {
  id: string
  chat_id: string
  body: string
  direction: 'inbound' | 'outbound'
  status: string
  created_at: string
}

export default function WhatsAppChatClient({ 
  initialChats, 
  initialMessages,
  initialGlobalBotActive = true,
  initialAgentMode = 'autonomous'
}: { 
  initialChats: Chat[], 
  initialMessages: Message[],
  initialGlobalBotActive?: boolean,
  initialAgentMode?: 'autonomous' | 'copilot'
}) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isGlobalBotActive, setIsGlobalBotActive] = useState(initialGlobalBotActive)
  const [isTogglingGlobal, setIsTogglingGlobal] = useState(false)
  const [togglingChatId, setTogglingChatId] = useState<string | null>(null)
  const [agentMode, setAgentMode] = useState<'autonomous' | 'copilot'>(initialAgentMode)
  const [isTogglingMode, setIsTogglingMode] = useState(false)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [isAutoReplying, setIsAutoReplying] = useState(false)
  const [aiLatency, setAiLatency] = useState<number | null>(null)
  const [aiStatusMsg, setAiStatusMsg] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId])
  const activeMessages = useMemo(() => messages.filter(m => m.chat_id === activeChatId), [messages, activeChatId])

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  }

  // Handle activeChatId change, sync body attribute, and scroll messages
  useEffect(() => {
    if (activeChatId) {
      window.scrollTo(0, 0)
      document.body.setAttribute('data-chat-active', 'true')
      setTimeout(() => scrollToBottom(false), 50)
    } else {
      document.body.removeAttribute('data-chat-active')
    }

    return () => {
      document.body.removeAttribute('data-chat-active')
    }
  }, [activeChatId])

  // Scroll to bottom when new messages arrive
  const lastMessageId = activeMessages[activeMessages.length - 1]?.id
  useEffect(() => {
    if (lastMessageId) {
      scrollToBottom(true)
    }
  }, [lastMessageId])

  // Client-side auto-sync function
  const refreshMessagesAndChats = useCallback(async () => {
    try {
      const [chatsRes, messagesRes] = await Promise.all([
        supabase
          .from('whatsapp_chats')
          .select('*')
          .order('last_message_at', { ascending: false }),
        supabase
          .from('whatsapp_messages')
          .select('*')
          .order('created_at', { ascending: true })
      ])

      if (chatsRes.data) {
        setChats(chatsRes.data as Chat[])
      }
      if (messagesRes.data) {
        setMessages(prev => {
          const incoming = messagesRes.data as Message[]
          // Preserve any optimistic outbound messages that are still sending
          const tempOutbounds = prev.filter(m => m.id.startsWith('temp-'))
          const merged = [...incoming]
          for (const temp of tempOutbounds) {
            if (!merged.some(m => m.body === temp.body && m.chat_id === temp.chat_id)) {
              merged.push(temp)
            }
          }
          return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        })
      }
    } catch (err) {
      console.error('[ValisChat sync error]:', err)
    }
  }, [supabase])

  // Realtime subscription + Auto-sync fallback
  useEffect(() => {
    const channelName = `valischat_stream_${Date.now()}`
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_messages' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new as Message
          setMessages(prev => {
            // Evitar duplicados por ID
            if (prev.some(m => m.id === newMsg.id)) return prev

            // Si es saliente, reemplazar el mensaje temporal optimista
            if (newMsg.direction === 'outbound') {
              const pendingIdx = prev.findIndex(
                m => m.id.startsWith('temp-') && m.chat_id === newMsg.chat_id && m.body === newMsg.body
              )
              if (pendingIdx !== -1) {
                const copy = [...prev]
                copy[pendingIdx] = newMsg
                return copy
              }
            }

            return [...prev, newMsg]
          })
          // Actualizar hora del chat en la lista
          setChats(prev => prev.map(c => c.id === newMsg.chat_id ? { ...c, last_message_at: newMsg.created_at } : c))
        } else if (payload.eventType === 'UPDATE') {
          const updatedMsg = payload.new as Message
          setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setChats(prev => [payload.new as Chat, ...prev.filter(c => c.id !== payload.new.id)])
        } else if (payload.eventType === 'UPDATE') {
          setChats(prev => {
            const newChats = prev.map(c => c.id === payload.new.id ? payload.new as Chat : c);
            return newChats.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
          })
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'valischat_agent_config' }, (payload: any) => {
        if (payload.new && typeof payload.new.is_active === 'boolean') {
          setIsGlobalBotActive(payload.new.is_active)
        }
        if (payload.new && payload.new.mode) {
          setAgentMode(payload.new.mode)
        }
      })
      .subscribe((status: string, err: any) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[ValisChat Realtime]:', status, err)
          refreshMessagesAndChats()
        }
      })

    // Sincronización continua de respaldo cada 3 segundos (para fluidez total sin recargar página)
    const pollInterval = setInterval(() => {
      refreshMessagesAndChats()
    }, 3000)

    // Sincronización inmediata al volver a la pestaña o desbloquear celular
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshMessagesAndChats()
      }
    }
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', refreshMessagesAndChats)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', refreshMessagesAndChats)
      supabase.removeChannel(channel)
    }
  }, [supabase, refreshMessagesAndChats])

  const handleSelectChat = async (chatId: string) => {
    setActiveChatId(chatId)
    const chat = chats.find(c => c.id === chatId)
    if (chat && chat.unread_count > 0) {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread_count: 0 } : c))
      await markChatAsRead(chatId)
    }
  }

  // Toggle Global Bot
  const handleToggleGlobalBot = async () => {
    if (isTogglingGlobal) return
    setIsTogglingGlobal(true)
    const nextState = !isGlobalBotActive
    setIsGlobalBotActive(nextState)
    try {
      await toggleGlobalBot(nextState)
    } finally {
      setIsTogglingGlobal(false)
    }
  }

  // Toggle Bot for this specific Chat
  const handleToggleChatBot = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat || togglingChatId === chatId) return

    const currentChatBotActive = chat.is_bot_active ?? true
    const nextState = !currentChatBotActive

    // Optimistic local update
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_bot_active: nextState } : c))
    setTogglingChatId(chatId)
    try {
      await toggleChatBot(chatId, nextState)
    } finally {
      setTogglingChatId(null)
    }
  }

  // Toggle Agent Mode (Autonomous vs Copilot)
  const handleToggleAgentMode = async () => {
    if (isTogglingMode) return
    setIsTogglingMode(true)
    const nextMode = agentMode === 'autonomous' ? 'copilot' : 'autonomous'
    setAgentMode(nextMode)
    try {
      await toggleAgentMode(nextMode)
    } finally {
      setIsTogglingMode(false)
    }
  }

  // Generate AI Suggestion (Draft in Input)
  const handleGenerateAiSuggestion = async () => {
    if (!activeChatId || isGeneratingAi || isSending) return
    setIsGeneratingAi(true)
    setAiStatusMsg('Analizando conversación con IA...')
    try {
      const res = await generateAgentReplyForChat(activeChatId)
      if (res.success && res.reply) {
        setInputText(res.reply)
        setAiLatency(res.latencyMs ? Number((res.latencyMs / 1000).toFixed(2)) : null)
        setAiStatusMsg(`Sugerencia lista en ${((res.latencyMs || 800) / 1000).toFixed(1)}s con datos de Supabase.`)
        setTimeout(() => setAiStatusMsg(null), 5000)
      } else {
        setAiStatusMsg(res.error || 'No se pudo generar sugerencia')
        setTimeout(() => setAiStatusMsg(null), 4000)
      }
    } catch (err: any) {
      setAiStatusMsg('Error de conexión con el agente')
      setTimeout(() => setAiStatusMsg(null), 4000)
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // Instant Auto-Reply with AI (Generate & Send)
  const handleAutoReplyWithAi = async () => {
    if (!activeChatId || isAutoReplying || isSending) return
    setIsAutoReplying(true)
    setAiStatusMsg('Generando y enviando respuesta a WhatsApp...')
    try {
      const res = await triggerAgentReplyAndSend(activeChatId)
      if (res.success && res.reply) {
        setAiLatency(res.latencyMs ? Number((res.latencyMs / 1000).toFixed(2)) : null)
        setAiStatusMsg(`¡Respuesta de IA enviada en ${((res.latencyMs || 800) / 1000).toFixed(1)}s!`)
        setTimeout(() => setAiStatusMsg(null), 5000)
      } else {
        setAiStatusMsg(res.error || 'Error al responder con IA')
        setTimeout(() => setAiStatusMsg(null), 4000)
      }
    } catch (err: any) {
      setAiStatusMsg('Error de conexión al enviar respuesta')
      setTimeout(() => setAiStatusMsg(null), 4000)
    } finally {
      setIsAutoReplying(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeChatId || isSending) return

    const textToSend = inputText.trim()
    const tempId = `temp-${Date.now()}`
    const newMessage: Message = {
      id: tempId,
      chat_id: activeChatId,
      body: textToSend,
      direction: 'outbound',
      status: 'sending',
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setIsSending(true)

    const res = await sendWhatsAppMessage(activeChatId, textToSend)
    setIsSending(false)

    if (!res.success) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed', body: `${m.body} (Error: ${res.error})` } : m))
    } else if (res.message) {
      setMessages(prev => {
        const alreadyExists = prev.some(m => m.id === res.message.id)
        if (alreadyExists) {
          return prev.filter(m => m.id !== tempId)
        }
        return prev.map(m => m.id === tempId ? (res.message as Message) : m)
      })
    }
  }

  const filteredChats = chats.filter(c => 
    c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone_number.includes(searchQuery)
  )

  const isCurrentChatBotActive = (activeChat?.is_bot_active ?? true) && isGlobalBotActive

  return (
    <div className="flex w-full h-full border-r border-white/10 bg-[#090a0f] relative z-10">
      
      {/* Sidebar - Chats List */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#090a0f] z-10 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Top Header with Title, Count, and Global Bot Button */}
        <div className="p-3.5 bg-[#121c27] flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-white/5">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white text-base tracking-tight">Conversaciones</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
              {chats.length}
            </span>

            {/* BOTÓN GENERAL AL LADO DEL NÚMERO */}
            <button
              type="button"
              onClick={handleToggleGlobalBot}
              disabled={isTogglingGlobal}
              title={isGlobalBotActive ? "Pausar bot en todas las conversaciones (Tomar mando global)" : "Reactivar bot globalmente"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer select-none ${
                isGlobalBotActive 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-sm shadow-emerald-500/10'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 shadow-sm shadow-amber-500/10'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isGlobalBotActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <Bot className="w-3.5 h-3.5" />
              <span>{isGlobalBotActive ? 'Bot Activo' : 'Bot Pausado'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#090a0f]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar un chat..." 
              className="w-full bg-[#121c27] text-base md:text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 border border-white/5 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Chats List Stream */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs mt-10">
              <Phone className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No hay mensajes aún.</p>
              <p className="text-[11px] mt-1">Los mensajes de WhatsApp aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            filteredChats.map(chat => {
              const lastMsg = messages.filter(m => m.chat_id === chat.id).pop()
              const time = format(new Date(chat.last_message_at), 'HH:mm')
              const isSelected = chat.id === activeChatId
              const chatBotPaused = (chat.is_bot_active === false) || !isGlobalBotActive

              return (
                <div 
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer border-b border-white/5 transition-colors ${
                    isSelected ? 'bg-[#182330]' : 'hover:bg-[#121c27]/60'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-white/10 shrink-0 relative">
                    {chat.contact_name.charAt(0).toUpperCase()}
                    {/* Bot status dot indicator on avatar */}
                    <div 
                      title={chatBotPaused ? 'Bot Pausado en este chat (Modo Humano)' : 'Bot IA Activo'}
                      className={`w-3 h-3 rounded-full border-2 border-[#090a0f] absolute -bottom-0.5 -right-0.5 ${
                        chatBotPaused ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <h3 className="font-bold text-white text-xs truncate">{chat.contact_name}</h3>
                        {chatBotPaused && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shrink-0">
                            Manual
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{time}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate pr-2">
                        {lastMsg ? (
                          <>
                            {lastMsg.direction === 'outbound' && <span className="text-gray-500 mr-1">Tú:</span>}
                            {lastMsg.body}
                          </>
                        ) : (
                          <span className="italic text-gray-600">Sin mensajes</span>
                        )}
                      </p>
                      {chat.unread_count > 0 && (
                        <span className="bg-emerald-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png')] bg-repeat relative h-full min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="absolute inset-0 bg-[#090a0f]/90 z-0 pointer-events-none"></div>

        {activeChatId && activeChat ? (
          <>
            {/* Top Chat Header with Contact Info & INDIVIDUAL BOT TOGGLE BUTTON */}
            <div className="p-3 pt-[max(0.75rem,env(safe-area-inset-top))] bg-[#121c27] flex items-center justify-between z-10 border-b border-white/5 sticky top-0 shadow-sm shrink-0">
              
              {/* Left Contact Info & Back to All Chats Button */}
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <button 
                  type="button"
                  onClick={() => setActiveChatId(null)} 
                  className="text-emerald-400 hover:text-white hover:bg-emerald-500/20 px-2.5 py-1.5 -ml-1 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border border-emerald-500/30 active:scale-95 bg-emerald-500/10 shadow-sm"
                  title="Volver a lista de conversaciones"
                  aria-label="Volver a lista de conversaciones"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">Conversaciones</span>
                </button>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-white/10 relative shrink-0">
                  {activeChat.contact_name.charAt(0).toUpperCase()}
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-[#121c27] absolute -bottom-0.5 -right-0.5 ${
                    isCurrentChatBotActive ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm truncate">{activeChat.contact_name}</h3>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-400 truncate">{activeChat.phone_number}</p>
                </div>
              </div>

              {/* Right Controls: BOTÓN PARA PAUSAR BOT Y MODO */}
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                {/* Selector de Modo: Autónomo 24/7 vs Copiloto */}
                {isCurrentChatBotActive && (
                  <button
                    type="button"
                    onClick={handleToggleAgentMode}
                    disabled={isTogglingMode}
                    title={agentMode === 'autonomous' ? "Modo Autónomo 24/7 activo: El bot responde automáticamente a los mensajes entrantes. Clic para cambiar a modo Copiloto (solo sugerencias)." : "Modo Copiloto activo: El bot solo sugiere respuestas al operador. Clic para cambiar a modo Autónomo 24/7."}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-all cursor-pointer select-none"
                  >
                    {agentMode === 'autonomous' ? (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline text-[11px] font-medium text-amber-300">Auto 24/7</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline text-[11px] font-medium text-emerald-300">Copiloto</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleChatBot(activeChat.id)}
                  disabled={togglingChatId === activeChat.id}
                  title={isCurrentChatBotActive ? "Pausar bot en esta conversación para tomar el mando como humano" : "Reactivar bot para que vuelva a responder"}
                  className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm select-none ${
                    isCurrentChatBotActive
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                  }`}
                >
                  {isCurrentChatBotActive ? (
                    <>
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Bot IA Activo</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                        Pausar
                      </span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-amber-300" />
                      <span className="hidden sm:inline text-amber-300">Manual (Tú)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 font-semibold">
                        Reanudar
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar z-10 overscroll-contain">
              
              {/* Human Mode / Paused Notification Banner */}
              {!isCurrentChatBotActive && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300 backdrop-blur-md mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {!isGlobalBotActive 
                        ? 'El Bot está pausado globalmente. Tienes el mando en todas las conversaciones.' 
                        : 'Bot pausado en esta conversación. Tienes el mando manual para responder directamente al cliente.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleChatBot(activeChat.id)}
                    className="text-[11px] font-bold underline hover:text-amber-200 ml-2 shrink-0 cursor-pointer"
                  >
                    Reanudar Bot
                  </button>
                </div>
              )}

              <div className="text-center mb-4">
                <span className="bg-[#121c27]/80 backdrop-blur-md text-gray-400 text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full border border-white/5">
                  Hoy
                </span>
              </div>
              
              {activeMessages.map((msg, i) => {
                const isOutbound = msg.direction === 'outbound'
                const msgTime = format(new Date(msg.created_at), 'HH:mm')
                
                return (
                  <div key={msg.id || i} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOutbound 
                        ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md' 
                        : 'bg-[#182330] text-gray-100 rounded-tl-sm shadow-md border border-white/5'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isOutbound ? 'text-emerald-200' : 'text-gray-400'}`}>
                        <span className="text-[9px]">{msgTime}</span>
                        {isOutbound && (
                          <span>
                            {msg.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                            {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-gray-300" />}
                            {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-sky-300" />}
                            {msg.status === 'sending' && <Loader2 className="w-3 h-3 animate-spin" />}
                            {msg.status === 'failed' && <span className="text-red-300 text-[10px]">Error</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar & AI Copilot Action Bar */}
            <div className="bg-[#121c27] z-10 border-t border-white/5 shadow-lg shrink-0">
              {/* Quick AI Bar */}
              <div className="px-3 py-1.5 md:py-2 flex items-center justify-between border-b border-white/5 bg-[#0b121a]/80 text-xs overflow-x-auto no-scrollbar gap-2">
                <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copiloto IA</span>
                  </div>
                  {aiLatency && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono shrink-0">
                      ⚡ {aiLatency}s
                    </span>
                  )}
                  {aiStatusMsg && (
                    <span className="text-[11px] text-gray-300 italic truncate animate-pulse">
                      {aiStatusMsg}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                  {/* Botón: Sugerir con IA (Borrador en el input) */}
                  <button
                    type="button"
                    onClick={handleGenerateAiSuggestion}
                    disabled={isGeneratingAi || isAutoReplying || isSending}
                    className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
                    title="Analizar conversación con IA y base de datos para redactar un borrador en el cuadro de texto"
                  >
                    {isGeneratingAi ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Sugerir<span className="hidden sm:inline"> con IA</span></span>
                  </button>

                  {/* Botón: Responder con IA (Directo a WhatsApp) */}
                  <button
                    type="button"
                    onClick={handleAutoReplyWithAi}
                    disabled={isGeneratingAi || isAutoReplying || isSending}
                    className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/15 transition-all disabled:opacity-40 cursor-pointer shrink-0"
                    title="Generar respuesta inteligente y enviarla directamente al cliente por WhatsApp"
                  >
                    {isAutoReplying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>{isAutoReplying ? 'Enviando...' : <>Responder<span className="hidden sm:inline"> con IA</span></>}</span>
                  </button>
                </div>
              </div>

              {/* Form Input */}
              <form 
                onSubmit={handleSendMessage} 
                className="p-2.5 md:p-3 flex items-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollToBottom(true)
                    }, 120)
                  }}
                  placeholder={
                    !isCurrentChatBotActive 
                      ? "Escribe como operador humano (o usa Sugerir)..." 
                      : "Escribe un mensaje o pulsa Sugerir con IA..."
                  }
                  disabled={isSending || isAutoReplying}
                  className="flex-1 bg-[#090a0f] text-base md:text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 border border-white/5 placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending || isAutoReplying}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black rounded-xl font-bold transition-colors shrink-0 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
              <Phone className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">ValisChat para WhatsApp</h2>
            <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
              Selecciona un chat de la lista izquierda para comenzar a enviar mensajes directamente a los clientes de tu ecosistema.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conexión cifrada a Meta activa</span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
