import type { Metadata } from "next"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminAuthCheck from "@/components/admin-auth-check"
import {
  Building2,
  CalendarDays,
  PawPrint,
  Search,
  Users,
  MessageSquare,
  AlertCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Painel de Administração | PetAdot",
  description: "Painel de administração para gerenciar a plataforma PetAdot",
}

export default async function AdminDashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Buscar estatísticas
  const { count: ongsCount } = await supabase.from("ongs").select("*", { count: "exact", head: true })

  const { count: verifiedOngsCount } = await supabase
    .from("ongs")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true)

  const { count: pendingOngsCount } = await supabase
    .from("ongs")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", false)

  const { count: eventsCount } = await supabase.from("events").select("*", { count: "exact", head: true })

  const { count: pendingEventsCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { count: petsCount } = await supabase.from("pets").select("*", { count: "exact", head: true })

  const { count: pendingPetsCount } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: lostPetsCount } = await supabase.from("pets_lost").select("*", { count: "exact", head: true })

  const { count: pendingLostPetsCount } = await supabase
    .from("pets_lost")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: foundPetsCount } = await supabase.from("pets_found").select("*", { count: "exact", head: true })

  const { count: pendingFoundPetsCount } = await supabase
    .from("pets_found")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: adoptionFormsCount } = await supabase
    .from("adoption_forms")
    .select("*", { count: "exact", head: true })

  const { count: pendingAdoptionFormsCount } = await supabase
    .from("adoption_forms")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: contactMessagesCount } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })

  const { count: unreadContactMessagesCount } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  // Buscar itens pendentes recentes
  const { data: recentPendingOngs } = await supabase
    .from("ongs")
    .select("id, name, created_at")
    .eq("is_verified", false)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentPendingEvents } = await supabase
    .from("events")
    .select("id, name, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentPendingPets } = await supabase
    .from("pets")
    .select("id, name, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <AdminAuthCheck>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">Voltar ao site</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/settings">Configurações</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ONGs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ongsCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {verifiedOngsCount || 0} verificadas, {pendingOngsCount || 0} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventsCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{pendingEventsCount || 0} pendentes de aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(petsCount || 0) + (lostPetsCount || 0) + (foundPetsCount || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(pendingPetsCount || 0) + (pendingLostPetsCount || 0) + (pendingFoundPetsCount || 0)} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {adoptionFormsCount || 0} formulários de adoção, {pendingAdoptionFormsCount || 0} pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Itens Pendentes</TabsTrigger>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                    ONGs Pendentes
                  </CardTitle>
                  <CardDescription>ONGs aguardando verificação</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPendingOngs && recentPendingOngs.length > 0 ? (
                    <div className="space-y-4">
                      {recentPendingOngs.map((ong) => (
                        <div key={ong.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{ong.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(ong.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/admin/ongs/${ong.id}`}>Verificar</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Não há ONGs pendentes de verificação.</p>
                  )}
                  {pendingOngsCount > 5 && (
                    <Button variant="link" asChild className="mt-4 px-0">
                      <Link href="/admin/ongs">Ver todas ({pendingOngsCount})</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                    Eventos Pendentes
                  </CardTitle>
                  <CardDescription>Eventos aguardando aprovação</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPendingEvents && recentPendingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {recentPendingEvents.map((event) => (
                        <div key={event.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{event.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/admin/events/${event.id}`}>Revisar</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Não há eventos pendentes de aprovação.</p>
                  )}
                  {pendingEventsCount > 5 && (
                    <Button variant="link" asChild className="mt-4 px-0">
                      <Link href="/admin/events">Ver todos ({pendingEventsCount})</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PawPrint className="mr-2 h-5 w-5 text-primary" />
                    Pets Pendentes
                  </CardTitle>
                  <CardDescription>Pets aguardando aprovação</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPendingPets && recentPendingPets.length > 0 ? (
                    <div className="space-y-4">
                      {recentPendingPets.map((pet) => (
                        <div key={pet.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{pet.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(pet.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/admin/pets/${pet.id}`}>Revisar</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Não há pets pendentes de aprovação.</p>
                  )}
                  {pendingPetsCount > 5 && (
                    <Button variant="link" asChild className="mt-4 px-0">
                      <Link href="/admin/pets">Ver todos ({pendingPetsCount})</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                    ONGs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de ONGs:</span>
                      <span className="font-medium">{ongsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ONGs verificadas:</span>
                      <span className="font-medium">{verifiedOngsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ONGs pendentes:</span>
                      <span className="font-medium">{pendingOngsCount || 0}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/admin/ongs">Gerenciar ONGs</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                    Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de eventos:</span>
                      <span className="font-medium">{eventsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eventos aprovados:</span>
                      <span className="font-medium">{(eventsCount || 0) - (pendingEventsCount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eventos pendentes:</span>
                      <span className="font-medium">{pendingEventsCount || 0}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/admin/events">Gerenciar Eventos</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PawPrint className="mr-2 h-5 w-5 text-primary" />
                    Pets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pets para adoção:</span>
                      <span className="font-medium">{petsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pets perdidos:</span>
                      <span className="font-medium">{lostPetsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pets encontrados:</span>
                      <span className="font-medium">{foundPetsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total pendentes:</span>
                      <span className="font-medium">
                        {(pendingPetsCount || 0) + (pendingLostPetsCount || 0) + (pendingFoundPetsCount || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/admin/pets">Gerenciar Pets</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de usuários:</span>
                      <span className="font-medium">{usersCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Formulários de adoção:</span>
                      <span className="font-medium">{adoptionFormsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Formulários pendentes:</span>
                      <span className="font-medium">{pendingAdoptionFormsCount || 0}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/admin/users">Gerenciar Usuários</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    Mensagens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de mensagens:</span>
                      <span className="font-medium">{contactMessagesCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mensagens não lidas:</span>
                      <span className="font-medium">{unreadContactMessagesCount || 0}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/admin/messages">Gerenciar Mensagens</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5 text-primary" />
                    Pesquisa Rápida
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/ongs">
                        <Building2 className="mr-2 h-4 w-4" /> ONGs
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/events">
                        <CalendarDays className="mr-2 h-4 w-4" /> Eventos
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/pets">
                        <PawPrint className="mr-2 h-4 w-4" /> Pets
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/users">
                        <Users className="mr-2 h-4 w-4" /> Usuários
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/diagnostics">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Diagnóstico do Sistema
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Mensagens Recentes
                </CardTitle>
                <CardDescription>
                  {unreadContactMessagesCount || 0} mensagens não lidas de um total de {contactMessagesCount || 0}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button asChild variant="outline" className="w-full mr-2">
                      <Link href="/admin/messages">
                        <Clock className="mr-2 h-4 w-4" /> Todas as Mensagens
                      </Link>
                    </Button>
                    <Button asChild className="w-full ml-2">
                      <Link href="/admin/messages/unread">
                        <AlertCircle className="mr-2 h-4 w-4" /> Mensagens Não Lidas
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthCheck>
  )
}
