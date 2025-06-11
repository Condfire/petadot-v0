import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils"
import type { Pet } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PetInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pet: Pet
}

export const PetInfoCard = ({ pet, className, ...props }: PetInfoCardProps) => {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <span className="font-medium w-24">Espécie:</span>
          <span>{mapPetSpecies(pet.species, pet.species_other)}</span>
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
          <span>{mapPetSize(pet.size, pet.size_other)}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Gênero:</span>
          <span>{mapPetGender(pet.gender, pet.gender_other)}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Cor:</span>
          <span>{mapPetColor(pet.color)}</span>
        </div>
        {pet.special_needs && (
          <div className="flex items-center sm:col-span-2">
            <span className="font-medium w-24">Necessidades Especiais:</span>
            <span>{pet.special_needs}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
