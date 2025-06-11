"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Evento } from "@/app/eventos/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useAuth } from "@/app/auth-provider"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import EventoForm from "./components/EventoForm"
import { EventCard } from "@/components/event-card"

interface EventosClientPageProps {
  initialEvents: Evento[]
  totalEvents: number | null
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
  // Export nomeado corrigido
  initialEvents,
  totalEvents,
  currentPage,
  pageSize,
  initialFilters,
}: EventosClientPageProps) {
  const [eventos, setEventos] = useState<Evento[]>(initialEvents)
  const [search, setSearch] = useState(initialFilters.name || "")
  const [date, setDate] = useState<Date | undefined>(
    initialFilters.start_date ? new Date(initialFilters.start_date) : undefined,
  )
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [canCreateEvent, setCanCreateEvent] = useState(false)

  console.log("Client Page: initialEvents prop", initialEvents) // Manter para depuração se necessário
  console.log("Client Page: totalEvents prop", totalEvents) // Manter para depuração se necessário

  useEffect(() => {
    const checkOng = async () => {
      if (!user) {
        setCanCreateEvent(false)
        return
      }

      if (user.type === "ngo_admin") {
        setCanCreateEvent(true)
        return
      }

      try {
        const { data, error } = await supabase.from("ongs").select("id").eq("user_id", user.id).maybeSingle()

        if (error) {
          console.error("Erro ao verificar ONG do usuário:", error)
        }

        setCanCreateEvent(!!data)
      } catch (err) {
        console.error("Erro ao verificar ONG do usuário:", err)
        setCanCreateEvent(false)
      }
    }

    checkOng()
  }, [user])

  useEffect(() => {
    const fetchEventos = async () => {
      const params = new URLSearchParams()
      if (search) params.set("name", search)
      if (date) params.set("start_date", format(date, "yyyy-MM-dd"))
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

    if (
      search !== (initialFilters.name || "") ||
      (date && format(date, "yyyy-MM-dd") !== (initialFilters.start_date || "")) ||
      (!date && initialFilters.start_date)
    ) {
      fetchEventos()
    }
  }, [search, date, currentPage, pageSize, initialFilters])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      newSearchParams.set("name", e.target.value)
    } else {
      newSearchParams.delete("name")
    }
    router.push(`/eventos?${newSearchParams.toString()}`)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (selectedDate) {
      newSearchParams.set("start_date", format(selectedDate, "yyyy-MM-dd"))
    } else {
      newSearchParams.delete("start_date")
    }
    router.push(`/eventos?${newSearchParams.toString()}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Eventos</h1>
        {canCreateEvent && (
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
        )}
        {user && !canCreateEvent && (
          <p className="text-sm text-muted-foreground">
            Não possui uma ONG?{" "}
            <Link href="/ongs/register" className="underline">
              Cadastre sua ONG
            </Link>
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
        <Input
          type="text"
          placeholder="Pesquisar eventos..."
          value={search}
          onChange={handleSearchChange}
          className="flex-grow"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
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
              disabled={(date) => date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {eventos.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhum evento encontrado com os filtros aplicados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {eventos.map((evento) => (
            <EventCard key={evento.id} {...evento} />
          ))}
        </div>
      )}
    </div>
  )
}
