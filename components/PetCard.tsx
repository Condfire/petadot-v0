import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PetVisibilityGuard } from "@/components/pet-visibility-guard"

// Define a more specific Pet type if available, e.g., from lib/types.ts
interface PetType {
  id: string | number
  name: string
  slug: string
  category: "adoption" | "lost" | "found" | string
  description?: string
  age?: string | number
  species?: string
  breed?: string
  status?: string
  image_url?: string | null
  main_image_url?: string | null
  city?: string
  state?: string
  user_id?: string
}

interface PetCardProps {
  pet: PetType
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  if (!pet) {
    return null
  }

  const { status, name, image_url, main_image_url, slug, category, user_id } = pet

  const displayImageUrl =
    main_image_url || image_url || `/placeholder.svg?width=300&height=200&query=${pet.species || "pet"}`

  // Determine the link to the pet's detail page
  let detailPageLink = "#"
  if (slug) {
    if (category === "adoption") detailPageLink = `/adocao/${slug}`
    else if (category === "lost") detailPageLink = `/perdidos/${slug}`
    else if (category === "found") detailPageLink = `/encontrados/${slug}`
  }

  return (
    <PetVisibilityGuard pet={pet} showAlert={false}>
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
            {status && (
              <div className="absolute top-2 right-2">
                {status.toLowerCase() === "approved" || status.toLowerCase() === "aprovado" ? (
                  <Badge variant="default" className="bg-green-500 text-white">
                    Aprovado
                  </Badge>
                ) : status.toLowerCase() === "rejected" || status.toLowerCase() === "rejeitado" ? (
                  <Badge variant="default" className="bg-red-500 text-white">
                    Rejeitado
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-yellow-500 text-white">
                    Pendente
                  </Badge>
                )}
              </div>
            )}
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
    </PetVisibilityGuard>
  )
}

export default PetCard
