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

  // Interceptar el código de OAuth si Supabase redirige a una URL no esperada (ej. al Site URL por defecto)
  if (request.nextUrl.searchParams.has('code') && !request.nextUrl.pathname.startsWith('/auth/callback')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  // Si no hay usuario y no estamos en la página de login, redirigir a login
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Validar si el usuario está autorizado mediante la base de datos
  if (user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
    // Buscar perfil en base de datos para obtener el rol y estado
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    // Si no está activo en la base de datos, redirigir a unauthorized
    if (!profile?.is_active) {
      if (!request.nextUrl.pathname.startsWith('/unauthorized')) {
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
    } else {
      // Si ESTÁ activo pero está atrapado en la página de unauthorized, enviarlo al inicio
      if (request.nextUrl.pathname.startsWith('/unauthorized')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }

    // Lógica opcional: Si necesitas proteger rutas específicas según rol
    // Por ejemplo, si tienes una ruta /admin y el rol no es administrador:
    if (request.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'administrador') {
      const url = request.nextUrl.clone()
      url.pathname = '/' 
      return NextResponse.redirect(url)
    }
  }

  // Si hay usuario y está en la página de login, redirigir al inicio
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
