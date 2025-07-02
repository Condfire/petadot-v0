import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getEventBySlugOrId } from "@/lib/supabase"
import { formatDateTime, mapEventType } from "@/lib/utils"
import { getImagePath } from "@/lib/image-path" // Importar getImagePath
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Mail, Phone, LinkIcon, Building2 } from "lucide-react"
import type { Metadata } from "next"

interface EventPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await getEventBySlugOrId(params.slug)

  if (!event) {
    return {}
  }

  const imageUrl = getImagePath(event.image_url)

  return {
    title: event.name,
    description: event.description?.substring(0, 160) || `Detalhes do evento ${event.name}`,
    openGraph: {
      title: event.name,
      description: event.description?.substring(0, 160) || `Detalhes do evento ${event.name}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description: event.description?.substring(0, 160) || `Detalhes do evento ${event.name}`,
      images: [imageUrl],
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlugOrId(params.slug)

  if (!event) {
    notFound()
  }

  const displayLocation =
    event.location || (event.city && event.state ? `${event.city}, ${event.state}` : event.city || event.state)
  const displayDate = formatDateTime(event.start_date)
  const displayEndDate = event.end_date ? formatDateTime(event.end_date) : null
  const displayEventType = mapEventType(event.event_type)
  const imageUrl = getImagePath(event.image_url) // Usar getImagePath aqui

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-2xl overflow-hidden">
        {event.image_url && (
          <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-800">
            <Image
              src={imageUrl || "/placeholder.svg"} // Usar a URL processada por getImagePath
              alt={event.name || "Imagem do Evento"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              priority
              unoptimized={event.image_url?.includes("placeholder.svg")}
            />
            {event.event_type && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-base px-3 py-1">
                {displayEventType}
              </Badge>
            )}
          </div>
        )}
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight">
            {event.name}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 text-lg text-foreground">
              <CalendarDays className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold">Data:</p>
                <p>
                  {displayDate} {displayEndDate && ` - ${displayEndDate}`}
                </p>
              </div>
            </div>
            {displayLocation && (
              <div className="flex items-center gap-3 text-lg text-foreground">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Local:</p>
                  <p>{displayLocation}</p>
                  {event.address && <p className="text-sm text-muted-foreground">{event.address}</p>}
                </div>
              </div>
            )}
          </div>

          {(event.contact_email || event.contact_phone || event.registration_url) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 mt-6">
              {event.contact_email && (
                <div className="flex items-center gap-3 text-lg text-foreground">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Email para Contato:</p>
                    <Link href={`mailto:${event.contact_email}`} className="text-blue-500 hover:underline">
                      {event.contact_email}
                    </Link>
                  </div>
                </div>
              )}
              {event.contact_phone && (
                <div className="flex items-center gap-3 text-lg text-foreground">
                  <Phone className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Telefone para Contato:</p>
                    <Link
                      href={`tel:${event.contact_phone.replace(/\D/g, "")}`}
                      className="text-blue-500 hover:underline"
                    >
                      {event.contact_phone}
                    </Link>
                  </div>
                </div>
              )}
              {event.registration_url && (
                <div className="flex items-center gap-3 text-lg text-foreground">
                  <LinkIcon className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold">Link de Inscrição:</p>
                    <Link
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Acessar Inscrição
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {event.ongs && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 mt-6">
              <div className="flex items-center gap-3 text-lg text-foreground">
                <Building2 className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Organizado por:</p>
                  <Link href={`/ongs/${event.ongs.id}`} className="text-blue-500 hover:underline">
                    {event.ongs.name}
                  </Link>
                  {event.ongs.city && <p className="text-sm text-muted-foreground">{event.ongs.city}</p>}
                </div>
              </div>
            </div>
          )}

          {event.registration_required && (
            <div className="border-t pt-6 mt-6">
              <Badge variant="secondary" className="text-base px-3 py-1">
                Inscrição Necessária
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
