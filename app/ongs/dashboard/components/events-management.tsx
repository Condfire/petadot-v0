"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Edit, Eye, MapPin, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  status: string
  image_url: string
  created_at: string
}

interface EventsManagementProps {
  events: Event[]
}

export default function EventsManagement({ events }: EventsManagementProps) {
  const router = useRouter()

  const now = new Date()
  const upcomingEvents = events.filter((event) => new Date(event.date) > now)
  const pastEvents = events.filter((event) => new Date(event.date) <= now)
  const pendingEvents = events.filter((event) => event.status === "pending")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>
      case "approved":
        return <Badge variant="default">Aprovado</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const EventCard = ({ event }: { event: Event }) => (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="relative h-16 w-16 rounded-lg overflow-hidden">
        <Image
          src={event.image_url || "/placeholder.svg?height=64&width=64&query=event"}
          alt={event.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{event.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Calendar className="h-3 w-3" />
          {formatDate(event.date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {event.location}
        </div>
        <div className="flex items-center gap-2 mt-2">{getStatusBadge(event.status)}</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/eventos/${event.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Evento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/ongs/dashboard/eventos/${event.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/ongs/dashboard/eventos/${event.id}/delete`)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gerenciar Eventos</CardTitle>
            <CardDescription>Gerencie todos os eventos da sua ONG</CardDescription>
          </div>
          <Button onClick={() => router.push("/ongs/dashboard/eventos/cadastrar")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Próximos ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="pending">Pendentes ({pendingEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Realizados ({pastEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum evento próximo</p>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingEvents.length > 0 ? (
              pendingEvents.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum evento pendente de aprovação</p>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum evento realizado</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
