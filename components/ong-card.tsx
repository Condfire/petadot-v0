import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, PawPrint } from "lucide-react"

interface OngCardProps {
  id: string
  name: string
  logo: string
  city?: string
  state?: string
  contact_phone: string
  petCount: number
  slug?: string
}

export function OngCard({ id, name, logo, city, state, contact_phone, petCount, slug }: OngCardProps) {
  return (
    <Link href={`/ongs/${slug || id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="relative h-40 bg-muted flex items-center justify-center">
          {logo ? (
            <Image
              src={logo || "/placeholder.svg"}
              alt={`Logo da ${name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground">Sem logo</div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{name}</h3>

          {(city || state) && (
            <div className="flex items-start mb-2">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground line-clamp-1">
                {[city, state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          <div className="flex items-start mb-2">
            <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{contact_phone}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center">
            <PawPrint className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {petCount} {petCount === 1 ? "pet" : "pets"}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            Ver perfil
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default OngCard
