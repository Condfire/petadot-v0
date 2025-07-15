"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { PetInfo } from "@/components/pet-info"
import { PetContactInfo } from "@/components/pet-contact-info"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { mapPetStatus } from "@/lib/utils"
import type { PetDB } from "@/lib/types"
import { MessageCircleMore } from "lucide-react"

interface PetDetailsProps {
  pet: PetDB
  isOwner?: boolean
  onMarkAsResolved?: (petId: string, status: "adopted" | "reunited") => void
  onDelete?: (petId: string) => void
  type: "lost" | "found" | "adoption"
}

export default function PetDetails({ pet, isOwner, onMarkAsResolved, onDelete, type }: PetDetailsProps) {
  if (!pet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Pet não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isResolved = pet.status === "adopted" || pet.status === "reunited" || pet.status === "resolved"

  // Processar imagens - usar main_image_url ou images array
  const imagesToDisplay = []

  if (pet.main_image_url) {
    imagesToDisplay.push(pet.main_image_url)
  }

  if (pet.images && Array.isArray(pet.images)) {
    pet.images.forEach((img) => {
      if (typeof img === "string" && !imagesToDisplay.includes(img)) {
        imagesToDisplay.push(img)
      }
    })
  }

  console.log(`[PetDetails] Pet: ${pet.name}, Images:`, imagesToDisplay)

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg rounded-2xl overflow-hidden bg-card border">
        <CardContent className="p-6 space-y-6">
          {/* Grid principal: Imagem à esquerda, informações à direita */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Coluna da Imagem */}
            <div className="md:col-span-1 lg:col-span-1">
              {imagesToDisplay.length > 0 ? (
                <PetImageGallery images={imagesToDisplay} name={pet.name || "Pet"} />
              ) : (
                <div className="relative w-full h-64 bg-muted flex items-center justify-center rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=256&width=256&text=Sem+foto"
                    alt="Sem foto disponível"
                    width={256}
                    height={256}
                    className="object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Sem foto disponível</p>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna das Informações */}
            <div className="md:col-span-1 lg:col-span-2 space-y-6">
              {/* Nome e Status */}
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                  {pet.name || "Pet sem nome"}
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-1">Status: {mapPetStatus(pet.status)}</p>
              </div>

              {/* Alerta de Resolvido */}
              {isResolved && (
                <PetResolvedAlert
                  status={pet.status!}
                  resolvedAt={pet.resolved_at}
                  resolutionDetails={pet.resolution_details}
                />
              )}

              {/* Descrição */}
              {pet.description && (
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Sobre {pet.name || "este pet"}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pet.description}</p>
                </div>
              )}

              {/* Características */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Características</h3>
                <PetInfo
                  species={pet.species}
                  species_other={pet.species_other}
                  breed={pet.breed}
                  age={pet.age}
                  size={pet.size}
                  size_other={pet.size_other}
                  gender={pet.gender}
                  gender_other={pet.gender_other}
                  color={pet.color}
                  color_other={pet.color_other}
                  is_castrated={pet.is_castrated}
                  is_vaccinated={pet.is_vaccinated}
                  is_special_needs={pet.is_special_needs}
                  special_needs_description={pet.special_needs_description}
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação do Proprietário */}
          {isOwner && !isResolved && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
              {type === "adoption" && (
                <Button onClick={() => onMarkAsResolved?.(pet.id!, "adopted")} variant="outline">
                  Marcar como Adotado
                </Button>
              )}
              {type === "lost" && (
                <Button onClick={() => onMarkAsResolved?.(pet.id!, "reunited")} variant="outline">
                  Marcar como Reunido
                </Button>
              )}
              <Button onClick={() => onDelete?.(pet.id!)} variant="destructive">
                Excluir
              </Button>
            </div>
          )}

          {/* Informações de Contato */}
          <div className="pt-6 border-t">
            <Card className="p-4 bg-secondary/20 border-secondary rounded-lg">
              <h3 className="text-xl font-semibold text-foreground mb-3">Informações de Contato</h3>
              <PetContactInfo
                phone={pet.contact}
                location={
                  pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || "Não informado"
                }
              />
              {pet.contact && (
                <Button asChild className="w-full mt-4">
                  <a
                    href={`https://wa.me/${pet.contact.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircleMore className="mr-2 h-4 w-4" />
                    Contatar via WhatsApp
                  </a>
                </Button>
              )}
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
