import Image from "next/image"
import Link from "next/link"
import { MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Partner {
  id: string
  name: string
  description: string
  image_url: string
  website_url?: string
  city?: string
  state?: string
}

interface PartnerCardProps {
  partner: Partner
}

export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02] duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={partner.image_url || "/placeholder.svg?height=400&width=600&query=empresa"}
          alt={partner.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
        <p className="text-gray-300 mb-4 line-clamp-3">{partner.description}</p>

        {(partner.city || partner.state) && (
          <div className="flex items-center text-gray-400 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{[partner.city, partner.state].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {partner.website_url && (
          <Button asChild className="w-full mt-2" variant="outline">
            <Link
              href={partner.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              Visitar site
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
