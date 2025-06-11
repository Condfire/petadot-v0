"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, TrendingUp, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface EventAnalytics {
  totalEvents: number
  upcomingEvents: number
  pastEvents: number
  eventsByCity: { city: string; count: number }[]
  eventsByType: { type: string; count: number }[]
  recentEvents: any[]
}

export default function EventAnalyticsPage() {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch all events
      const { data: allEvents, error } = await supabase.from("events").select("*").eq("status", "approved")

      if (error) {
        console.error("Erro ao buscar eventos:", error)
        return
      }

      const events = allEvents || []
      const now = new Date()

      // Calculate statistics
      const upcomingEvents = events.filter((event) => new Date(event.start_date) > now).length

      const pastEvents = events.filter((event) => new Date(event.start_date) <= now).length

      // Group by city
      const cityGroups = events.reduce(
        (acc, event) => {
          const city = event.city || "Não informado"
          acc[city] = (acc[city] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const eventsByCity = Object.entries(cityGroups)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Group by type
      const typeGroups = events.reduce(
        (acc, event) => {
          const type = event.event_type || "Não informado"
          acc[type] = (acc[type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const eventsByType = Object.entries(typeGroups)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)

      // Recent events
      const recentEvents = events
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setAnalytics({
        totalEvents: events.length,
        upcomingEvents,
        pastEvents,
        eventsByCity,
        eventsByType,
        recentEvents,
      })
    } catch (error) {
      console.error("Erro ao carregar analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics de Eventos</h1>
        <p className="text-muted-foreground">Estatísticas e insights sobre os eventos da plataforma</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos cadastrados na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.upcomingEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos futuros agendados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Realizados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.pastEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos já realizados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events by City */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Eventos por Cidade
            </CardTitle>
            <CardDescription>Cidades com mais eventos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.eventsByCity.length === 0 ? (
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-3">
                {analytics?.eventsByCity.map((item, index) => (
                  <div key={item.city} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span>{item.city}</span>
                    </div>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tipos de Evento
            </CardTitle>
            <CardDescription>Distribuição por tipo de evento</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.eventsByType.length === 0 ? (
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-3">
                {analytics?.eventsByType.map((item, index) => (
                  <div key={item.type} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span>{item.type}</span>
                    </div>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>Últimos eventos cadastrados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.recentEvents.length === 0 ? (
              <p className="text-muted-foreground">Nenhum evento encontrado</p>
            ) : (
              <div className="space-y-4">
                {analytics?.recentEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.city}, {event.state}
                        </p>
                      </div>
                      <Badge variant="outline">{formatDate(event.start_date)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
