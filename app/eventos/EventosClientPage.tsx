"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Evento } from "@/app/eventos/types"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import EventoForm from "./components/EventoForm"
import { mapEventType } from "@/lib/utils"

interface EventosClientPageProps {
  initialEvents: Evento[]
  totalEvents: number | null
  currentPage: number
  pageSize: number
  initialFilters: {
    title?: string
    city?: string
    state?: string
    date?: string
  }
}

export function EventosClientPage({
  initialEvents,
  totalEvents,
  currentPage,
  pageSize,
  initialFilters,
}: EventosClientPageProps) {
  const [eventos, setEventos] = useState<Evento[]>(initialEvents)
  const [search, setSearch] = useState(initialFilters.title || "")
  const [date, setDate] = useState<Date | undefined>(initialFilters.date ? new Date(initialFilters.date) : undefined)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // useEffect para buscar eventos quando filtros ou paginação mudam
  useEffect(() => {
    const fetchEventos = async () => {
      const params = new URLSearchParams()
      if (search) params.set("title", search)
      if (date) params.set("date", format(date, "yyyy-MM-dd"))
      params.set("page", currentPage.toString())
      params.set("pageSize", pageSize.toString())

      try {
        const response = await fetch(`/api/eventos?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const { events: fetchedEvents } = await response.json()
        setEventos(fetchedEvents)
      } catch (error) {
        console.error("Could not fetch eventos:", error)
        toast({
          title: "Erro!",
          description: "Não foi possível carregar os eventos.",
          variant: "destructive",
        })
      }
    }

    // Só busca se os filtros mudarem ou se for a primeira renderização e initialEvents estiver vazio
    // A busca inicial é feita pelo Server Component
    if (
      search !== (initialFilters.title || "") ||
      (date && format(date, "yyyy-MM-dd") !== (initialFilters.date || "")) ||
      (!date && initialFilters.date) // if date was set initially but now cleared
    ) {
      fetchEventos()
    }
  }, [search, date, currentPage, pageSize, initialFilters])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    // Atualizar URL para refletir o filtro de busca
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      newSearchParams.set("title", e.target.value)
    } else {
      newSearchParams.delete("title")
    }
    router.push(`/eventos?${newSearchParams.toString()}`)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    // Atualizar URL para refletir o filtro de data
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (selectedDate) {
      newSearchParams.set("date", format(selectedDate, "yyyy-MM-dd"))
    } else {
      newSearchParams.delete("date")
    }
    router.push(`/eventos?${newSearchParams.toString()}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Criar Evento</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Evento</DialogTitle>
              <DialogDescription>Crie um novo evento para ser exibido na plataforma.</DialogDescription>
            </DialogHeader>
            <EventoForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 mb-4">
        <Input type="text" placeholder="Pesquisar eventos..." value={search} onChange={handleSearchChange} />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecionar Data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date("1900-01-01")} // Permite selecionar datas passadas para busca
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Table>
        <TableCaption>Lista de eventos.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventos.map((evento) => (
            <TableRow key={evento.id}>
              <TableCell>{evento.nome}</TableCell>
              <TableCell>{format(new Date(evento.data), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
              <TableCell>{evento.local}</TableCell>
              <TableCell>{mapEventType(evento.tipo)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
