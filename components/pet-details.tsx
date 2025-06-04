"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PetCharacteristics } from "@/components/pet-characteristics"
import { PetInfoCard } from "@/components/pet-info-card"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetContactInfo } from "@/components/pet-contact-info"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { PetSightingModal } from "@/components/pet-sighting-modal"
import { PetRecognitionModal } from "@/components/pet-recognition-modal"
import { AdoptionInterestModal } from "@/components/adoption-interest-modal"
import { ShareButton } from "@/components/share-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/mappers"

interface PetDetailsProps {
  pet: any
  type: "adoption" | "lost" | "found"
}

export default function PetDetails({ pet, type }: PetDetailsProps) {
  const [activeTab, setActiveTab] = useState("info")

  // Verificar se o pet está pendente de aprovação
  const isPending = pet.status === "pending"

  // Formatar a data
  const formattedDate = formatDate(pet.created_at)

  // Preparar as imagens
  const images = []
  if (pet.image_url) images.push(pet.image_url)
  if (pet.additional_images && Array.isArray(pet.additional_images)) {
    images.push(...pet.additional_images)
  }

  // Preparar a localização
  let location = null
  if (type === "adoption") {
    location = pet.location || (pet.ongs ? `${pet.ongs.city || ""}, ${pet.ongs.state || ""}`.trim() : null)
  } else {
    location = pet.location || (pet.city && pet.state ? `${pet.city}, ${pet.state}` : null)
  }

  // Mapear valores para exibição em português (apenas para pets perdidos e encontrados)
  let speciesDisplay = pet.species
  let sizeDisplay = pet.size
  let genderDisplay = pet.gender
  let colorDisplay = pet.color

  if (type === "lost" || type === "found") {
    speciesDisplay = mapPetSpecies(pet.species, pet.species_other)
    sizeDisplay = mapPetSize(pet.size, pet.size_other)
    genderDisplay = mapPetGender(pet.gender, pet.gender_other)
    colorDisplay = mapPetColor(pet.color, pet.color_other)
  }

  // Obter o número de telefone para contato
  let contactPhone = null
  if (type === "adoption") {
    const ong = pet.ongs as {
      id: string
      name: string
      email: string
      phone: string
      contact: string
    } | null
    contactPhone = ong?.contact || ong?.phone || pet.contact || null
  } else {
    contactPhone = pet.contact_phone || pet.contact || null
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {isPending && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Pet aguardando aprovação</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Este pet está aguardando aprovação e só é visível para você. Ele será publicado após a aprovação por um
            administrador.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <PetImageGallery
            images={images}
            alt={pet.name || `Pet ${type === "adoption" ? "para adoção" : type === "lost" ? "perdido" : "encontrado"}`}
            className="mb-4"
          />

          <div className="flex flex-wrap gap-2 mb-4">
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_APP_URL}/${
                type === "adoption" ? "adocao" : type === "lost" ? "perdidos" : "encontrados"
              }/${pet.slug || pet.id}`}
              title={
                type === "adoption"
                  ? `Adote ${pet.name || "este pet"}!`
                  : type === "lost"
                    ? `Ajude a encontrar ${pet.name || "este pet"}!`
                    : `Ajude a encontrar o dono deste pet!`
              }
              description={
                type === "adoption"
                  ? `${pet.name} está disponível para adoção. Conheça mais sobre este pet.`
                  : type === "lost"
                    ? `Pet perdido em ${location || "algum lugar"}. Ajude a encontrá-lo.`
                    : `Pet encontrado em ${location || "algum lugar"}. Ajude a encontrar seu dono.`
              }
              className="w-full sm:w-auto"
            />

            {type === "adoption" && (
              <AdoptionInterestModal
                petId={pet.id}
                petName={pet.name}
                ongId={pet.ongs?.id}
                contactPhone={contactPhone}
                ongName={pet.ongs?.name}
                className="w-full sm:w-auto sm:flex-1"
              />
            )}

            {type === "lost" && (
              <PetSightingModal
                petId={pet.id}
                petName={pet.name || "Pet perdido"}
                petType="lost"
                className="w-full sm:w-auto sm:flex-1"
              />
            )}

            {type === "found" && (
              <PetRecognitionModal
                petId={pet.id}
                petName={pet.name || "Pet encontrado"}
                className="w-full sm:w-auto sm:flex-1"
              />
            )}
          </div>

          {pet.is_resolved && <PetResolvedAlert type={type} resolvedAt={pet.resolved_at} className="mb-4" />}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {pet.name || `Pet ${type === "adoption" ? "para adoção" : type === "lost" ? "perdido" : "encontrado"}`}
            </h1>
            <p className="text-muted-foreground">
              {type === "adoption"
                ? `Disponível desde ${formattedDate}`
                : type === "lost"
                  ? `Perdido desde ${formattedDate}`
                  : `Encontrado em ${formattedDate}`}
            </p>
            {location && <p className="text-muted-foreground">Localização: {location}</p>}
          </div>

          <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="characteristics">Características</TabsTrigger>
              <TabsTrigger value="description">Descrição</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 pt-4">
              <PetInfoCard
                species={speciesDisplay}
                breed={pet.breed}
                age={pet.age}
                gender={genderDisplay}
                size={sizeDisplay}
                color={colorDisplay}
                location={location}
                date={formattedDate}
              />

              {(type === "lost" || type === "found") && (
                <PetContactInfo name={pet.contact_name} email={pet.contact_email} phone={contactPhone} />
              )}
            </TabsContent>

            <TabsContent value="characteristics" className="pt-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Características do Pet</h3>

                {type === "adoption" ? (
                  <PetCharacteristics
                    temperament={pet.temperament}
                    energy_level={pet.energy_level}
                    shedding={pet.shedding}
                    trainability={pet.trainability}
                    sociability={pet.sociability}
                  />
                ) : (
                  <PetCharacteristics
                    isVaccinated={pet.is_vaccinated}
                    isNeutered={pet.is_neutered}
                    isSpecialNeeds={pet.is_special_needs}
                    specialNeedsDescription={pet.special_needs_description}
                    goodWithKids={pet.good_with_kids}
                    goodWithCats={pet.good_with_cats}
                    goodWithDogs={pet.good_with_dogs}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="description" className="pt-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="whitespace-pre-wrap">{pet.description || "Nenhuma descrição fornecida."}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
