import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar, Plus, PawPrint, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  // Get user's pets with error handling
  let userPets: any[] = []
  let stats = {
    totalPets: 0,
    lostPets: 0,
    foundPets: 0,
    adoptionPets: 0,
  }

  try {
    // Get pets for all statuses
    const [lostPetsResult, foundPetsResult, adoptionPetsResult] = await Promise.allSettled([
      supabase
        .from("pets_lost")
        .select("id, name, species, city, state, status, created_at, images")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("pets_found")
        .select("id, name, species, city, state, status, created_at, images")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("pets_adoption")
        .select("id, name, species, city, state, status, created_at, images")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ])

    // Process results
    const lostPets = lostPetsResult.status === "fulfilled" ? lostPetsResult.value.data || [] : []
    const foundPets = foundPetsResult.status === "fulfilled" ? foundPetsResult.value.data || [] : []
    const adoptionPets = adoptionPetsResult.status === "fulfilled" ? adoptionPetsResult.value.data || [] : []

    // Combine all pets with type information
    userPets = [
      ...lostPets.map((pet: any) => ({ ...pet, type: "lost", table: "pets_lost" })),
      ...foundPets.map((pet: any) => ({ ...pet, type: "found", table: "pets_found" })),
      ...adoptionPets.map((pet: any) => ({ ...pet, type: "adoption", table: "pets_adoption" })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Calculate stats
    stats = {
      totalPets: userPets.length,
      lostPets: lostPets.length,
      foundPets: foundPets.length,
      adoptionPets: adoptionPets.length,
    }
  } catch (error) {
    console.error("Error fetching user pets:", error)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      case "adopted":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "lost":
        return "Perdido"
      case "found":
        return "Encontrado"
      case "adoption":
        return "Adoção"
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lost":
        return "bg-red-100 text-red-800"
      case "found":
        return "bg-green-100 text-green-800"
      case "adoption":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Olá, {user.name}! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Bem-vindo ao seu painel do Petadot</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPets}</div>
            <p className="text-xs text-muted-foreground">Pets cadastrados por você</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pets Perdidos</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lostPets}</div>
            <p className="text-xs text-muted-foreground">Aguardando retorno</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pets Encontrados</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.foundPets}</div>
            <p className="text-xs text-muted-foreground">Ajudando outros tutores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para Adoção</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.adoptionPets}</div>
            <p className="text-xs text-muted-foreground">Buscando novos lares</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Cadastre um novo pet ou acesse suas funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/perdidos/cadastrar">
                <Heart className="h-6 w-6 text-red-500" />
                <span>Cadastrar Pet Perdido</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/encontrados/cadastrar">
                <Users className="h-6 w-6 text-green-500" />
                <span>Cadastrar Pet Encontrado</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
            >
              <Link href="/adocao/cadastrar">
                <PawPrint className="h-6 w-6 text-blue-500" />
                <span>Cadastrar para Adoção</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Pets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Seus Pets Recentes</CardTitle>
            <CardDescription>Últimos pets cadastrados por você</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/pets">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {userPets.length === 0 ? (
            <div className="text-center py-8">
              <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum pet cadastrado ainda</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Comece cadastrando seu primeiro pet</p>
              <Button asChild>
                <Link href="/perdidos/cadastrar">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Pet
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userPets.slice(0, 5).map((pet) => (
                <div
                  key={`${pet.table}-${pet.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <PawPrint className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{pet.name || "Pet sem nome"}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{pet.species || "Espécie não informada"}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>
                          {pet.city}, {pet.state}
                        </span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(pet.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(pet.type)}>{getTypeLabel(pet.type)}</Badge>
                    <Badge className={getStatusColor(pet.status)}>
                      {pet.status === "active"
                        ? "Ativo"
                        : pet.status === "resolved"
                          ? "Resolvido"
                          : pet.status === "adopted"
                            ? "Adotado"
                            : pet.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
