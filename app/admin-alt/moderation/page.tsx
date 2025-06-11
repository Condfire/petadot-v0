"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, XCircle, CheckCircle, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { ModerationActions } from "@/components/moderation-actions"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AdminAltAuthCheck from "@/components/admin-alt-auth-check"

// Tipos
type Pet = {
  id: string
  name: string
  species: string
  breed: string | null
  main_image_url: string | null
  description: string | null
  created_at: string
  user_id: string
  status: string
  rejection_reason: string | null
  category: string
  // Campos específicos para pets perdidos
  last_seen_location?: string
  last_seen_date?: string
  contact?: string
  // Campos específicos para pets encontrados
  found_location?: string
  found_date?: string
  current_location?: string
}

type Event = {
  id: string
  title: string
  description: string
  date: string
  location: string
  image_url: string | null
  created_at: string
  user_id: string
  status: string
  rejection_reason: string | null
  users?: {
    name: string
  }
}

type PendingItems = {
  pets: Pet[]
  lostPets: Pet[]
  foundPets: Pet[]
  events: Event[]
  rejectedPets: Pet[]
  rejectedEvents: Event[]
}

export default function AdminModerationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [pendingItems, setPendingItems] = useState<PendingItems>({
    pets: [],
    lostPets: [],
    foundPets: [],
    events: [],
    rejectedPets: [],
    rejectedEvents: [],
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPendingItems()
  }, [])

  async function fetchPendingItems() {
    try {
      console.log("Buscando itens pendentes...")

      // Buscar pets para adoção pendentes
      const { data: pets, error: petsError } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "pending")
        .eq("category", "adoption")
        .order("created_at", { ascending: false })

      if (petsError) {
        console.error("Erro ao buscar pets para adoção:", petsError.message)
      }

      // Buscar pets perdidos pendentes
      const { data: lostPets, error: lostPetsError } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "pending")
        .eq("category", "lost")
        .order("created_at", { ascending: false })

      if (lostPetsError) {
        console.error("Erro ao buscar pets perdidos:", lostPetsError.message)
      }

      // Buscar pets encontrados pendentes
      const { data: foundPets, error: foundPetsError } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "pending")
        .eq("category", "found")
        .order("created_at", { ascending: false })

      if (foundPetsError) {
        console.error("Erro ao buscar pets encontrados:", foundPetsError.message)
      }

      // Buscar eventos pendentes
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*, users(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (eventsError) {
        console.error("Erro ao buscar eventos:", eventsError.message)
      }

      // Buscar pets rejeitados automaticamente
      const { data: rejectedPets, error: rejectedPetsError } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "rejected")
        .order("created_at", { ascending: false })
        .limit(20)

      if (rejectedPetsError) {
        console.error("Erro ao buscar pets rejeitados:", rejectedPetsError.message)
      }

      // Buscar eventos rejeitados automaticamente
      const { data: rejectedEvents, error: rejectedEventsError } = await supabase
        .from("events")
        .select("*, users(name)")
        .eq("status", "rejected")
        .order("created_at", { ascending: false })
        .limit(20)

      if (rejectedEventsError) {
        console.error("Erro ao buscar eventos rejeitados:", rejectedEventsError.message)
      }

      setPendingItems({
        pets: pets || [],
        lostPets: lostPets || [],
        foundPets: foundPets || [],
        events: events || [],
        rejectedPets: rejectedPets || [],
        rejectedEvents: rejectedEvents || [],
      })

      setIsLoading(false)
      console.log("Itens pendentes carregados com sucesso")
    } catch (err) {
      console.error("Erro ao buscar itens pendentes:", err)
      setIsLoading(false)
    }
  }

  // Função para obter imagem com fallback
  const getImageSrc = (imageUrl: string | null) => {
    if (imageUrl && imageUrl.trim() !== "") {
      return imageUrl
    }
    return "/placeholder.svg?height=200&width=200"
  }

  if (isLoading) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">Carregando itens pendentes...</p>
      </div>
    )
  }

  const totalPending =
    pendingItems.pets.length + pendingItems.lostPets.length + pendingItems.foundPets.length + pendingItems.events.length
  const totalRejected = pendingItems.rejectedPets.length + pendingItems.rejectedEvents.length

  return (
    <AdminAltAuthCheck>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Moderação de Conteúdo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPending}</div>
              <p className="text-xs text-muted-foreground">Itens aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pets para Adoção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingItems.pets.length}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pets Perdidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingItems.lostPets.length}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pets Encontrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingItems.foundPets.length}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                Rejeitados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalRejected}</div>
              <p className="text-xs text-muted-foreground">Rejeitados automaticamente</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="lost">Pets Perdidos ({pendingItems.lostPets.length})</TabsTrigger>
            <TabsTrigger value="found">Pets Encontrados ({pendingItems.foundPets.length})</TabsTrigger>
            <TabsTrigger value="adoption">Adoção ({pendingItems.pets.length})</TabsTrigger>
            <TabsTrigger value="events">Eventos ({pendingItems.events.length})</TabsTrigger>
            <TabsTrigger value="rejected" className="text-red-600">
              Rejeitados ({totalRejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="found">
            <Card>
              <CardHeader>
                <CardTitle>Pets Encontrados Pendentes</CardTitle>
                <CardDescription>Aprove ou rejeite os pets encontrados cadastrados pelos usuários.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingItems.foundPets.length > 0 ? (
                  <div className="space-y-6">
                    {pendingItems.foundPets.map((pet) => (
                      <div key={pet.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                        <div className="w-full md:w-1/4 aspect-square relative rounded-md overflow-hidden">
                          <Image
                            src={getImageSrc(pet.main_image_url) || "/placeholder.svg"}
                            alt={pet.name || "Pet encontrado"}
                            fill
                            className="object-cover"
                            unoptimized={getImageSrc(pet.main_image_url).includes("placeholder.svg")}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{pet.name || "Pet sem nome"}</h3>
                              <Badge variant="outline" className="mt-1">
                                Encontrado
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(pet.created_at).toLocaleDateString("pt-BR")}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                            <div>
                              <p className="text-sm font-medium">Espécie:</p>
                              <p className="text-sm">{pet.species}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Raça:</p>
                              <p className="text-sm">{pet.breed || "Não informada"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Local encontrado:</p>
                              <p className="text-sm">{pet.found_location}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Data:</p>
                              <p className="text-sm">
                                {pet.found_date
                                  ? new Date(pet.found_date).toLocaleDateString("pt-BR")
                                  : "Não informada"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Contato:</p>
                              <p className="text-sm">{pet.contact}</p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm font-medium">Descrição:</p>
                            <p className="text-sm">{pet.description || "Sem descrição"}</p>
                          </div>

                          <div className="flex justify-end gap-2 mt-4">
                            <ModerationActions id={pet.id} type="found" onModerated={fetchPendingItems} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum pet encontrado pendente</h3>
                    <p className="text-muted-foreground">Não há pets encontrados aguardando aprovação no momento.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nova aba para itens rejeitados */}
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Itens Rejeitados Automaticamente
                </CardTitle>
                <CardDescription>
                  Itens que foram rejeitados automaticamente pelo sistema de moderação por palavras-chave
                </CardDescription>
              </CardHeader>
              <CardContent>
                {totalRejected > 0 ? (
                  <div className="space-y-6">
                    {/* Pets rejeitados */}
                    {pendingItems.rejectedPets.map((pet) => (
                      <div
                        key={pet.id}
                        className="flex flex-col md:flex-row gap-4 p-4 border border-destructive/20 rounded-lg bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="w-full md:w-1/4 aspect-square relative rounded-md overflow-hidden">
                          <Image
                            src={getImageSrc(pet.main_image_url) || "/placeholder.svg"}
                            alt={pet.name || "Pet rejeitado"}
                            fill
                            className="object-cover"
                            unoptimized={getImageSrc(pet.main_image_url).includes("placeholder.svg")}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{pet.name || "Pet sem nome"}</h3>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="destructive">Rejeitado</Badge>
                                <Badge variant="outline">
                                  {pet.category === "lost"
                                    ? "Perdido"
                                    : pet.category === "found"
                                      ? "Encontrado"
                                      : "Adoção"}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(pet.created_at).toLocaleDateString("pt-BR")}
                            </div>
                          </div>

                          {pet.rejection_reason && (
                            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-destructive">Motivo da rejeição:</span>
                              </div>
                              <p className="text-sm text-destructive/80 mt-1">{pet.rejection_reason}</p>
                            </div>
                          )}

                          <div className="mt-4">
                            <p className="text-sm font-medium">Descrição:</p>
                            <p className="text-sm">{pet.description || "Sem descrição"}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Eventos rejeitados */}
                    {pendingItems.rejectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex flex-col md:flex-row gap-4 p-4 border border-destructive/20 rounded-lg bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="w-full md:w-1/4 aspect-square relative rounded-md overflow-hidden">
                          <Image
                            src={getImageSrc(event.image_url) || "/placeholder.svg"}
                            alt={event.title || "Evento rejeitado"}
                            fill
                            className="object-cover"
                            unoptimized={getImageSrc(event.image_url).includes("placeholder.svg")}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{event.title || "Evento sem título"}</h3>
                              <Badge variant="destructive" className="mt-1">
                                Rejeitado
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(event.created_at).toLocaleDateString("pt-BR")}
                            </div>
                          </div>

                          {event.rejection_reason && (
                            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-destructive">Motivo da rejeição:</span>
                              </div>
                              <p className="text-sm text-destructive/80 mt-1">{event.rejection_reason}</p>
                            </div>
                          )}

                          <div className="mt-4">
                            <p className="text-sm font-medium">Descrição:</p>
                            <p className="text-sm">{event.description || "Sem descrição"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum item rejeitado!</h3>
                    <p className="text-muted-foreground">
                      O sistema de moderação não rejeitou nenhum item automaticamente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras abas existentes... */}
        </Tabs>
      </div>
    </AdminAltAuthCheck>
  )
}
