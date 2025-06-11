"use client"

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

const EventosClientPage = () => {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [search, setSearch] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch("/api/eventos")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setEventos(data)
      } catch (error) {
        console.error("Could not fetch eventos:", error)
        toast({
          title: "Erro!",
          description: "Não foi possível carregar os eventos.",
          variant: "destructive",
        })
      }
    }

    fetchEventos()
  }, [])

  const filteredEventos = eventos.filter((evento) => {
    const searchTerm = search.toLowerCase()
    const matchesSearch =
      evento.nome.toLowerCase().includes(searchTerm) ||
      evento.local.toLowerCase().includes(searchTerm) ||
      evento.descricao.toLowerCase().includes(searchTerm)

    const matchesDate = date
      ? format(new Date(evento.data), "dd/MM/yyyy", { locale: ptBR }) === format(date, "dd/MM/yyyy", { locale: ptBR })
      : true

    return matchesSearch && matchesDate
  })

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
        <Input
          type="text"
          placeholder="Pesquisar eventos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              onSelect={setDate}
              disabled={(date) => date > new Date()}
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
          {filteredEventos.map((evento) => (
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

export default EventosClientPage
