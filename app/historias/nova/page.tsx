import { redirect } from "next/navigation"
import { StoryForm } from "@/components/story-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function NovaHistoriaPage() {
  // Verificar se o usuário está autenticado
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirecionar para a página de login se não estiver autenticado
  if (!session) {
    redirect("/login?redirectTo=/historias/nova")
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Compartilhar História</h1>
      <StoryForm />
    </div>
  )
}
