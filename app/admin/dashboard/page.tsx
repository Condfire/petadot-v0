"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PawPrint, Calendar, Users, Heart, AlertTriangle, TrendingUp, Eye, CheckCircle, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalPets: number
  totalEvents: number
  totalUsers: number
  totalFavorites: number
  pendingModeration: number
  recentActivities: any[]
}

interface PendingItem {
  id: string
  type: "pet" | "event" | "story"
  title: string
  description: string
  created_at: string
  status: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [moderationKeywords, setModerationKeywords] = useState<any[]>([])

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch basic statistics
      const [
        { count: totalPets },
        { count: totalEvents },
        { count: totalUsers },
        { count: totalFavorites },
        { data: pendingPets },
        { data: pendingEvents },
        { data: keywords },
      ] = await Promise.all([
        supabase.from("pets").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("favorites").select("*", { count: "exact", head: true }),
        supabase.from("pets").select("*").eq("status", "pending").limit(10),
        supabase.from("events").select("*").eq("status", "pending").limit(10),
        supabase.from("moderation_keywords").select("*").limit(20),
      ])

      // Combine pending items
      const allPendingItems: PendingItem[] = [
        ...(pendingPets || []).map((pet) => ({
          id: pet.id,
          type: "pet" as const,
          title: pet.name || "Pet sem nome",
          description: pet.description || "Sem descrição",
          created_at: pet.created_at,
          status: pet.status,
        })),
        ...(pendingEvents || []).map((event) => ({
          id: event.id,
          type: "event" as const,
          title: event.title || "Evento sem título",
          description: event.description || "Sem descrição",
          created_at: event.created_at,
          status: event.status,
        })),
      ]

      setStats({
        totalPets: totalPets || 0,
        totalEvents: totalEvents || 0,
        totalUsers: totalUsers || 0,
        totalFavorites: totalFavorites || 0,
        pendingModeration: allPendingItems.length,
        recentActivities: [],
      })

      setPendingItems(allPendingItems)
      setModerationKeywords(keywords || [])
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, type: string) => {
    try {
      const table = type === "pet" ? "pets" : "events"
      const { error } = await supabase.from(table).update({ status: "approved" }).eq("id", id)

      if (!error) {
        setPendingItems((prev) => prev.filter((item) => item.id !== id))
        if (stats) {
          setStats((prev) => (prev ? { ...prev, pendingModeration: prev.pendingModeration - 1 } : null))
        }
      }
    } catch (error) {
      console.error("Erro ao aprovar item:", error)
    }
  }

  const handleReject = async (id: string, type: string) => {
    try {
      const table = type === "pet" ? "pets" : "events"
      const { error } = await supabase.from(table).update({ status: "rejected" }).eq("id", id)

      if (!error) {
        setPendingItems((prev) => prev.filter((item) => item.id !== id))
        if (stats) {
          setStats((prev) => (prev ? { ...prev, pendingModeration: prev.pendingModeration - 1 } : null))
        }
      }
    } catch (error) {
      console.error("Erro ao rejeitar item:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da plataforma Petadot</p>
        </div>
        <Button onClick={fetchDashboardData}>Atualizar Dados</Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPets || 0}</div>
            <p className="text-xs text-muted-foreground">Pets cadastrados na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFavorites || 0}</div>
            <p className="text-xs text-muted-foreground">Pets favoritados</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="moderation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="moderation">
            Moderação
            {stats?.pendingModeration > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingModeration}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Itens Pendentes de Moderação
              </CardTitle>
              <CardDescription>Revise e aprove ou rejeite conteúdo enviado pelos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum item pendente de moderação!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{item.type === "pet" ? "Pet" : "Evento"}</Badge>
                            <span className="text-sm text-muted-foreground">{formatDate(item.created_at)}</span>
                          </div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApprove(item.id, item.type)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(item.id, item.type)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estatísticas Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Taxa de Aprovação</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Pets Adotados</span>
                  <span className="font-semibold">142</span>
                </div>
                <div className="flex justify-between">
                  <span>Pets Reunidos</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between">
                  <span>Eventos Realizados</span>
                  <span className="font-semibold">23</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Pet aprovado para adoção</span>
                    <span className="text-xs text-muted-foreground ml-auto">2h atrás</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Novo evento cadastrado</span>
                    <span className="text-xs text-muted-foreground ml-auto">4h atrás</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Pet perdido reportado</span>
                    <span className="text-xs text-muted-foreground ml-auto">6h atrás</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Palavras-chave de Moderação</CardTitle>
              <CardDescription>Palavras que acionam revisão automática de conteúdo</CardDescription>
            </CardHeader>
            <CardContent>
              {moderationKeywords.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma palavra-chave configurada</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {moderationKeywords.map((keyword) => (
                    <Badge key={keyword.id} variant="secondary">
                      {keyword.keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
