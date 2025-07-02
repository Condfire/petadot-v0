import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Search, Calendar, MapPin, Building2 } from "lucide-react"
import { approveItem, rejectItem } from "@/app/actions"

export const metadata: Metadata = {
  title: "Gerenciar Eventos | PetAdot",
  description: "Painel de administração para gerenciar eventos",
}

export default async function AdminEventsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/events")
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

  // Buscar eventos
  const { data: pendingEvents, error: pendingEventsError } = await supabase
    .from("events")
    .select("*, users!events_user_id_fkey(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const { data: approvedEvents, error: approvedEventsError } = await supabase
    .from("events")
    .select("*, users!events_user_id_fkey(name)")
    .eq("status", "approved")
    .order("start_date", { ascending: true })

  const { data: rejectedEvents, error: rejectedEventsError } = await supabase
    .from("events")
    .select("*, users!events_user_id_fkey(name)")
    .eq("status", "rejected")
    .order("created_at", { ascending: false })

  if (pendingEventsError || approvedEventsError || rejectedEventsError) {
    console.error("Erro ao buscar eventos:", { pendingEventsError, approvedEventsError, rejectedEventsError })
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Eventos</h1>
        <p className="text-red-500">Erro ao carregar eventos.</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gerenciar Eventos</h1>
        <Button asChild variant="outline">
          <Link href="/admin/dashboard">Voltar ao Painel</Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar eventos por nome, local ou ONG..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pendentes ({pendingEvents?.length || 0})</TabsTrigger>
          <TabsTrigger value="approved">Aprovados ({approvedEvents?.length || 0})</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados ({rejectedEvents?.length || 0})</TabsTrigger>
          <TabsTrigger value="all">
            Todos ({(pendingEvents?.length || 0) + (approvedEvents?.length || 0) + (rejectedEvents?.length || 0)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Pendentes de Aprovação</CardTitle>
              <CardDescription>Eventos que aguardam aprovação para serem exibidos na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingEvents && pendingEvents.length > 0 ? (
                <div className="space-y-6">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="border p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-48 h-32 rounded-md overflow-hidden">
                          <Image
                            src={event.image_url || "/placeholder.svg?height=200&width=300&query=pet+event"}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                              <h3 className="font-medium text-lg">{event.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {new Date(event.date).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {event.location}
                              </div>
                              {event.users && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Building2 className="h-3.5 w-3.5 mr-1" />
                                  {event.users.name}
                                </div>
                              )}
                              <div className="mt-2">
                                <Badge variant="outline">
                                  Cadastrado em {new Date(event.created_at).toLocaleDateString("pt-BR")}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4 md:mt-0">
                              <form
                                action={async () => {
                                  "use server"
                                  await approveItem(event.id, "event")
                                }}
                              >
                                <Button type="submit" size="sm" className="gap-1">
                                  <CheckCircle className="h-4 w-4" /> Aprovar
                                </Button>
                              </form>
                              <form
                                action={async () => {
                                  "use server"
                                  await rejectItem(event.id, "event")
                                }}
                              >
                                <Button variant="outline" size="sm" className="gap-1">
                                  <XCircle className="h-4 w-4" /> Rejeitar
                                </Button>
                              </form>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/events/${event.id}`}>Detalhes</Link>
                              </Button>
                            </div>
                          </div>
                          {event.description && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Não há eventos pendentes de aprovação.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Aprovados</CardTitle>
              <CardDescription>Eventos que foram aprovados e estão visíveis na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedEvents && approvedEvents.length > 0 ? (
                <div className="space-y-6">
                  {approvedEvents.map((event) => (
                    <div key={event.id} className="border p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-48 h-32 rounded-md overflow-hidden">
                          <Image
                            src={event.image_url || "/placeholder.svg?height=200&width=300&query=pet+event"}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium text-lg">{event.name}</h3>
                                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Aprovado</Badge>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {new Date(event.date).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {event.location}
                              </div>
                              {event.users && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Building2 className="h-3.5 w-3.5 mr-1" />
                                  {event.users.name}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-4 md:mt-0">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/events/${event.id}`}>Gerenciar</Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/eventos/${event.id}`} target="_blank">
                                  Ver Evento
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Não há eventos aprovados.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Rejeitados</CardTitle>
              <CardDescription>Eventos que foram rejeitados e não estão visíveis na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedEvents && rejectedEvents.length > 0 ? (
                <div className="space-y-6">
                  {rejectedEvents.map((event) => (
                    <div key={event.id} className="border p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-48 h-32 rounded-md overflow-hidden">
                          <Image
                            src={event.image_url || "/placeholder.svg?height=200&width=300&query=pet+event"}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium text-lg">{event.name}</h3>
                                <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100">Rejeitado</Badge>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {new Date(event.date).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {event.location}
                              </div>
                              {event.users && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Building2 className="h-3.5 w-3.5 mr-1" />
                                  {event.users.name}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-4 md:mt-0">
                              <form
                                action={async () => {
                                  "use server"
                                  await approveItem(event.id, "event")
                                }}
                              >
                                <Button type="submit" size="sm" className="gap-1">
                                  <CheckCircle className="h-4 w-4" /> Aprovar
                                </Button>
                              </form>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/events/${event.id}`}>Detalhes</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Não há eventos rejeitados.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Eventos</CardTitle>
              <CardDescription>Lista completa de eventos cadastrados na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {[...(pendingEvents || []), ...(approvedEvents || []), ...(rejectedEvents || [])].length > 0 ? (
                <div className="space-y-6">
                  {[...(pendingEvents || []), ...(approvedEvents || []), ...(rejectedEvents || [])]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((event) => (
                      <div key={event.id} className="border p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="relative w-full md:w-48 h-32 rounded-md overflow-hidden">
                            <Image
                              src={event.image_url || "/placeholder.svg?height=200&width=300&query=pet+event"}
                              alt={event.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-medium text-lg">{event.name}</h3>
                                  {event.status === "approved" ? (
                                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                                      Aprovado
                                    </Badge>
                                  ) : event.status === "pending" ? (
                                    <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                      Pendente
                                    </Badge>
                                  ) : (
                                    <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100">Rejeitado</Badge>
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {new Date(event.date).toLocaleDateString("pt-BR")}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {event.location}
                                </div>
                                {event.users && (
                                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Building2 className="h-3.5 w-3.5 mr-1" />
                                    {event.users.name}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 mt-4 md:mt-0">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin/events/${event.id}`}>
                                    {event.status === "approved" ? "Gerenciar" : "Detalhes"}
                                  </Link>
                                </Button>
                                {event.status === "approved" && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/eventos/${event.id}`} target="_blank">
                                      Ver Evento
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Não há eventos cadastrados.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
