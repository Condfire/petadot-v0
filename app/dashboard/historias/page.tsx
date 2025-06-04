import Link from "next/link"
import { getUserPetStories } from "@/app/actions/pet-stories-actions"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardStoriesClientWrapper } from "@/components/dashboard-stories-client-wrapper"

export const dynamic = "force-dynamic"

export default async function DashboardHistoriasPage() {
  // Verificar se o usuário está autenticado
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/dashboard/historias")
  }

  // Buscar histórias do usuário
  const { success, data: stories, error } = await getUserPetStories()

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Histórias</h1>
          <p className="text-muted-foreground mt-2">Gerencie as histórias que você compartilhou</p>
        </div>

        <Button asChild className="mt-4 md:mt-0">
          <Link href="/historias/nova">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova História
          </Link>
        </Button>
      </div>

      <DashboardStoriesClientWrapper stories={stories} error={error} />
    </div>
  )
}
