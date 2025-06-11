import type React from "react"
import type { Pet } from "@/lib/types"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils"

interface PetInfoCardProps {
  pet: Pet
}

const PetInfoCard: React.FC<PetInfoCardProps> = ({ pet }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img className="w-full h-48 object-cover" src={pet.image || "/placeholder.svg"} alt={pet.name} />
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">{pet.name}</h2>
        <p className="text-gray-600">
          {mapPetSpecies(pet.species)} - {mapPetGender(pet.gender)}
        </p>
        <p className="text-gray-600">
          {mapPetSize(pet.size)} - {mapPetColor(pet.color)}
        </p>
        <p className="text-gray-700 mt-2">{pet.description}</p>
      </div>
    </div>
  )
}

export { PetInfoCard }
