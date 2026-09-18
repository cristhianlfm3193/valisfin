'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Connector = {
  id: string
  provider: string
  name: string
  config: any
  is_active: boolean
  updated_at: string
}

export async function getConnectors(): Promise<{ success: boolean; connectors?: Connector[]; error?: string }> {
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

    return { success: true, connectors: data as Connector[] }
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

export async function testOpenAIConnection(apiKey: string, model: string = 'gpt-4o-mini') {
  try {
    if (!apiKey) return { success: false, error: 'Debes proporcionar una API Key de OpenAI.' }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
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

    return { success: true, message: `Conexión exitosa con modelo ${model}.` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de red con OpenAI.' }
  }
}

export async function testGeminiConnection(apiKey?: string, model: string = 'gemini-2.0-flash') {
  try {
    const key = apiKey?.trim() || process.env.GEMINI_API_KEY
    if (!key) return { success: false, error: 'No se encontró una API Key de Gemini configurada.' }

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

    return { success: true, message: `Conexión exitosa con modelo ${model}.` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de red con Gemini.' }
  }
}

export async function testPineconeConnection(apiKey: string, environment: string, indexName: string) {
  try {
    if (!apiKey) return { success: false, error: 'Debes ingresar una API Key de Pinecone.' }
    
    // Test pinecone index describe endpoint
    const res = await fetch(`https://api.pinecone.io/indexes/${indexName.trim()}`, {
      headers: {
        'Api-Key': apiKey.trim(),
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
