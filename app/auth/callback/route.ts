import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Validar correos permitidos inmediatamente
      const { data: { session } } = await supabase.auth.getSession()
      const allowedEmails = ['cristhianf3193@gmail.com', 'jenniferyohana.yco@gmail.com', 'cristhianlf3193@gmail.com']
      
      if (session?.user?.email && !allowedEmails.includes(session.user.email)) {
        // Si no está permitido, cerramos la sesión de inmediato y lo mandamos a la pantalla de denegado
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/unauthorized`)
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
