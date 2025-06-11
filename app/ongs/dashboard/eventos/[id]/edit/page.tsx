"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"
import { getEventForEdit, updateEvent } from "@/app/actions/event-actions"
import { Loader2, Calendar, MapPin } from "lucide-react"

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    address: "",
    city: "",
    state: "",
    image_url: "",
  })

  useEffect(() => {
    async function loadEvent() {
      try {
        const result = await getEventForEdit(eventId)

        if (!result.success) {
          setError(result.error || "Erro ao carregar evento")
          setIsLoading(false)
          return
        }

        // Formatar a data para o formato YYYY-MM-DD
        const eventDate = result.event.start_date ? new Date(result.event.start_date) : new Date()
        const formattedDate = eventDate.toISOString().split("T")[0]

        setFormData({
          name: result.event.name || "",
          description: result.event.description || "",
          date: formattedDate,
          location: result.event.location || "",
          address: result.event.address || "",
          city: result.event.city || "",
          state: result.event.state || "",
          image_url: result.event.image_url || "",
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar evento:", error)
        setError("Ocorreu um erro ao carregar o evento")
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.description || !formData.date || !formData.location) {
        setError("Preencha todos os campos obrigatórios")
        setIsSaving(false)
        return
      }

      const result = await updateEvent(eventId, formData)

      if (!result.success) {
        setError(result.error || "Erro ao atualizar evento")
        setIsSaving(false)
        return
      }

      setSuccess("Evento atualizado com sucesso!")

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/ongs/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Erro ao atualizar evento:", error)
      setError("Ocorreu um erro ao atualizar o evento")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2">Carregando evento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Editar Evento</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Evento</CardTitle>
          <CardDescription>Atualize os detalhes do seu evento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Evento *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome do evento"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o evento"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data do Evento *
                  </Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                </div>

                <div>
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Local do Evento *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Nome do local"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Cidade" />
                </div>

                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleChange} placeholder="Estado" />
                </div>
              </div>

              <div>
                <Label>Imagem do Evento</Label>
                <div className="mt-2">
                  <ImageUpload
                    value={formData.image_url}
                    onChange={handleImageUpload}
                    onRemove={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione uma imagem para o seu evento. Recomendamos imagens no formato 16:9.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
