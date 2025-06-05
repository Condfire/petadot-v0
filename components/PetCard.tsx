import type React from "react"
import Image from "next/image" // Using Next.js Image for optimization
import Link from "next/link"
import { Badge } from "@/components/ui/badge" // Assuming you use shadcn/ui Badge
import { Button } from "@/components/ui/button"

// Define a more specific Pet type if available, e.g., from lib/types.ts
interface PetType {
  id: string | number
  name: string
  slug: string // Assuming pets have slugs for their detail pages
  category: "adoption" | "lost" | "found" | string // Be more specific if possible
  description?: string
  age?: string | number
  species?: string
  breed?: string
  status?: string
  image_url?: string | null
  main_image_url?: string | null
  city?: string
  state?: string
  // Add other relevant fields
}

interface PetCardProps {
  pet: PetType
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  if (!pet) {
    return null
  }

  const { status, name, image_url, main_image_url, slug, category } = pet

  const currentStatusNormalized = typeof status === "string" ? status.toLowerCase() : ""
  const hiddenStatuses = ["pending", "pendente", "rejected", "rejeitado"]

  if (hiddenStatuses.includes(currentStatusNormalized)) {
    return null // Do not render the card for pets with these statuses
  }

  const displayImageUrl =
    main_image_url || image_url || `/placeholder.svg?width=300&height=200&query=${pet.species || "pet"}`

  // Determine the link to the pet's detail page
  // This might need adjustment based on your routing structure
  let detailPageLink = "#"
  if (slug) {
    if (category === "adoption") detailPageLink = `/adocao/${slug}`
    else if (category === "lost") detailPageLink = `/perdidos/${slug}`
    else if (category === "found") detailPageLink = `/encontrados/${slug}`
    // Add more categories if needed
  }

  return (
    <Link href={detailPageLink} className="block group">
      <div className="border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        <div className="relative w-full aspect-[4/3] bg-muted">
          <Image
            src={displayImageUrl || "/placeholder.svg"}
            alt={name || "Pet"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => (e.currentTarget.src = `/placeholder.svg?width=300&height=200&query=fallback+pet`)}
          />
          {currentStatusNormalized === "approved" && (
            <Badge variant="default" className="absolute top-2 right-2 bg-green-500 text-white">
              Aprovado
            </Badge>
          )}
          {/* You can add badges for other "good" statuses like adopted if needed for other contexts */}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-1 truncate group-hover:text-primary">
            {name || "Nome não informado"}
          </h3>
          <p className="text-sm text-muted-foreground mb-1 capitalize">
            {pet.species}
            {pet.breed ? ` • ${pet.breed}` : ""}
          </p>
          <p className="text-xs text-muted-foreground mb-2 capitalize">
            {pet.city ? `${pet.city}, ${pet.state}` : "Local não informado"}
          </p>
          <p className="text-sm line-clamp-2 mb-3 flex-grow">{pet.description || "Sem descrição disponível."}</p>
          <Button variant="outline" size="sm" className="w-full mt-auto">
            Ver Detalhes
          </Button>
        </div>
      </div>
    </Link>
  )
}

export default PetCard
