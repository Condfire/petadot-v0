"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PetInfo } from "@/components/pet-info"
import { PetContactInfo } from "@/components/pet-contact-info"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { mapPetStatus } from "@/lib/utils"
import type { PetDB } from "@/lib/types"

interface PetDetailsProps {
  pet: PetDB
  isOwner?: boolean
  onMarkAsResolved?: (petId: string, status: "adopted" | "reunited") => void
  onDelete?: (petId: string) => void
  type: "lost" | "found" | "adoption" // Adicionado a propriedade 'type'
}

export default function PetDetails({ pet, isOwner, onMarkAsResolved, onDelete, type }: PetDetailsProps) {
  if (!pet) {
    return <p>Pet não encontrado.</p>
  }

  const isResolved = pet.status === "adopted" || pet.status === "reunited" || pet.status === "resolved"

  // Determina o array de imagens correto para passar para a galeria
  const imagesToDisplay =
    pet.images && pet.images.length > 0 ? pet.images : pet.main_image_url ? [pet.main_image_url] : []

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-0">
          {imagesToDisplay.length > 0 ? (
            <PetImageGallery images={imagesToDisplay} name={pet.name || "Pet"} />
          ) : (
            <div className="relative w-full h-64 bg-gray-200 flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=256&width=512"
                alt="Placeholder"
                width={512}
                height={256}
                className="object-cover"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {" "}
            {/* Grid principal para conteúdo */}
            {/* Coluna Esquerda: Informações Básicas e Descrição */}
            <div className="space-y-4">
              <CardTitle className="text-4xl font-bold text-primary">{pet.name}</CardTitle>
              <p className="text-lg text-muted-foreground mt-1">Status: {mapPetStatus(pet.status)}</p>

              {isResolved && (
                <PetResolvedAlert
                  status={pet.status!}
                  resolvedAt={pet.resolved_at}
                  resolutionDetails={pet.resolution_details}
                />
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-primary">Sobre {pet.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{pet.description}</p>
              </div>
            </div>
            {/* Coluna Direita: Características e Contato */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-primary">Características</h3>
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

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-primary">Informações de Contato</h3>
                <PetContactInfo
                  contact={pet.whatsapp_contact}
                  location={
                    pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || "Não informado"
                  }
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação - movidos para fora do grid principal para largura total */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            {isOwner && !isResolved && (
              <>
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
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
