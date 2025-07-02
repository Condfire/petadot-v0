"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Heart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PetStatusButtonSimple } from "@/components/pet-status-button-simple"

interface PetCardProps {
  id: string
  name?: string
  main_image_url?: string
  species?: string
  species_other?: string
  breed?: string
  age?: string
  size?: string
  size_other?: string
  gender?: string
  gender_other?: string
  city?: string
  state?: string
  status?: string
  type: "lost" | "found" | "adoption"
  slug?: string
  category?: string
  isSpecialNeeds?: boolean
  created_at?: string
  isOwner?: boolean
}

function PetCard({
  id,
  name,
  main_image_url,
  species,
  species_other,
  breed,
  age,
  size,
  size_other,
  gender,
  gender_other,
  city,
  state,
  status,
  type,
  slug,
  category,
  isSpecialNeeds,
  created_at,
  isOwner = false,
}: PetCardProps) {
  // Debug logs
  console.log(`[PetCard] Pet ${id}:`, {
    name,
    main_image_url,
    type,
    slug,
    category,
  })

  // Função para gerar a URL de detalhes
  const getDetailUrl = () => {
    const validSlug = slug && !["{}", "%7B%7D", "undefined", "null"].includes(slug)
    const identifier = validSlug ? slug : id
    console.log(`[PetCard] Gerando URL para pet ${id}, slug: ${slug}, type: ${type}, identifier: ${identifier}`)

    switch (type) {
      case "adoption":
        return `/adocao/${identifier}`
      case "lost":
        return `/perdidos/${identifier}`
      case "found":
        return `/encontrados/${identifier}`
      default:
        return `/${type}/${identifier}`
    }
  }

  // Função para formatar espécie
  const getSpeciesDisplay = () => {
    if (species === "dog") return "Cachorro"
    if (species === "cat") return "Gato"
    if (species === "other" && species_other) return species_other
    return species || "Não informado"
  }

  // Função para formatar tamanho
  const getSizeDisplay = () => {
    if (size === "small") return "Pequeno"
    if (size === "medium") return "Médio"
    if (size === "large") return "Grande"
    if (size === "other" && size_other) return size_other
    return size || "Não informado"
  }

  // Função para formatar gênero
  const getGenderDisplay = () => {
    if (gender === "male") return "Macho"
    if (gender === "female") return "Fêmea"
    if (gender === "other" && gender_other) return gender_other
    return gender || "Não informado"
  }

  // Função para obter a cor do badge baseado no tipo
  const getBadgeVariant = () => {
    switch (type) {
      case "lost":
        return "destructive"
      case "found":
        return "secondary"
      case "adoption":
        return "default"
      default:
        return "default"
    }
  }

  // Função para obter o texto do badge
  const getBadgeText = () => {
    switch (type) {
      case "lost":
        return "PERDIDO"
      case "found":
        return "ENCONTRADO"
      case "adoption":
        return "ADOÇÃO"
      default:
        return type?.toUpperCase()
    }
  }

  const detailUrl = getDetailUrl()
  const location = city && state ? `${city}, ${state}` : city || state || "Localização não informada"

  // Melhor tratamento da imagem
  const imageUrl = main_image_url || "/placeholder.svg?height=200&width=300&text=Sem+foto"
  console.log(`[PetCard] Imagem para pet ${id}:`, imageUrl)

  const resolvedStatuses = ["adopted", "resolved", "reunited"]
  const isResolved = status ? resolvedStatuses.includes(status) : false

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card border">
      <div className="relative">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name || "Pet"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.error(`[PetCard] Erro ao carregar imagem para pet ${id}:`, e)
            }}
            onLoad={() => {
              console.log(`[PetCard] Imagem carregada com sucesso para pet ${id}`)
            }}
          />
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant={getBadgeVariant()} className="font-semibold">
            {getBadgeText()}
          </Badge>
        </div>
        {isSpecialNeeds && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-background/80">
              <Heart className="h-3 w-3 mr-1" />
              Especial
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground line-clamp-1">{name || "Pet sem nome"}</h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Espécie:</span>
            <span className="font-medium text-foreground">{getSpeciesDisplay()}</span>
          </div>
          {breed && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Raça:</span>
              <span className="font-medium text-foreground line-clamp-1">{breed}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tamanho:</span>
            <span className="font-medium text-foreground">{getSizeDisplay()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gênero:</span>
            <span className="font-medium text-foreground">{getGenderDisplay()}</span>
          </div>
        </div>

        {created_at && (
          <div className="flex items-center text-muted-foreground text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Publicado em {new Date(created_at).toLocaleDateString("pt-BR")}</span>
          </div>
        )}

        <Link href={detailUrl} className="block">
          <Button className="w-full mt-3">Ver Detalhes</Button>
        </Link>

        {isOwner && (
          <div className="flex flex-col gap-2 mt-3">
            {!isResolved && (
              <PetStatusButtonSimple petId={id} petType={type} />
            )}
            <Button variant="destructive" asChild>
              <Link href={`/dashboard/pets/${type}/${id}/delete`}>Excluir</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Named export
export { PetCard }

// Default export
export default PetCard
