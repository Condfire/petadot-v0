"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Calendar, MapPin, Info, Mail, Phone, LinkIcon } from "lucide-react"
import AdminAuthCheck from "@/components/admin-auth-check"
import Image from "next/image"
import { formatDateTime, mapEventType } from "@/lib/utils" // Import formatDateTime and mapEventType

interface EventDetailProps {
  params: {
    id: string
  }
}

interface EventData {
  id: string
  name: string // Changed from title
  description: string
  image_url: string
  location: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  start_date: string // Changed from date
  end_date?: string
  status: string
  registration_url?: string
  registration_required?: boolean
  max_participants?: number
  contact_email?: string
  contact_phone?: string
  event_type?: string
  created_at: string
  updated_at: string
  ongs: { name: string } | null
}

export default function AdminEventDetailPage({ params }: EventDetailProps) {
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select(`
            id, name, description, image_url, location, address, city, state, postal_code, country,
            start_date, end_date, status, registration_url, registration_required, max_participants,
            contact_email, contact_phone, event_type, created_at, updated_at,
            ongs(name)
          `) // Explicitly select columns, including start_date
          .eq("id", params.id)
          .single()

        if (error) {
          console.error("Erro ao buscar evento:", error)
          setError(`Erro ao buscar evento: ${error.message}`)
          setLoading(false)
          return
        }

        setEvent(data)
        setLoading(false)
      } catch (err: any) {
        console.error("Erro ao buscar evento:", err)
        setError(`Erro ao buscar evento: ${err.message}`)
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, supabase])

  if (loading) {
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

  if (error || !event) {
    return (
      <AdminAuthCheck>
        <div className="container py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error || "Evento não encontrado."}</AlertDescription>
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
      <div className="container py-8 md:py-12">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Detalhes do Evento
            </CardTitle>
            <CardDescription>Informações detalhadas sobre o evento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {event.image_url && (
              <div className="relative h-64 w-full rounded-md overflow-hidden">
                <Image src={event.image_url || "/placeholder.svg"} alt={event.name} fill className="object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Evento</Label>
                <p className="text-lg font-semibold">{event.name}</p>
              </div>
              <div className="space-y-2">
                <Label>ONG</Label>
                <p className="text-lg font-semibold">{event.ongs?.name || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <p className="text-muted-foreground">{event.description || "N/A"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  Data de Início
                </Label>
                <p>{formatDateTime(event.start_date)}</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  Data de Término
                </Label>
                <p>{event.end_date ? formatDateTime(event.end_date) : "Não informado"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                Local
              </Label>
              <p>{event.location}</p>
            </div>

            {(event.address || event.city || event.state || event.postal_code || event.country) && (
              <div className="space-y-2">
                <Label>Endereço Completo</Label>
                <p className="text-muted-foreground">
                  {[event.address, event.city, event.state, event.postal_code, event.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Info className="mr-1 h-4 w-4 text-muted-foreground" />
                  Status
                </Label>
                <p>{mapEventType(event.status)}</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Info className="mr-1 h-4 w-4 text-muted-foreground" />
                  Tipo de Evento
                </Label>
                <p>{mapEventType(event.event_type)}</p>
              </div>
            </div>

            {(event.contact_email || event.contact_phone) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.contact_email && (
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Mail className="mr-1 h-4 w-4 text-muted-foreground" />
                      Email de Contato
                    </Label>
                    <p>{event.contact_email}</p>
                  </div>
                )}
                {event.contact_phone && (
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Phone className="mr-1 h-4 w-4 text-muted-foreground" />
                      Telefone de Contato
                    </Label>
                    <p>{event.contact_phone}</p>
                  </div>
                )}
              </div>
            )}

            {event.registration_url && (
              <div className="space-y-2">
                <Label className="flex items-center">
                  <LinkIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                  URL de Inscrição
                </Label>
                <p>
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {event.registration_url}
                  </a>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inscrição Obrigatória?</Label>
                <p>{event.registration_required ? "Sim" : "Não"}</p>
              </div>
              <div className="space-y-2">
                <Label>Máximo de Participantes</Label>
                <p>{event.max_participants || "Não limitado"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Criado Em</Label>
                <p>{formatDateTime(event.created_at)}</p>
              </div>
              <div className="space-y-2">
                <Label>Última Atualização</Label>
                <p>{formatDateTime(event.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminAuthCheck>
  )
}
