import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function GET(req: Request) {
  if (!BOT_TOKEN) {
    return NextResponse.json({
      ok: false,
      error: 'TELEGRAM_BOT_TOKEN no está definido en .env.local',
    }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const webhookUrl = searchParams.get('url');

  try {
    // 1. Obtener información del Bot
    const meRes = await fetch(`${TELEGRAM_API}/getMe`);
    const meData = await meRes.json();

    // 2. Si se pasó ?url=https://..., registrar el webhook
    let setWebhookResult = null;
    if (webhookUrl) {
      const setRes = await fetch(`${TELEGRAM_API}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl }),
      });
      setWebhookResult = await setRes.json();
    }

    // 3. Obtener el estado actual del webhook
    const hookInfoRes = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const hookInfo = await hookInfoRes.json();

    return NextResponse.json({
      ok: true,
      bot: meData.result,
      webhookActual: hookInfo.result,
      resultadoConfiguracion: setWebhookResult,
      envDiagnostics: {
        hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasSecretKey: !!(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_KEY),
        supabaseEnvKeysFound: Object.keys(process.env).filter(k => k.toUpperCase().includes('SUPABASE') || k.toUpperCase().includes('SERVICE_ROLE') || k.toUpperCase().includes('SECRET')),
      },
      instrucciones: {
        registrarWebhook: 'Para registrar el webhook cuando despliegues en Vercel o uses ngrok, llama a: GET /api/telegram/setup?url=https://tu-dominio.com/api/telegram',
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
    }, { status: 500 });
  }
}
