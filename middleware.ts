import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Redirecionar /admin para /admin-alt
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin-alt")) {
    const newUrl = request.nextUrl.pathname.replace("/admin", "/admin-alt")
    return NextResponse.redirect(new URL(newUrl, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
