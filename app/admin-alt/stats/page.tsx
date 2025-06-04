import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import AdminAuthCheck from "@/components/admin-auth-check"
import { supabase } from "@/lib/supabase"

async function getStats() {
  // Buscar estatísticas de usuários
  const { count: usersCount, error: usersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })

  // Buscar estatísticas de pets para adoção
  const { count: adoptionCount, error: adoptionError } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })

  // Buscar estatísticas de pets perdidos
  const { count: lostCount, error: lostError } = await supabase
    .from("pets_lost")
    .select("*", { count: "exact", head: true })

  // Buscar estatísticas de pets encontrados
  const { count: foundCount, error: foundError } = await supabase
    .from("pets_found")
    .select("*", { count: "exact", head: true })

  // Buscar estatísticas de ONGs
  const { count: ongsCount, error: ongsError } = await supabase.from("ongs").select("*", { count: "exact", head: true })

  // Buscar estatísticas de eventos
  const { count: eventsCount, error: eventsError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })

  if (usersError || adoptionError || lostError || foundError || ongsError || eventsError) {
    console.error("Erro ao buscar estatísticas:", {
      usersError,
      adoptionError,
      lostError,
      foundError,
      ongsError,
      eventsError,
    })
  }

  return {
    users: usersCount || 0,
    adoption: adoptionCount || 0,
    lost: lostCount || 0,
    found: foundCount || 0,
    ongs: ongsCount || 0,
    events: eventsCount || 0,
  }
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function AdminStatsPage() {
  const stats = await getStats()

  return (
    <AdminAuthCheck>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Estatísticas da Plataforma</h1>

        <Suspense fallback={<StatsLoading />}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
                <p className="text-xs text-muted-foreground">Usuários cadastrados na plataforma</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pets para Adoção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adoption}</div>
                <p className="text-xs text-muted-foreground">Pets disponíveis para adoção</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pets Perdidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lost}</div>
                <p className="text-xs text-muted-foreground">Pets reportados como perdidos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pets Encontrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.found}</div>
                <p className="text-xs text-muted-foreground">Pets reportados como encontrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ONGs Cadastradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ongs}</div>
                <p className="text-xs text-muted-foreground">ONGs parceiras na plataforma</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events}</div>
                <p className="text-xs text-muted-foreground">Eventos cadastrados na plataforma</p>
              </CardContent>
            </Card>
          </div>
        </Suspense>
      </div>
    </AdminAuthCheck>
  )
}
