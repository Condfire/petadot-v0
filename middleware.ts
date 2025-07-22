import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin", "/ongs/dashboard"]
  const adminRoutes = ["/admin"]
  const publicRoutes = ["/", "/login", "/register", "/perdidos", "/encontrados", "/adocao", "/sobre", "/contato"]

  const { pathname } = req.nextUrl

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin access for admin routes
  if (isAdminRoute && session) {
    try {
      const { data: userData } = await supabase.from("users").select("type").eq("id", session.user.id).single()

      const userType = userData?.type || session.user.user_metadata?.type || "regular"

      if (userType !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    } catch (error) {
      console.error("Error checking admin access:", error)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
