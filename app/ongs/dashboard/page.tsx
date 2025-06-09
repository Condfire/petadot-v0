"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, ExternalLink, LogOut, Settings, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import OngStats from "./components/ong-stats"
import PetsManagement from "./components/pets-management"
import EventsManagement from "./components/events-management"

export default function OngDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [ong, setOng] = useState<any>(null)
  const [pets, setPets] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadOngData() {
      try {
        // Verificar se o usuário está autenticado
        const { data: session } = await supabase.auth.getSession()

        if (!session.session) {
          router.push("/ongs/login?message=Faça login para acessar o dashboard")
          return
        }

        const userId = session.session.user.id

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
          console.error("Erro ao buscar pets:", petsError.message, petsError) // Log full error
        } else {
          setPets(petsData || [])
        }

        // Buscar eventos da ONG
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("ong_id", ongData.id)
          .order("date", { ascending: true }) // Consider 'start_date' if that's your column

        if (eventsError) {
          console.error("Erro ao buscar eventos:", eventsError.message, eventsError) // Log full error
        } else {
          setEvents(eventsData || [])
        }

        // Calcular estatísticas
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const adoptedPets = petsData?.filter((pet) => pet.status === "adopted") || []
        const adoptedThisMonth = adoptedPets.filter((pet) => new Date(pet.updated_at || pet.created_at) >= thisMonth)
        const upcomingEvents = eventsData?.filter((event) => new Date(event.date) > now) || []

        const approvedPets = petsData?.filter((pet) => pet.status === "approved") || []
        const totalPets = petsData?.length || 0
        const approvalRate = totalPets > 0 ? Math.round((approvedPets.length / totalPets) * 100) : 0

        setStats({
          totalPets,
          petsAdopted: adoptedPets.length,
          petsAdoptedThisMonth: adoptedThisMonth.length,
          totalEvents: eventsData?.length || 0,
          upcomingEvents: upcomingEvents.length,
          profileViews: Math.floor(Math.random() * 1000) + 100, // Placeholder
          approvalRate,
        })
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

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard - {ong?.name}</h1>
          <p className="text-muted-foreground">Gerencie seus pets, eventos e acompanhe o desempenho da sua ONG</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/ongs/${ong?.slug || ong?.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Perfil Público
          </Button>
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

      {!ong?.is_verified && (
        <Alert className="mb-6">
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            Sua ONG está pendente de verificação. Alguns recursos podem estar limitados até a aprovação.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {/* Estatísticas */}
        {stats && <OngStats stats={stats} />}

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button onClick={() => router.push("/ongs/dashboard/pets/cadastrar")} className="h-20 flex-col">
                <Building2 className="h-6 w-6 mb-2" />
                Cadastrar Pet
              </Button>
              <Button
                onClick={() => router.push("/ongs/dashboard/eventos/cadastrar")}
                variant="outline"
                className="h-20 flex-col"
              >
                <Building2 className="h-6 w-6 mb-2" />
                Criar Evento
              </Button>
              <Button
                onClick={() => router.push(`/ongs/${ong?.slug || ong?.id}`)}
                variant="outline"
                className="h-20 flex-col"
              >
                <ExternalLink className="h-6 w-6 mb-2" />
                Ver Perfil Público
              </Button>
              <Button
                onClick={() => router.push("/ongs/dashboard/profile")}
                variant="outline"
                className="h-20 flex-col"
              >
                <Settings className="h-6 w-6 mb-2" />
                Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gerenciamento de Pets */}
        <PetsManagement pets={pets} />

        {/* Gerenciamento de Eventos */}
        <EventsManagement events={events} />
      </div>
    </div>
  )
}
