"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EventCard } from "@/components/event-card"
import { PaginationControls } from "@/components/pagination-controls"
import { states, citiesByState } from "@/lib/constants"
import type { Event } from "@/lib/types"

interface EventosClientPageProps {
  initialEvents: Event[]
  totalEvents: number
  currentPage: number
  pageSize: number
  initialFilters: {
    name?: string
    city?: string
    state?: string
    start_date?: string
  }
}

export function EventosClientPage({
  initialEvents,
  totalEvents,
  currentPage,
  pageSize,
  initialFilters,
}: EventosClientPageProps) {
  // Garante que events seja sempre um array, mesmo que initialEvents seja null/undefined
  const [events, setEvents] = useState<Event[]>(initialEvents ?? [])
  const [filters, setFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalEvents / pageSize)

  useEffect(() => {
    // Atualiza o estado de events quando a prop initialEvents muda, garantindo que seja um array
    setEvents(initialEvents ?? [])
  }, [initialEvents])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })
    newSearchParams.set("page", "1")
    router.push(`/eventos?${newSearchParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("page", page.toString())
    router.push(`/eventos?${newSearchParams.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <Card className="p-6 rounded-2xl shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Filtrar Eventos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Nome do Evento"
            value={filters.name || ""}
            onChange={(e) => handleFilterChange("name", e.target.value)}
          />
          <Select
            value={filters.state || ""}
            onValueChange={(value) => {
              handleFilterChange("state", value)
              handleFilterChange("city", "")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.city || ""}
            onValueChange={(value) => handleFilterChange("city", value)}
            disabled={!filters.state}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Cidades</SelectItem>
              {filters.state &&
                citiesByState[filters.state]?.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Data do Evento"
            value={filters.start_date || ""}
            onChange={(e) => handleFilterChange("start_date", e.target.value)}
          />
          <Button onClick={applyFilters} className="w-full md:col-span-2 lg:col-span-4">
            Aplicar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Event List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(pageSize)].map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-soft animate-pulse">
              <div className="w-full h-48 bg-gray-300 rounded-t-2xl" />
              <CardContent className="p-4 space-y-2">
                <div className="h-6 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-4 bg-gray-300 rounded w-full" />
                <div className="h-10 bg-gray-300 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Garante que events é um array antes de verificar o comprimento e mapear */}
          {(events ?? []).length === 0 ? (
            <p className="text-center text-gray-500">Nenhum evento encontrado com os filtros aplicados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Garante que events é um array antes de mapear */}
              {(events ?? []).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalEvents > pageSize && (
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  )
}
