import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin } from "lucide-react"
import { formatDateTime, mapEventType } from "@/lib/utils" // Importar de lib/utils

interface EventCardProps {
  id: string
  name: string
  description: string
  image_url?: string
  location?: string
  city?: string
  state?: string
  start_date: string
  end_date?: string
  event_type?: string
  slug?: string
}

export function EventCard({
  // Exportar como named export
  id,
  name,
  description,
  image_url,
  location,
  city,
  state,
  start_date,
  end_date,
  event_type,
  slug,
}: EventCardProps) {
  const displayLocation = location || (city && state ? `${city}, ${state}` : city || state)
  const displayDate = formatDateTime(start_date)
  const displayEventType = mapEventType(event_type)

  const detailUrl = slug ? `/eventos/${slug}` : `/eventos/${id}`

  return (
    <Link href={detailUrl} className="block">
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        <div className="relative w-full h-48">
          <Image
            src={image_url || "/placeholder.svg?height=192&width=384&text=Evento"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            unoptimized={image_url?.includes("placeholder.svg")}
          />
          {event_type && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">{displayEventType}</Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold line-clamp-2">{name}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-sm">
            <CalendarDays className="w-4 h-4" />
            {displayDate}
          </CardDescription>
          {displayLocation && (
            <CardDescription className="flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4" />
              {displayLocation}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Ver Detalhes
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
