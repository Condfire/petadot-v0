"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserStats } from "@/lib/supabase"
import { PawPrint, Search, Heart, Plus, Clock, ArrowRight, BookOpen } from "lucide-react"
import RequireAuth from "@/components/require-auth"

type UserStats = {
  adoptionCount: number
  lostCount: number
  foundCount: number
  totalCount: number
  recentPets: Array<{
    id: string
    name: string
    image_url: string
    created_at: string
    status: string
    type: "adoption" | "lost" | "found"
  }>
}

function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const { data } = await supabase.auth.getUser()

        if (data?.user) {
          setUser(data.user)

          // Buscar estatísticas do usuário
          try {
            const userStats = await getUserStats(data.user.id)
            setStats(userStats)
          } catch (error) {
            console.error("Erro ao buscar estatísticas:", error)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchUserAndStats()
  }, [supabase.auth])

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Função para obter o ícone com base no tipo de pet
  const getPetTypeIcon = (type: string) => {
    switch (type) {
      case "adoption":
        return <Heart className="h-4 w-4 text-primary" />
      case "lost":
        return <Search className="h-4 w-4 text-destructive" />
      case "found":
        return <PawPrint className="h-4 w-4 text-secondary" />
      default:
        return <PawPrint className="h-4 w-4" />
    }
  }

  // Função para obter o texto do tipo de pet
  const getPetTypeText = (type: string) => {
    switch (type) {
      case "adoption":
        return "Adoção"
      case "lost":
        return "Perdido"
      case "found":
        return "Encontrado"
      default:
        return type
    }
  }

  // Função para obter a URL com base no tipo de pet
  const getPetUrl = (type: string, id: string) => {
    switch (type) {
      case "adoption":
        return `/dashboard/pets/adoption/${id}`
      case "lost":
        return `/dashboard/pets/lost/${id}`
      case "found":
        return `/dashboard/pets/found/${id}`
      default:
        return "#"
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.user_metadata?.name || user?.email}! Gerencie seus pets e acompanhe suas atividades.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button asChild>
            <Link href="/cadastrar-pet-adocao">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Pet para Adoção
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/historias/nova">
              <BookOpen className="mr-2 h-4 w-4" />
              Contar Minha História
            </Link>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Pets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalCount || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pets para Adoção</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.adoptionCount || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pets Perdidos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.lostCount || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pets Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.foundCount || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Atividades Recentes */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>Seus pets cadastrados recentemente</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.recentPets && stats.recentPets.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentPets.map((pet) => (
                    <Link
                      key={`${pet.type}-${pet.id}`}
                      href={getPetUrl(pet.type, pet.id)}
                      className="flex items-center gap-4 p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=48&width=48&query=pet"}
                          alt={pet.name || "Pet"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{pet.name || "Pet sem nome"}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {getPetTypeIcon(pet.type)}
                          <span>{getPetTypeText(pet.type)}</span>
                          <span className="mx-1">•</span>
                          <span>{formatDate(pet.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Você ainda não cadastrou nenhum pet.</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/cadastrar-pet-adocao">Cadastrar Pet</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/my-pets">
                  Ver Todos os Pets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Links Rápidos */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Links Rápidos</CardTitle>
              <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" asChild>
                <Link href="/cadastrar-pet-adocao">
                  <Heart className="mr-2 h-4 w-4" />
                  Cadastrar Pet para Adoção
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/perdidos/cadastrar">
                  <Search className="mr-2 h-4 w-4" />
                  Reportar Pet Perdido
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/encontrados/cadastrar">
                  <PawPrint className="mr-2 h-4 w-4" />
                  Reportar Pet Encontrado
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/historias/nova">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Contar Minha História
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/profile">
                  <PawPrint className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  )
}
