import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Mail, Phone, Globe, Calendar, PawPrint, CheckCircle, XCircle, ArrowLeft, Trash2 } from "lucide-react"
import { verifyOng } from "@/app/actions"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  const { data: ong } = await supabase.from("ongs").select("name").eq("id", params.id).single()

  return {
    title: ong ? `${ong.name} | Administração de ONGs | PetAdot` : "Detalhes da ONG | PetAdot",
    description: "Gerenciar detalhes da ONG na plataforma PetAdot",
  }
}

export default async function AdminOngDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/ongs/" + params.id)
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

  // Buscar detalhes da ONG
  const { data: ong, error: ongError } = await supabase
    .from("ongs")
    .select(`
      *,
      pets(id, name, image_url, status),
      events(id, name, image_url, date, status)
    `)
    .eq("id", params.id)
    .single()

  if (ongError) {
    console.error("Erro ao buscar detalhes da ONG:", ongError)
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Detalhes da ONG</h1>
        <p className="text-red-500">Erro ao carregar detalhes da ONG.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/ongs">Voltar para lista de ONGs</Link>
        </Button>
      </div>
    )
  }

  // Contar pets e eventos por status
  const pendingPets = ong.pets.filter((pet) => pet.status === "pending").length
  const approvedPets = ong.pets.filter((pet) => pet.status === "approved").length
  const rejectedPets = ong.pets.filter((pet) => pet.status === "rejected").length

  const pendingEvents = ong.events.filter((event) => event.status === "pending").length
  const approvedEvents = ong.events.filter((event) => event.status === "approved").length
  const rejectedEvents = ong.events.filter((event) => event.status === "rejected").length

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" className="mr-4 p-0 h-auto">
          <Link href="/admin/ongs" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da ONG</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {ong.logo_url && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image src={ong.logo_url || "/placeholder.svg"} alt={ong.name} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">{ong.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {ong.city}, {ong.state}
                    </CardDescription>
                  </div>
                </div>
                <div>
                  {ong.is_verified ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verificada</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ong.description && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Descrição</h3>
                    <p className="text-sm text-muted-foreground">{ong.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Informações de Contato</h3>
                    <div className="space-y-2">
                      {ong.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 mr-2" />
                          {ong.email}
                        </div>
                      )}
                      {ong.contact && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 mr-2" />
                          {ong.contact}
                        </div>
                      )}
                      {ong.website && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Globe className="h-3.5 w-3.5 mr-2" />
                          <a href={ong.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {ong.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">Endereço</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {ong.address && <p>{ong.address}</p>}
                      <p>
                        {ong.city}, {ong.state}
                        {ong.postal_code && ` - ${ong.postal_code}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Estatísticas</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <PawPrint className="h-3.5 w-3.5 mr-2" />
                        {ong.pets.length} pets cadastrados
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        {ong.events.length} eventos cadastrados
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">Datas</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Cadastrada em: {new Date(ong.created_at).toLocaleDateString("pt-BR")}</p>
                      {ong.updated_at && (
                        <p>Última atualização: {new Date(ong.updated_at).toLocaleDateString("pt-BR")}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
              {!ong.is_verified && (
                <form
                  action={async () => {
                    "use server"
                    await verifyOng(ong.id)
                  }}
                  className="w-full sm:w-auto"
                >
                  <Button type="submit" className="w-full gap-1">
                    <CheckCircle className="h-4 w-4" /> Verificar ONG
                  </Button>
                </form>
              )}
              <Button variant="outline" className="w-full sm:w-auto gap-1">
                <XCircle className="h-4 w-4" /> Rejeitar ONG
              </Button>
              <Button variant="destructive" asChild className="w-full sm:w-auto gap-1">
                <Link href={`/admin/ongs/${ong.id}/delete`}>
                  <Trash2 className="h-4 w-4" /> Excluir ONG
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full sm:w-auto">
                <Link href={`/ongs/${ong.id}`} target="_blank">
                  Ver Perfil Público
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Tabs defaultValue="pets" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="pets">Pets ({ong.pets.length})</TabsTrigger>
              <TabsTrigger value="events">Eventos ({ong.events.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pets">
              <Card>
                <CardHeader>
                  <CardTitle>Pets Cadastrados</CardTitle>
                  <CardDescription>
                    {approvedPets} aprovados, {pendingPets} pendentes, {rejectedPets} rejeitados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ong.pets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ong.pets.map((pet) => (
                        <Card key={pet.id} className="overflow-hidden">
                          <div className="relative aspect-square">
                            <Image
                              src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=200&width=200&query=pet"}
                              alt={pet.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              {pet.status === "approved" ? (
                                <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
                              ) : pet.status === "pending" ? (
                                <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium">{pet.name}</h3>
                            <div className="flex justify-end mt-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/pets/${pet.id}`}>Detalhes</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Esta ONG ainda não cadastrou nenhum pet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Eventos Cadastrados</CardTitle>
                  <CardDescription>
                    {approvedEvents} aprovados, {pendingEvents} pendentes, {rejectedEvents} rejeitados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ong.events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ong.events.map((event) => (
                        <Card key={event.id} className="overflow-hidden">
                          <div className="relative aspect-video">
                            <Image
                              src={event.image_url || "/placeholder.svg?height=200&width=400&query=pet+event"}
                              alt={event.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              {event.status === "approved" ? (
                                <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
                              ) : event.status === "pending" ? (
                                <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium">{event.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.start_date).toLocaleDateString("pt-BR")}
                            </p>
                            <div className="flex justify-end mt-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/events/${event.id}`}>Detalhes</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Esta ONG ainda não cadastrou nenhum evento.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>Gerencie esta ONG</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!ong.is_verified ? (
                <form
                  action={async () => {
                    "use server"
                    await verifyOng(ong.id)
                  }}
                >
                  <Button type="submit" className="w-full gap-1">
                    <CheckCircle className="h-4 w-4" /> Verificar ONG
                  </Button>
                </form>
              ) : (
                <Button className="w-full gap-1" disabled>
                  <CheckCircle className="h-4 w-4" /> ONG já verificada
                </Button>
              )}
              <Button variant="outline" className="w-full gap-1">
                <XCircle className="h-4 w-4" /> Rejeitar ONG
              </Button>
              <Button variant="destructive" className="w-full gap-1 mt-2" asChild>
                <Link href={`/admin/ongs/${ong.id}/delete`}>
                  <Trash2 className="h-4 w-4" /> Excluir ONG
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href={`/ongs/${ong.id}`} target="_blank">
                  Ver Perfil Público
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Pets</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 p-2 rounded-md text-center">
                      <p className="text-lg font-bold text-green-700">{approvedPets}</p>
                      <p className="text-xs text-green-600">Aprovados</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded-md text-center">
                      <p className="text-lg font-bold text-yellow-700">{pendingPets}</p>
                      <p className="text-xs text-yellow-600">Pendentes</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-md text-center">
                      <p className="text-lg font-bold text-red-700">{rejectedPets}</p>
                      <p className="text-xs text-red-600">Rejeitados</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Eventos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 p-2 rounded-md text-center">
                      <p className="text-lg font-bold text-green-700">{approvedEvents}</p>
                      <p className="text-xs text-green-600">Aprovados</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded-md text-center">
                      <p className="text-lg font-bold text-yellow-700">{pendingEvents}</p>
                      <p className="text-xs text-yellow-600">Pendentes</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-md text-center">
                      <p className="text-lg font-bold text-red-700">{rejectedEvents}</p>
                      <p className="text-xs text-red-600">Rejeitados</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
