"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, PawPrint, Calendar, Building2, AlertCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type DashboardStats = {
  totalUsers: number
  totalPets: number
  totalLostPets: number
  totalFoundPets: number
  totalEvents: number
  totalOngs: number
  pendingModeration: number
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPets: 0,
    totalLostPets: 0,
    totalFoundPets: 0,
    totalEvents: 0,
    totalOngs: 0,
    pendingModeration: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Buscar contagem de usuários
        const { count: usersCount, error: usersError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })

        // Replace the pets queries with:
        const { count: petsCount, error: petsError } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("category", "adoption")

        // Replace the lost pets query with:
        const { count: lostPetsCount, error: lostPetsError } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("category", "lost")

        // Replace the found pets query with:
        const { count: foundPetsCount, error: foundPetsError } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("category", "found")

        // Buscar contagem de eventos
        const { count: eventsCount, error: eventsError } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })

        // Replace the ONGs query with:
        const { count: ongsCount, error: ongsError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("type", "ong")

        // Replace the pending pets queries with:
        const { count: pendingPetsCount, error: pendingPetsError } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
          .eq("category", "adoption")

        const { count: pendingLostPetsCount, error: pendingLostPetsError } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
          .eq("category", "lost")

        const { count: pendingFoundPetsCount, error: pendingFoundPetsError } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
          .eq("category", "found")

        const { count: pendingEventsCount, error: pendingEventsError } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")

        // Verificar se houve algum erro
        if (
          usersError ||
          petsError ||
          lostPetsError ||
          foundPetsError ||
          eventsError ||
          ongsError ||
          pendingPetsError ||
          pendingLostPetsError ||
          pendingFoundPetsError ||
          pendingEventsError
        ) {
          console.error("Erro ao buscar estatísticas:", {
            usersError,
            petsError,
            lostPetsError,
            foundPetsError,
            eventsError,
            ongsError,
            pendingPetsError,
            pendingLostPetsError,
            pendingFoundPetsError,
            pendingEventsError,
          })
          setError("Erro ao carregar estatísticas do sistema")
          setIsLoading(false)
          return
        }

        // Calcular total de itens pendentes
        const totalPendingItems =
          (pendingPetsCount || 0) +
          (pendingLostPetsCount || 0) +
          (pendingFoundPetsCount || 0) +
          (pendingEventsCount || 0)

        // Atualizar estatísticas
        setStats({
          totalUsers: usersCount || 0,
          totalPets: petsCount || 0,
          totalLostPets: lostPetsCount || 0,
          totalFoundPets: foundPetsCount || 0,
          totalEvents: eventsCount || 0,
          totalOngs: ongsCount || 0,
          pendingModeration: totalPendingItems,
        })

        setIsLoading(false)
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err)
        setError("Ocorreu um erro ao carregar as estatísticas")
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">Carregando estatísticas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard Administrativo</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total de usuários cadastrados</p>
            <Button asChild variant="link" className="px-0 mt-2">
              <Link href="/admin/users">Ver usuários</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PawPrint className="h-4 w-4" /> Pets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPets + stats.totalLostPets + stats.totalFoundPets}</div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-muted-foreground">
                {stats.totalPets} para adoção • {stats.totalLostPets} perdidos • {stats.totalFoundPets} encontrados
              </p>
            </div>
            <Button asChild variant="link" className="px-0 mt-2">
              <Link href="/admin/pets">Ver pets</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" /> ONGs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOngs}</div>
            <p className="text-xs text-muted-foreground">Total de ONGs cadastradas</p>
            <Button asChild variant="link" className="px-0 mt-2">
              <Link href="/admin/ongs">Ver ONGs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Total de eventos cadastrados</p>
            <Button asChild variant="link" className="px-0 mt-2">
              <Link href="/admin/events">Ver eventos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className={stats.pendingModeration > 0 ? "border-orange-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Moderação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingModeration}</div>
            <p className="text-xs text-muted-foreground">Itens aguardando aprovação</p>
            <Button asChild variant="link" className="px-0 mt-2">
              <Link href="/admin/moderation">Moderar conteúdo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/moderation">Moderar conteúdo pendente</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/users/new">Adicionar novo usuário</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/diagnostics">Executar diagnóstico do sistema</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
