import { notFound, redirect } from "next/navigation"
import { StoryForm } from "@/components/story-form"
import { getPetStoryById } from "@/app/actions/pet-stories-actions"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function EditarHistoriaPage({ params }: { params: { id: string } }) {
  console.log("Página de edição de história com ID:", params.id)

  // Verificar se o usuário está autenticado
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirecionar para a página de login se não estiver autenticado
  if (!session) {
    console.log("Usuário não autenticado, redirecionando para login")
    redirect(`/login?redirectTo=/historias/${params.id}/editar`)
  }

  console.log("Usuário autenticado:", session.user.id)

  // Buscar história
  const { success, data: story, error } = await getPetStoryById(params.id)
  console.log("Resultado da busca:", { success, story, error })

  // Verificar se a história existe
  if (!success || !story) {
    console.error("História não encontrada:", error)
    notFound()
  }

  // Verificar se o usuário é o autor da história ou admin
  if (story.user_id !== session.user.id) {
    console.log("Usuário não é o autor, verificando se é admin")

    // Verificar se o usuário é admin
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

    if (!userData?.is_admin) {
      console.log("Usuário não é admin, redirecionando")
      // Redirecionar para a página da história se não for o autor nem admin
      redirect(`/historias/${params.id}`)
    }

    console.log("Usuário é admin, permitindo acesso")
  } else {
    console.log("Usuário é o autor da história")
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Editar História</h1>
      <StoryForm story={story} isEdit />
    </div>
  )
}
