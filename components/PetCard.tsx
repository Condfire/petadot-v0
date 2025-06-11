import type React from "react"
import Image from "next/image"
import type { Pet } from "@/types"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils"

interface PetCardProps {
  pet: Pet
}

export const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image src={pet.image || "/placeholder.svg"} alt={pet.name} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{pet.name}</h2>
        <p className="text-gray-600">
          {mapPetSpecies(pet.species)} - {mapPetGender(pet.gender)}
        </p>
        <p className="text-gray-600">
          {mapPetSize(pet.size)} - {mapPetColor(pet.color)}
        </p>
        <p className="text-gray-700">Age: {pet.age}</p>
        <p className="text-gray-700">Breed: {pet.breed}</p>
      </div>
    </div>
  )
}
