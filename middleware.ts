import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { isUuid } from "./lib/slug-utils"

// Lista de rotas especiais que não devem ser processadas pelo middleware de slug
const SPECIAL_ROUTES = ["/cadastrar", "/editar", "/excluir", "/novo"]

export async function middleware(request: NextRequest) {
  // Ignorar a rota de cadastro de pets para adoção
  if (request.nextUrl.pathname === "/cadastrar-pet-adocao") {
    return NextResponse.next()
  }

  // Permitir redirecionamento para rotas especiais
  for (const route of SPECIAL_ROUTES) {
    if (request.nextUrl.pathname.includes(route)) {
      return NextResponse.next()
    }
  }

  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Verificar se a rota é para uma entidade pública
  const url = request.nextUrl.pathname

  // Verificar se a URL contém um ID UUID em vez de um slug
  if (
    (url.startsWith("/adocao/") ||
      url.startsWith("/perdidos/") ||
      url.startsWith("/encontrados/") ||
      url.startsWith("/ongs/") ||
      url.startsWith("/eventos/") ||
      url.startsWith("/parceiros/")) &&
    !url.includes("/dashboard") &&
    !url.includes("/cadastrar") &&
    !url.includes("/edit") &&
    !url.includes("/delete")
  ) {
    // Extrair o ID ou slug da URL
    const segments = url.split("/")
    const idOrSlug = segments[2]

    // Se for um UUID, buscar o slug correspondente e redirecionar
    if (idOrSlug && isUuid(idOrSlug)) {
      try {
        let table = ""
        if (url.startsWith("/adocao/")) {
          table = "pets"
        } else if (url.startsWith("/perdidos/")) {
          table = "pets_lost"
        } else if (url.startsWith("/encontrados/")) {
          table = "pets_found"
        } else if (url.startsWith("/ongs/")) {
          table = "ongs"
        } else if (url.startsWith("/eventos/")) {
          table = "events"
        } else if (url.startsWith("/parceiros/")) {
          table = "partners"
        }

        if (table) {
          const { data } = await supabase.from(table).select("slug").eq("id", idOrSlug).single()

          if (data?.slug) {
            // Construir a nova URL com o slug
            const newUrl = url.replace(idOrSlug, data.slug)
            return NextResponse.redirect(new URL(newUrl, request.url))
          }
        }
      } catch (error) {
        console.error("Erro ao buscar slug:", error)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    "/adocao/:path*",
    "/perdidos/:path*",
    "/encontrados/:path*",
    "/ongs/:path*",
    "/eventos/:path*",
    "/parceiros/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/cadastrar-pet-adocao",
  ],
}
