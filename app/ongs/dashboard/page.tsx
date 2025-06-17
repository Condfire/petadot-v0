"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, PawPrint, Calendar, Edit, Plus, LogOut, Settings, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function OngDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [ong, setOng] = useState<any>(null)
  const [pets, setPets] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadOngData() {
      try {
        // Verificar se o usuário está autenticado
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push("/ongs/login?message=Faça login para acessar o dashboard")
          return
        }

        const userId = session.user.id

        // Buscar dados da ONG
        const { data: ongData, error: ongError } = await supabase
          .from("ongs")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (ongError || !ongData) {
          console.error("Erro ao buscar dados da ONG:", ongError)
          setError("Não foi possível carregar os dados da ONG")
          setIsLoading(false)
          return
        }

        setOng(ongData)

        // Buscar pets da ONG
        const { data: petsData, error: petsError } = await supabase
          .from("pets")
          .select("*")
          .eq("ong_id", ongData.id)
          .order("created_at", { ascending: false })

        if (petsError) {
          console.error("Erro ao buscar pets:", petsError)
        } else {
          setPets(petsData || [])
        }

        // Buscar eventos da ONG
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("ong_id", ongData.id)
          .order("start_date", { ascending: true })

        if (eventsError) {
          console.error("Erro ao buscar eventos:", eventsError)
        } else {
          setEvents(eventsData || [])
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError("Ocorreu um erro ao carregar os dados")
      } finally {
        setIsLoading(false)
      }
    }

    loadOngData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/ongs/login")
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard da ONG</h1>
          <p className="text-muted-foreground">Bem-vindo, {ong?.name}! Gerencie seus pets e eventos.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" onClick={() => router.push("/ongs/dashboard/profile")}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eventos Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status da ONG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ong?.is_verified ? "Verificada" : "Pendente"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8">
        <Tabs defaultValue="pets" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pets" className="flex items-center">
              <PawPrint className="mr-2 h-4 w-4" />
              Pets para Adoção
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Eventos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pets">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pets para Adoção</CardTitle>
                  <Button onClick={() => router.push("/ongs/dashboard/pets/cadastrar")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Pet
                  </Button>
                </div>
                <CardDescription>Gerencie os pets disponíveis para adoção</CardDescription>
              </CardHeader>
              <CardContent>
                {pets.length > 0 ? (
                  <div className="grid gap-4">
                    {pets.map((pet) => (
                      <div key={pet.id} className="flex items-center gap-4 p-3 rounded-md border">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden">
                          <Image
                            src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=64&width=64&query=pet"}
                            alt={pet.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{pet.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {pet.breed}, {pet.age} {pet.age === 1 ? "ano" : "anos"}
                          </p>
                          <div className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100">
                            Status:{" "}
                            {pet.status === "approved"
                              ? "Aprovado"
                              : pet.status === "pending"
                                ? "Pendente"
                                : "Rejeitado"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/ongs/dashboard/pets/${pet.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Nenhum pet cadastrado</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cadastre pets para adoção para que eles apareçam aqui.
                    </p>
                    <Button className="mt-4" onClick={() => router.push("/ongs/dashboard/pets/cadastrar")}>
                      Cadastrar Pet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Eventos</CardTitle>
                  <Button onClick={() => router.push("/ongs/dashboard/eventos/cadastrar")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Evento
                  </Button>
                </div>
                <CardDescription>Gerencie os eventos da sua ONG</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <div className="grid gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-3 rounded-md border">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden">
                          <Image
                            src={event.image_url || "/placeholder.svg?height=64&width=64&query=event"}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">{formatEventDate(event.start_date)}</p>
                          <div className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100">
                            Status:{" "}
                            {event.status === "approved"
                              ? "Aprovado"
                              : event.status === "pending"
                                ? "Pendente"
                                : "Rejeitado"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/ongs/dashboard/eventos/${event.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => router.push(`/ongs/dashboard/eventos/${event.id}/delete`)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Nenhum evento cadastrado</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Crie eventos para divulgar ações da sua ONG.</p>
                    <Button className="mt-4" onClick={() => router.push("/ongs/dashboard/eventos/cadastrar")}>
                      Criar Evento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
