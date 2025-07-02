import { getPendingPetStories } from "@/app/actions/pet-stories-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StoryCard } from "@/components/story-card"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { StoryModerationActions } from "@/components/story-moderation-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminHistoriasPage() {
  // Verificar se o usuário está autenticado e é admin
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/admin-alt/historias")
  }

  // Verificar se o usuário é admin
  const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

  if (!userData?.is_admin) {
    redirect("/dashboard")
  }

  // Buscar histórias pendentes
  const { success, data: stories, error, message } = await getPendingPetStories()

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Moderação de Histórias</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Histórias Pendentes</CardTitle>
          <CardDescription>Aprove ou rejeite as histórias enviadas pelos usuários</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : message ? (
            <div className="text-center py-8">
              <Alert>
                <InfoIcon className="h-4 w-4 mr-2" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/historias/nova">Criar uma história</Link>
                </Button>
              </div>
            </div>
          ) : stories && stories.length > 0 ? (
            <div className="space-y-6">
              {stories.map((story) => (
                <div key={story.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{story.title}</h3>
                    <StoryModerationActions id={story.id} />
                  </div>

                  <StoryCard story={story} showStatus />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Não há histórias pendentes para moderação no momento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
