import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getDashboardRoute, isPublicRoute, isAuthRoute } from '@/shared/utils'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check cookie size to prevent HTTP 431
  const cookieHeader = request.headers.get('cookie') || ''
  const cookieSize = new TextEncoder().encode(cookieHeader).length

  if (cookieSize > 6000) {
    // Clear Supabase cookies and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.delete(cookie.name)
      }
    })
    return response
  }

  // Public routes that don't require auth
  const pathname = request.nextUrl.pathname

  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check if user's email is confirmed (for non-public routes)
  // Don't redirect if already on verify-email page to avoid loop
  if (user && !isPublicRoute(pathname) && !user.email_confirmed_at && pathname !== '/verify-email') {
    // User is logged in but email not verified - redirect to verify-email page
    const url = request.nextUrl.clone()
    url.pathname = '/verify-email'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute(pathname)) {
    // Only redirect to dashboard if email is confirmed
    if (user.email_confirmed_at) {
      // Get user profile to redirect to correct dashboard
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const url = request.nextUrl.clone()
      url.pathname = profile?.role ? getDashboardRoute(profile.role) : getDashboardRoute('')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
