import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, UserIcon, ClockIcon, ArrowLeftIcon } from "lucide-react"
import { ModerationActions } from "@/components/moderation-actions"
import { formatDate, formatDateTime } from "@/lib/utils"

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { id } = params

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin-alt/events/" + id)
  }

  // Verificar se o usuário é um administrador
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single()

  if (userError || !user?.is_admin) {
    redirect("/")
  }

  // Buscar detalhes do evento
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*, users(id, name, email, contact)")
    .eq("id", id)
    .single()

  if (eventError || !event) {
    console.error("Erro ao buscar evento:", eventError)
    notFound()
  }

  // Formatar data
  const formattedDate = formatDate(event.start_date) // Usar start_date e a função utilitária

  // Formatar hora de criação
  const createdAt = formatDateTime(event.created_at) // Usar a função utilitária

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin-alt/events">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Evento</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{event.name}</CardTitle>
                  <CardDescription>ID: {event.id}</CardDescription>
                </div>
                <Badge
                  className={
                    event.status === "approved"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : event.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {event.status === "approved" ? "Aprovado" : event.status === "pending" ? "Pendente" : "Rejeitado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative w-full h-64 rounded-md overflow-hidden">
                <Image
                  src={event.image_url || "/placeholder.svg?height=400&width=800&query=pet+event"}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{event.users?.name || "Usuário desconhecido"}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Criado em {createdAt}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Ações de Moderação</h3>
                  <ModerationActions id={event.id} type="event" />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Descrição</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Organizador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Nome</h3>
                <p className="text-muted-foreground">{event.users?.name || "Não informado"}</p>
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">{event.users?.email || "Não informado"}</p>
              </div>
              <div>
                <h3 className="font-medium">Contato</h3>
                <p className="text-muted-foreground">{event.users?.contact || "Não informado"}</p>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/eventos/${event.slug || event.id}`} target="_blank">
                    Ver Evento no Site
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/admin-alt/events/${event.id}/edit`}>Editar Evento</Link>
            </Button>
            <Button variant="destructive" className="w-full" asChild>
              <Link href={`/admin-alt/events/${event.id}/delete`}>Excluir Evento</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
