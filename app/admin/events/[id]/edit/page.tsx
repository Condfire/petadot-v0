"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AdminAuthCheck from "@/components/admin-auth-check"
import Image from "next/image"
import { mapEventDBToUI, mapEventUIToDB, type EventFormUI, type EventDB } from "@/lib/mappers" // Import mappers and types

export default function EditEventPage({ params }: { params: { id: string } }) {
  const [eventUI, setEventUI] = useState<EventFormUI | null>(null) // Use EventFormUI
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase.from("events").select(`*, ongs(name)`).eq("id", params.id).single()

        if (error) {
          console.error("Erro ao buscar evento:", error)
          setError(`Erro ao buscar evento: ${error.message}`)
          setIsLoading(false)
          return
        }

        if (data) {
          setEventUI(mapEventDBToUI(data as EventDB)) // Map DB data to UI format
        }
        setIsLoading(false)
      } catch (error: any) {
        console.error("Erro ao buscar evento:", error)
        setError(`Erro ao buscar evento: ${error.message}`)
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEventUI((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setEventUI((prev: any) => ({ ...prev, status: value })) // Status is not in EventFormUI, handle separately or add to it
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      if (!eventUI) {
        setError("Dados do evento não carregados.")
        setIsSaving(false)
        return
      }

      const eventDBData = mapEventUIToDB(eventUI) // Map UI data to DB format

      const { error } = await supabase
        .from("events")
        .update({
          name: eventDBData.name, // Use name
          description: eventDBData.description,
          start_date: eventDBData.start_date, // Use start_date
          end_date: eventDBData.end_date, // Use end_date
          location: eventDBData.location,
          address: eventDBData.address,
          city: eventDBData.city,
          state: eventDBData.state,
          postal_code: eventDBData.postal_code,
          image_url: eventDBData.image_url,
          status: (eventUI as any).status, // Cast to any to access status
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) {
        console.error("Erro ao atualizar evento:", error)
        setError(`Erro ao atualizar evento: ${error.message}`)
        setIsSaving(false)
        return
      }

      // Revalidar a página de eventos
      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: "/eventos" }),
      })

      setSuccess(true)
      setIsSaving(false)

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/admin/events")
        router.refresh()
      }, 2000)
    } catch (error: any) {
      console.error("Erro ao atualizar evento:", error)
      setError(`Erro ao atualizar evento: ${error.message}`)
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminAuthCheck>
        <div className="container py-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </AdminAuthCheck>
    )
  }

  if (!eventUI) {
    return (
      <AdminAuthCheck>
        <div className="container py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>Evento não encontrado.</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </AdminAuthCheck>
    )
  }

  return (
    <AdminAuthCheck>
      <div className="container py-10">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Editar Evento
            </CardTitle>
            <CardDescription>
              Editando evento: <strong>{eventUI.name}</strong> {/* Use eventUI.name */}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assuming event.image_url is still available from the fetched data */}
            {/* You might need to fetch the full event object if only eventUI is state */}
            {/* For now, let's assume event.image_url is part of the initial fetch and accessible */}
            {/* If not, you'd need to pass it down or refetch it */}
            {/* For simplicity, I'll assume the original `event` object (from fetchEvent) is still available or its image_url is passed */}
            {/* For this example, I'll use a placeholder if event.image_url is not directly available from eventUI */}
            {eventUI.image_url && (
              <div className="mb-4">
                <Label>Imagem do Evento</Label>
                <div className="relative h-48 w-full rounded-md overflow-hidden mt-2">
                  <Image
                    src={eventUI.image_url || "/placeholder.svg"}
                    alt={eventUI.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Evento</Label>
              <Input id="name" name="name" value={eventUI.name} onChange={handleChange} /> {/* Use eventUI.name */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={eventUI.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date_ui">Data de Início</Label> {/* Changed to start_date_ui */}
                <Input
                  id="start_date_ui"
                  name="start_date_ui"
                  type="date"
                  value={eventUI.start_date_ui}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time_ui">Horário de Início</Label> {/* Changed to start_time_ui */}
                <Input
                  id="start_time_ui"
                  name="start_time_ui"
                  type="time"
                  value={eventUI.start_time_ui}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date_ui">Data de Término (opcional)</Label> {/* Changed to end_date_ui */}
              <Input
                id="end_date_ui"
                name="end_date_ui"
                type="date"
                value={eventUI.end_date_ui || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input id="location" name="location" value={eventUI.location} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={(eventUI as any).status} onValueChange={handleStatusChange}>
                {" "}
                {/* Cast to any to access status */}
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assuming event.ongs is still available from the fetched data */}
            <div className="space-y-2">
              <Label>ONG</Label>
              <Input value={(eventUI as any).ongs?.name || "ONG não especificada"} disabled />{" "}
              {/* Access ong name from original fetched data */}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-100 text-green-800 border-green-200">
                <AlertTitle>Sucesso!</AlertTitle>
                <AlertDescription>
                  Evento atualizado com sucesso. Você será redirecionado em instantes...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => router.back()} disabled={isSaving || success}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || success}>
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminAuthCheck>
  )
}
