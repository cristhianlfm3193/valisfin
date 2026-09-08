import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Middleware crash prevented: Missing Supabase Environment Variables');
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refresca el token de autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no hay usuario y no estamos en la página de login, redirigir a login
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Validar si el usuario está autorizado
  const allowedEmails = ['cristhianf3193@gmail.com', 'jenniferyohana.yco@gmail.com', 'cristhianlf3193@gmail.com'];
  
  if (user && !allowedEmails.includes(user.email || '')) {
    // Si no está autorizado y no está en /unauthorized o /auth, redirigir a unauthorized
    if (!request.nextUrl.pathname.startsWith('/unauthorized') && !request.nextUrl.pathname.startsWith('/auth')) {
      // Opcional: Cerrar sesión inmediatamente (el cliente también debe hacerlo, pero lo bloqueamos aquí)
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // Validar rol de usuario si el usuario existe
  if (user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
    // Buscar perfil en base de datos para obtener el rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Lógica opcional: Si necesitas proteger rutas específicas según rol
    // Por ejemplo, si tienes una ruta /admin y el rol no es administrador:
    // if (request.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'administrador') {
    //   const url = request.nextUrl.clone()
    //   url.pathname = '/' // redirigir al home o página sin acceso
    //   return NextResponse.redirect(url)
    // }

    // En este caso el requerimiento fue validar el rol, lo dejamos disponible
    // o puedes establecer una regla si es necesario.
  }

  // Si hay usuario y está en la página de login, redirigir al inicio
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
