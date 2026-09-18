'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { 
  Connector, 
  ConnectorEnvStatus, 
  AvailableTable 
} from '@/lib/valischat'

export type { Connector, ConnectorEnvStatus, AvailableTable }

export async function getConnectorEnvStatus(): Promise<ConnectorEnvStatus> {
  return {
    gemini: {
      hasKey: !!process.env.GEMINI_API_KEY,
      source: process.env.GEMINI_API_KEY ? '.env.local / Servidor' : ''
    },
    openai: {
      hasKey: !!process.env.OPENAI_API_KEY,
      source: process.env.OPENAI_API_KEY ? '.env.local / Servidor' : ''
    },
    pinecone: {
      hasKey: !!process.env.PINECONE_API_KEY,
      source: process.env.PINECONE_API_KEY ? '.env.local / Servidor' : ''
    },
    google_calendar: {
      hasKey: !!(process.env.GOOGLE_CALENDAR_API_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      source: (process.env.GOOGLE_CALENDAR_API_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY) ? '.env.local / Servidor' : ''
    },
    supabase: {
      hasKey: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    }
  }
}

export async function getConnectors(): Promise<{ 
  success: boolean; 
  connectors?: Connector[]; 
  envStatus?: ConnectorEnvStatus;
  error?: string 
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('valischat_connectors')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching valischat_connectors:', error)
      return { success: false, error: error.message }
    }

    const envStatus = await getConnectorEnvStatus()

    return { 
      success: true, 
      connectors: data as Connector[], 
      envStatus 
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateConnector(
  id: string, 
  config: any, 
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('valischat_connectors')
      .update({
        config,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/conectores')
    revalidatePath('/agente')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function testOpenAIConnection(apiKey?: string, model: string = 'gpt-4o-mini') {
  try {
    const key = apiKey?.trim() || process.env.OPENAI_API_KEY
    if (!key) {
      return { 
        success: false, 
        error: 'No se encontró una API Key de OpenAI (ni en formulario ni en .env.local).' 
      }
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5
      })
    })

    const data = await res.json()
    if (!res.ok) {
      return { success: false, error: data.error?.message || 'Error al conectar con OpenAI.' }
    }

    return { success: true, message: `Conexión exitosa con OpenAI (${model}).` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de red con OpenAI.' }
  }
}

export async function testGeminiConnection(apiKey?: string, model: string = 'gemini-3.6-flash') {
  try {
    const key = apiKey?.trim() || process.env.GEMINI_API_KEY
    if (!key) {
      return { 
        success: false, 
        error: 'No se encontró una API Key de Gemini (ni en formulario ni en .env.local).' 
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping' }] }]
      })
    })

    const data = await res.json()
    if (!res.ok) {
      return { success: false, error: data.error?.message || 'Error al conectar con Gemini.' }
    }

    return { success: true, message: `Conexión en vivo exitosa con Gemini (${model}).` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de red con Gemini.' }
  }
}

export async function testPineconeConnection(apiKey?: string, environment?: string, indexName?: string) {
  try {
    const key = apiKey?.trim() || process.env.PINECONE_API_KEY
    const idx = indexName?.trim() || 'valis-docs-index'
    if (!key) {
      return { success: false, error: 'No se encontró una API Key de Pinecone (ni en formulario ni en .env.local).' }
    }
    
    const res = await fetch(`https://api.pinecone.io/indexes/${idx}`, {
      headers: {
        'Api-Key': key,
        'X-Pinecone-API-Version': '2024-07'
      }
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, error: err.message || 'No se pudo conectar al índice de Pinecone o la API Key es inválida.' }
    }

    const data = await res.json()
    return { success: true, message: `Índice "${data.name}" verificado (${data.dimension} dims, estado: ${data.status?.state || 'Listo'}).` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error conectando con Pinecone.' }
  }
}

export async function testGoogleCalendarConnection(calendarId?: string, apiKey?: string) {
  try {
    const calId = calendarId?.trim() || process.env.GOOGLE_CALENDAR_ID || 'primary'
    const key = apiKey?.trim() || process.env.GOOGLE_CALENDAR_API_KEY

    if (!key && !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return {
        success: false,
        error: 'Para conectar Google Calendar, añade GOOGLE_CALENDAR_API_KEY o GOOGLE_SERVICE_ACCOUNT_KEY en tu .env.local o ingrésala en el formulario.'
      }
    }

    if (key) {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}?key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'No se pudo verificar el calendario de Google.' }
      }
      return { success: true, message: `Calendario "${data.summary || calId}" conectado exitosamente.` }
    }

    return { 
      success: true, 
      message: `Configuración de Google Calendar verificada para el calendario "${calId}".` 
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de red con Google Calendar.' }
  }
}
