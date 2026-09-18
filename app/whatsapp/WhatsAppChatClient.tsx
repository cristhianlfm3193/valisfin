'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendWhatsAppMessage, markChatAsRead } from '@/app/actions/whatsapp'
import { Send, Phone, Search, MoreVertical, Check, CheckCheck, Loader2, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

type Chat = {
  id: string
  phone_number: string
  contact_name: string
  last_message_at: string
  unread_count: number
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
  initialMessages 
}: { 
  initialChats: Chat[], 
  initialMessages: Message[] 
}) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  const activeChat = chats.find(c => c.id === activeChatId)
  const activeMessages = messages.filter(m => m.chat_id === activeChatId)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeMessages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel('whatsapp_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_messages' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as Message])
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setChats(prev => [payload.new as Chat, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setChats(prev => {
            const newChats = prev.map(c => c.id === payload.new.id ? payload.new as Chat : c);
            return newChats.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleSelectChat = async (chatId: string) => {
    setActiveChatId(chatId)
    const chat = chats.find(c => c.id === chatId)
    if (chat && chat.unread_count > 0) {
      // Mark as read locally and in DB
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread_count: 0 } : c))
      await markChatAsRead(chatId)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeChatId) return

    const tempId = `temp-${Date.now()}`
    const newMessage: Message = {
      id: tempId,
      chat_id: activeChatId,
      body: inputText,
      direction: 'outbound',
      status: 'sending',
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setIsSending(true)

    const res = await sendWhatsAppMessage(activeChatId, newMessage.body)
    setIsSending(false)

    if (!res.success) {
      // Mark failed
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed', body: `${m.body} (Error: ${res.error})` } : m))
    }
  }

  return (
    <div className="flex w-full h-full border-r border-white/10 bg-[#090a0f] relative z-10">
      
      {/* Sidebar - Chats List */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/5 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-[#121c27] flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center">
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">ValisChat</h2>
              <p className="text-xs text-emerald-400 font-medium">WhatsApp Business</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#090a0f]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar un chat..." 
              className="w-full bg-[#121c27] text-sm text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 border border-white/5 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chats.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm mt-10">
              <Phone className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No hay mensajes aún.</p>
              <p className="text-xs mt-1">Los mensajes de WhatsApp aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            chats.map(chat => {
              const lastMsg = messages.filter(m => m.chat_id === chat.id).pop()
              const time = format(new Date(chat.last_message_at), 'HH:mm')
              
              return (
                <div 
                  key={chat.id} 
                  onClick={() => handleSelectChat(chat.id)}
                  className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors mb-1 ${activeChatId === chat.id ? 'bg-[#121c27] border border-white/5' : 'hover:bg-[#121c27]/50 border border-transparent'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-emerald-400 font-bold text-lg border border-white/10">
                    {chat.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-white truncate text-sm">{chat.contact_name}</h3>
                      <span className="text-[10px] text-gray-500 shrink-0">{time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate pr-2">
                        {lastMsg?.direction === 'outbound' && <span className="mr-1">Tú:</span>}
                        {lastMsg?.body || 'Nuevo chat'}
                      </p>
                      {chat.unread_count > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
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
      <div className={`flex-1 flex flex-col bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png')] bg-repeat relative ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {/* Overlay para oscurecer el fondo tipo WhatsApp */}
        <div className="absolute inset-0 bg-[#090a0f]/90 z-0"></div>

        {activeChatId && activeChat ? (
          <>
            <div className="p-3 bg-[#121c27] flex items-center justify-between z-10 border-b border-white/5 sticky top-0 shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChatId(null)} className="md:hidden text-gray-400 hover:text-white p-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-white/10">
                  {activeChat.contact_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{activeChat.contact_name}</h3>
                  <p className="text-xs text-gray-400">{activeChat.phone_number}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white p-2">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 z-10 custom-scrollbar flex flex-col">
              <div className="text-center mb-6">
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
                        : 'bg-[#121c27] text-gray-100 rounded-tl-sm border border-white/5 shadow-md'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isOutbound ? 'text-emerald-200' : 'text-gray-500'}`}>
                        <span className="text-[9px] font-medium">{msgTime}</span>
                        {isOutbound && (
                          <CheckCheck className={`w-3 h-3 ${msg.status === 'read' ? 'text-blue-400' : ''}`} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-[#121c27] border-t border-white/5 z-10">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-end max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e as any)
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    className="w-full bg-[#090a0f] text-white rounded-xl pl-4 pr-4 py-3 focus:outline-none border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none max-h-32 text-sm placeholder-gray-500 custom-scrollbar"
                    rows={1}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || isSending}
                  className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10">
            <div className="w-20 h-20 bg-[#121c27] rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/5">
              <Phone className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">ValisChat para WhatsApp</h2>
            <p className="text-gray-400 max-w-sm text-sm">Selecciona un chat de la lista izquierda para comenzar a enviar mensajes directamente a los clientes de tu ecosistema.</p>
            <div className="mt-8 flex items-center gap-2 text-xs text-gray-500 bg-[#121c27]/50 px-4 py-2 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Conexión cifrada a Meta activa
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
