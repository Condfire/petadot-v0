"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PetInfo } from "@/components/pet-info" // Importar PetInfo como named export
import { PetContactInfo } from "@/components/pet-contact-info"
import { ShareButtons } from "@/components/share-buttons"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { mapPetStatus } from "@/lib/utils" // Importar mapPetStatus de lib/utils
import type { PetDB } from "@/lib/types"

interface PetDetailsProps {
  pet: PetDB
  isOwner?: boolean
  onMarkAsResolved?: (petId: string, status: "adopted" | "reunited") => void
  onDelete?: (petId: string) => void
}

export default function PetDetails({ pet, isOwner, onMarkAsResolved, onDelete }: PetDetailsProps) {
  if (!pet) {
    return <p>Pet não encontrado.</p>
  }

  const isResolved = pet.status === "adopted" || pet.status === "reunited" || pet.status === "resolved"

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="p-0">
          {pet.image_urls && pet.image_urls.length > 0 ? (
            <PetImageGallery images={pet.image_urls} />
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-4xl font-bold text-primary">{pet.name}</CardTitle>
              <p className="text-lg text-muted-foreground mt-1">Status: {mapPetStatus(pet.status)}</p>
            </div>
            <div className="flex gap-2">
              <ShareButtons title={`Conheça ${pet.name} - Petadot`} url={window.location.href} />
              {isOwner && !isResolved && (
                <>
                  <Button onClick={() => onMarkAsResolved?.(pet.id!, "adopted")} variant="outline">
                    Marcar como Adotado
                  </Button>
                  {pet.status === "lost" && (
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
          </div>

          {isResolved && (
            <PetResolvedAlert
              status={pet.status!}
              resolvedAt={pet.resolved_at}
              resolutionDetails={pet.resolution_details}
            />
          )}

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-primary">Sobre {pet.name}</h3>
            <p className="text-muted-foreground leading-relaxed">{pet.description}</p>
          </div>

          <div className="space-y-4">
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

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-primary">Informações de Contato</h3>
            <PetContactInfo
              contact={pet.whatsapp_contact}
              location={pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || "Não informado"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
