import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { StoriesClientWrapper } from "@/components/stories-client-wrapper"
import { RevalidateButton } from "@/components/revalidate-button"

// Forçar renderização dinâmica para evitar cache
export const dynamic = "force-dynamic"
export const revalidate = 0

interface HistoriasPageProps {
  searchParams: {
    page?: string
  }
}

export default async function HistoriasPage({ searchParams }: HistoriasPageProps) {
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const limit = 9
  const offset = (page - 1) * limit

  // Verificar se o usuário está autenticado
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Verificar se o usuário é admin
  let isAdmin = false
  if (session) {
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()
    isAdmin = !!userData?.is_admin
  }

  // Buscar histórias - usando abordagem direta sem junção
  let stories: any[] = []
  let error: string | null = null
  let totalPages = 0
  let totalCount = 0

  try {
    console.log("Buscando histórias com abordagem direta")

    // Primeiro, buscar as histórias sem a junção
    const {
      data,
      error: fetchError,
      count,
    } = await supabase
      .from("pet_stories")
      .select("*", { count: "exact" })
      .eq("status", "aprovado")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (fetchError) {
      console.error("Erro ao buscar histórias:", fetchError)
      error = "Erro ao buscar histórias: " + fetchError.message
    } else {
      console.log("Histórias encontradas:", data?.length || 0, data)

      // Para cada história, buscar separadamente os dados do usuário
      const storiesWithUsers = await Promise.all(
        (data || []).map(async (story) => {
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("name, avatar_url")
              .eq("id", story.user_id)
              .single()

            if (userError) {
              console.log(`Não foi possível buscar informações do usuário para a história ${story.id}:`, userError)
              return {
                ...story,
                user: { name: "Usuário", avatar_url: null },
              }
            }

            return {
              ...story,
              user: userData,
            }
          } catch (error) {
            console.error(`Erro ao buscar usuário para história ${story.id}:`, error)
            return {
              ...story,
              user: { name: "Usuário", avatar_url: null },
            }
          }
        }),
      )

      stories = storiesWithUsers
      totalCount = count || 0
      totalPages = count ? Math.ceil(count / limit) : 0
    }
  } catch (e) {
    console.error("Erro inesperado ao buscar histórias:", e)
    error = "Ocorreu um erro inesperado ao buscar as histórias"
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórias de Sucesso</h1>
          <p className="text-muted-foreground mt-2">
            Conheça histórias inspiradoras compartilhadas por nossa comunidade
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          {isAdmin && <RevalidateButton path="/historias" label="Atualizar página" />}

          {isAuthenticated && (
            <Button asChild>
              <Link href="/historias/nova">
                <PlusCircle className="mr-2 h-4 w-4" />
                Compartilhar História
              </Link>
            </Button>
          )}
        </div>
      </div>

      <StoriesClientWrapper
        stories={stories}
        error={error}
        totalPages={totalPages}
        currentPage={page}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}
