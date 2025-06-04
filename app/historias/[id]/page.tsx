import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { ArrowLeft } from "lucide-react"
import { getPetStoryById } from "@/app/actions/pet-stories-actions"
import { Button } from "@/components/ui/button"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { StoryDetailClientWrapper } from "@/components/story-detail-client-wrapper"

export const dynamic = "force-dynamic"

export default async function HistoriaDetalhesPage({ params }: { params: { id: string } }) {
  // Buscar história
  const { success, data: story, error } = await getPetStoryById(params.id)

  // Verificar se a história existe
  if (!success || !story) {
    notFound()
  }

  // Verificar se o usuário está autenticado
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthenticated = !!session
  const isAuthor = session?.user?.id === story.user_id

  // Verificar se o usuário é admin
  let isAdmin = false
  if (isAuthenticated) {
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

    isAdmin = !!userData?.is_admin
  }

  // Formatar data
  const createdAt = new Date(story.created_at)
  const formattedDate = format(createdAt, "d 'de' MMMM 'de' yyyy", { locale: pt })

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/historias">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para histórias
          </Link>
        </Button>
      </div>

      <StoryDetailClientWrapper
        story={story}
        isAuthenticated={isAuthenticated}
        isAuthor={isAuthor}
        isAdmin={isAdmin}
        formattedDate={formattedDate}
        createdAt={createdAt}
      />
    </div>
  )
}
