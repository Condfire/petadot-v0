"use client"

import { useEffect, useState, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Edit, Trash, PlusCircle, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { mapEventType } from "@/lib/mappers"
import { formatDateTime } from "@/lib/utils" // Import formatDateTime
import AdminAuthCheck from "@/components/admin-auth-check"
import { PaginationControls } from "@/components/pagination-controls"

interface EventDB {
  id: string
  name: string // Changed from title
  description: string
  image_url: string
  location: string
  start_date: string // Changed from date
  end_date?: string
  status: string
  created_at: string
  ongs: { name: string } | null
}

const EVENTS_PER_PAGE = 10

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const fetchEvents = useCallback(
    async (page: number, term: string) => {
      setLoading(true)
      setError(null)
      const from = (page - 1) * EVENTS_PER_PAGE
      const to = from + EVENTS_PER_PAGE - 1

      try {
        let query = supabase.from("events").select(
          `
          id, name, description, image_url, location, start_date, end_date, status, created_at,
          ongs(name)
        `,
          { count: "exact" },
        )

        if (term) {
          query = query.ilike("name", `%${term}%`) // Changed from title to name
        }

        const {
          data,
          error: fetchError,
          count,
        } = await query
          .order("start_date", { ascending: false }) // Changed from date to start_date
          .range(from, to)

        if (fetchError) {
          console.error("Erro ao buscar eventos:", fetchError)
          setError(`Erro ao buscar eventos: ${fetchError.message}`)
          setEvents([])
          setTotalEvents(0)
          return
        }

        setEvents(data || [])
        setTotalEvents(count || 0)
      } catch (err: any) {
        console.error("Erro ao buscar eventos:", err)
        setError(`Erro ao buscar eventos: ${err.message}`)
        setEvents([])
        setTotalEvents(0)
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  useEffect(() => {
    fetchEvents(currentPage, searchTerm)
  }, [fetchEvents, currentPage, searchTerm])

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page on new search
    fetchEvents(1, searchTerm)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <AdminAuthCheck>
      <div className="container py-8 md:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Eventos</h1>
          <Button asChild>
            <Link href="/ongs/dashboard/eventos/cadastrar">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Evento
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Eventos</CardTitle>
            <CardDescription>Visualize e gerencie todos os eventos cadastrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Buscar por nome do evento..." // Changed from title to name
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : events.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum evento encontrado.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead> {/* Changed from Título to Nome */}
                        <TableHead>ONG</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Data de Início</TableHead> {/* Changed from Data to Data de Início */}
                        <TableHead>Status</TableHead>
                        <TableHead>Criado Em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.name}</TableCell> {/* Changed from title to name */}
                          <TableCell>{event.ongs?.name || "N/A"}</TableCell>
                          <TableCell>{event.location}</TableCell>
                          <TableCell>{formatDateTime(event.start_date)}</TableCell> {/* Use start_date */}
                          <TableCell>{mapEventType(event.status)}</TableCell>
                          <TableCell>{formatDateTime(event.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/ongs/dashboard/eventos/${event.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Link>
                              </Button>
                              <Button variant="destructive" size="sm" asChild>
                                <Link href={`/ongs/dashboard/eventos/${event.id}/delete`}>
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Excluir</span>
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls
                  totalItems={totalEvents}
                  itemsPerPage={EVENTS_PER_PAGE}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminAuthCheck>
  )
}
