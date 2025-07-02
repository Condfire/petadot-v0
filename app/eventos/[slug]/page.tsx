import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getEventBySlugOrId } from "@/lib/supabase"
import { Calendar, Clock, MapPin, Users, ExternalLink, ArrowLeft, Share2 } from "lucide-react"
import { validate as isUuid } from "uuid"

export const revalidate = 3600 // Revalidate at most every hour

// Atualizar os parâmetros para usar slug em vez de id
interface EventDetailsPageProps {
  params: {
    slug: string
  }
}

// Atualizar a função generateMetadata para usar slug
export async function generateMetadata({ params }: EventDetailsPageProps): Promise<Metadata> {
  const slugOrId = params.slug
  const isUuidValue = isUuid(slugOrId)

  const event = await getEventBySlugOrId(slugOrId)

  if (!event) {
    return {
      title: "Evento não encontrado | PetAdot",
      description: "O evento que você está procurando não foi encontrado.",
    }
  }

  return {
    title: `${event.title} | Eventos | PetAdot`,
    description: `${event.title} - ${event.description.substring(0, 150)}${event.description.length > 150 ? "..." : ""}`,
  }
}

// Atualizar a função principal para usar slug
export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const slugOrId = params.slug
  const isUuidValue = isUuid(slugOrId)

  const event = await getEventBySlugOrId(slugOrId)

  if (!event) {
    notFound()
  }

  // Formatar datas
  const eventDate = new Date(event.start_date)
  const formattedDate = eventDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const formattedTime = eventDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Verificar se o evento já aconteceu
  const isPastEvent = eventDate < new Date()

  // Verificar se o evento tem data de término
  const hasEndDate = event.end_date && event.end_date !== event.start_date

  // Formatar data de término, se existir
  const endDate = hasEndDate ? new Date(event.end_date!) : null
  const formattedEndDate = endDate
    ? endDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null

  // Construir endereço completo
  const addressParts = []
  if (event.address) addressParts.push(event.address)
  if (event.city) addressParts.push(event.city)
  if (event.state) addressParts.push(event.state)
  if (event.postal_code) addressParts.push(event.postal_code)
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null

  return (
    <div className="container py-8 md:py-12">
      <Link
        href="/eventos"
        className="flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para lista de eventos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Imagem e informações principais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={event.image_url || "/placeholder.svg?height=400&width=800&query=pet+event"}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            {isPastEvent ? (
              <Badge variant="secondary" className="absolute top-4 right-4">
                Evento passado
              </Badge>
            ) : (
              <Badge variant="primary" className="absolute top-4 right-4 animate-pulse-slow">
                Próximo evento
              </Badge>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <Button variant="ghost" size="icon" aria-label="Compartilhar">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            {event.ongs && (
              <p className="text-primary mt-1">
                Organizado por:{" "}
                <Link href={`/ongs/${event.ongs.id}`} className="hover:underline">
                  {event.ongs.name}
                </Link>
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sobre o evento</h2>
            <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
          </div>
        </div>

        {/* Informações do evento */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Data</p>
                    <p className="text-muted-foreground">{formattedDate}</p>
                    {hasEndDate && <p className="text-muted-foreground">até {formattedEndDate}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Horário</p>
                    <p className="text-muted-foreground">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Local</p>
                    <p className="text-muted-foreground">{event.location}</p>
                    {fullAddress && <p className="text-muted-foreground text-sm">{fullAddress}</p>}
                  </div>
                </div>
              </div>

              {!isPastEvent && (
                <div className="pt-2">
                  <Button className="w-full gap-2">
                    <Users className="h-4 w-4" /> Confirmar Presença
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organizador */}
          {event.ongs && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Organizador</h2>
                <div className="flex items-center gap-4 mb-4">
                  {event.ongs.logo_url && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={event.ongs.logo_url || "/placeholder.svg"}
                        alt={event.ongs.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{event.ongs.name}</p>
                    {event.ongs.city && <p className="text-sm text-muted-foreground">{event.ongs.city}</p>}
                  </div>
                </div>
                {event.ongs.contact && (
                  <p className="text-sm text-muted-foreground mb-4">
                    <span className="font-medium">Contato:</span> {event.ongs.contact}
                  </p>
                )}
                {event.ongs.id && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href={`/ongs/${event.ongs.id}`}>
                      <ExternalLink className="h-4 w-4" /> Ver Perfil da ONG
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="text-xl font-bold mb-4">Informações adicionais</h3>
        {isPastEvent ? (
          <p>
            Este evento já aconteceu. Fique atento às nossas redes sociais e ao site para informações sobre os próximos
            eventos.
          </p>
        ) : (
          <>
            <p className="mb-4">Participe deste evento e ajude a causa animal. Sua presença é muito importante!</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Chegue com antecedência para garantir sua participação</li>
              <li>Traga seus amigos e familiares</li>
              <li>Compartilhe o evento nas redes sociais</li>
              <li>Em caso de dúvidas, entre em contato com o organizador</li>
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
