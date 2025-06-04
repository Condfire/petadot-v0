"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, MapPinIcon } from "lucide-react"

interface EventCardProps {
  id: string
  name: string
  image?: string
  date: string
  location: string
  description: string
  ong?: string
  isUpcoming?: boolean
  slug?: string
}

export function EventCard({ id, name, image, date, location, description, ong, isUpcoming, slug }: EventCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  // Atualizar a função getDetailUrl para usar slug quando disponível
  const getDetailUrl = () => {
    return `/eventos/${slug || id}`
  }

  return (
    <Card className="overflow-hidden card-hover group">
      {image && (
        <Link href={getDetailUrl()} className="block aspect-video relative overflow-hidden">
          <Image
            src={image || "/placeholder.svg?height=200&width=400&query=pet+event"}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
      )}
      <CardHeader className="p-4">
        <Link href={getDetailUrl()}>
          <CardTitle className="text-xl hover:text-primary transition-colors">{name}</CardTitle>
        </Link>
        {ong && <CardDescription className="font-medium text-primary">Organizado por: {ong}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center text-sm">
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-sm">
          <MapPinIcon className="mr-2 h-4 w-4 text-primary" />
          <span>{location}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{description}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button className="w-full group-hover:bg-primary/90 transition-all" asChild>
          <Link href={getDetailUrl()}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default EventCard
