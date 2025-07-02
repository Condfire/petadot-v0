"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Calendar } from "lucide-react"

export default function EventosClientPage({ initialEvents, totalEvents, currentPage, pageSize, initialFilters }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState(initialEvents || [])
  const [filters, setFilters] = useState(initialFilters || {})
  const [activeTab, setActiveTab] = useState("upcoming")

  const totalPages = Math.ceil(totalEvents / pageSize)

  // Separar eventos futuros e passados
  const currentDate = new Date()
  const upcomingEvents = events.filter((event) => new Date(event.date) >= currentDate)
  const pastEvents = events.filter((event) => new Date(event.date) < currentDate)

  // Verificar se estamos usando os nomes corretos das colunas
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0] // Formato YYYY-MM-DD
      setFilters((prev) => ({ ...prev, date: formattedDate }))
    } else {
      setFilters((prev) => {
        const newFilters = { ...prev }
        delete newFilters.date
        return newFilters
      })
    }
  }

  // Função para atualizar os filtros e redirecionar
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }

    // Remover filtros vazios
    Object.keys(updatedFilters).forEach((key) => {
      if (!updatedFilters[key]) delete updatedFilters[key]
    })

    // Construir query string
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      params.set(key, value.toString())
    })

    // Resetar para página 1 quando os filtros mudam
    params.set("page", "1")

    router.push(`/eventos?${params.toString()}`)
  }

  // Função para navegar entre páginas
  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/eventos?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <Input
                placeholder="Buscar por título"
                value={filters.title || ""}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && updateFilters(filters)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <Select value={filters.state || ""} onValueChange={(value) => updateFilters({ state: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  {/* Adicionar mais estados conforme necessário */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Cidade</label>
              <Input
                placeholder="Filtrar por cidade"
                value={filters.city || ""}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && updateFilters(filters)}
              />
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={() => updateFilters(filters)}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para eventos futuros e passados */}
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
          <TabsTrigger value="past">Eventos Passados</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="h-48 relative">
                    <img
                      src={event.image_url || "/placeholder.svg?height=192&width=384&query=pet+event"}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{event.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">Local: {event.location}</p>
                    <p className="text-sm text-gray-600 mb-2">Organização: {event.ongs?.name || "Não informado"}</p>
                    <p className="text-sm line-clamp-2 mb-4">{event.description}</p>
                    <Button asChild className="w-full">
                      <Link href={`/eventos/${event.id}`}>Ver Detalhes</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Não há eventos futuros agendados no momento.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                  <div className="h-48 relative">
                    <img
                      src={event.image_url || "/placeholder.svg?height=192&width=384&query=pet+event"}
                      alt={event.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                    />
                    <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{event.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">Local: {event.location}</p>
                    <p className="text-sm text-gray-600 mb-2">Organização: {event.ongs?.name || "Não informado"}</p>
                    <p className="text-sm line-clamp-2 mb-4">{event.description}</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/eventos/${event.id}`}>Ver Detalhes</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Não há eventos passados registrados.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) goToPage(currentPage - 1)
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    goToPage(i + 1)
                  }}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) goToPage(currentPage + 1)
                }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
