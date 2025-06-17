import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils"
import type { Pet } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PetInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pet: Pet | null | undefined
}

export const PetInfoCard = ({ pet, className, ...props }: PetInfoCardProps) => {
  // Handle case where pet is null or undefined
  if (!pet) {
    return (
      <Card className={cn("w-full", className)} {...props}>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Informações do pet não disponíveis</p>
        </CardContent>
      </Card>
    )
  }

  // Safely map pet properties with fallbacks
  const speciesText = mapPetSpecies(pet.species, pet.species_other) || "Não informada"
  const sizeText = mapPetSize(pet.size, pet.size_other) || "Não informado"
  const genderText = mapPetGender(pet.gender, pet.gender_other) || "Não informado"
  const colorText = mapPetColor(pet.color) || "Não informada"
  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || "Não informada"

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <span className="font-medium w-24">Espécie:</span>
          <span>{speciesText}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Raça:</span>
          <span>{pet.breed || "Não informada"}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Idade:</span>
          <span>{pet.age || "Não informada"}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Porte:</span>
          <span>{sizeText}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Gênero:</span>
          <span>{genderText}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Cor:</span>
          <span>{colorText}</span>
        </div>
        <div className="flex items-center sm:col-span-2">
          <span className="font-medium w-24">Localização:</span>
          <span>{location}</span>
        </div>
        {pet.special_needs && (
          <div className="flex items-start sm:col-span-2">
            <span className="font-medium w-24">Necessidades Especiais:</span>
            <span>{pet.special_needs}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
