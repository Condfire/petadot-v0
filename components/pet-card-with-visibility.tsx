"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User } from "lucide-react"

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

interface PetCardWithVisibilityProps {
  pet: PetType
  currentUserId?: string | null
}

const PetCardWithVisibility: React.FC<PetCardWithVisibilityProps> = ({ pet, currentUserId }) => {
  if (!pet) {
    return null
  }

  const { status, name, image_url, main_image_url, slug, category, user_id } = pet
  const currentStatus = status?.toLowerCase() || ""

  // Verificar se o pet deve ser visível
  const isApproved = currentStatus === "approved" || currentStatus === "aprovado"
  const isOwner = currentUserId && user_id === currentUserId

  // Se não é aprovado e não é o dono, não mostrar
  if (!isApproved && !isOwner) {
    return null
  }

  const displayImageUrl =
    main_image_url || image_url || `/placeholder.svg?width=300&height=200&query=${pet.species || "pet"}`

  // Determinar o link para a página de detalhes
  let detailPageLink = "#"
  if (slug) {
    if (category === "adoption") detailPageLink = `/adocao/${slug}`
    else if (category === "lost") detailPageLink = `/perdidos/${slug}`
    else if (category === "found") detailPageLink = `/encontrados/${slug}`
  }

  // Função para obter a cor do badge baseada no status
  const getStatusBadge = () => {
    if (currentStatus === "approved" || currentStatus === "aprovado") {
      return <Badge className="bg-green-500 text-white">Aprovado</Badge>
    } else if (currentStatus === "rejected" || currentStatus === "rejeitado") {
      return <Badge className="bg-red-500 text-white">Rejeitado</Badge>
    } else if (currentStatus === "pending" || currentStatus === "pendente") {
      return <Badge className="bg-yellow-500 text-white">Pendente</Badge>
    }
    return null
  }

  return (
    <div className="space-y-2">
      {/* Alerta para pets não aprovados (só para o dono) */}
      {!isApproved && isOwner && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {currentStatus === "rejected" || currentStatus === "rejeitado"
              ? "Seu pet foi rejeitado e só é visível para você."
              : "Seu pet está aguardando aprovação e só é visível para você."}
          </AlertDescription>
        </Alert>
      )}

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

            {/* Badges no canto superior direito */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {getStatusBadge()}
              {isOwner && (
                <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
                  <User className="h-3 w-3 mr-1" />
                  Seu Pet
                </Badge>
              )}
            </div>
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
    </div>
  )
}

export default PetCardWithVisibility
