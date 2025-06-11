import type React from "react"
import type { Pet } from "@/types/Pet"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils"

interface PetDetailsProps {
  pet: Pet
}

const PetDetails: React.FC<PetDetailsProps> = ({ pet }) => {
  return (
    <div className="pet-details">
      <h2>{pet.name}</h2>
      <p>Species: {mapPetSpecies(pet.species)}</p>
      <p>Breed: {pet.breed}</p>
      <p>Age: {pet.age}</p>
      <p>Gender: {mapPetGender(pet.gender)}</p>
      <p>Size: {mapPetSize(pet.size)}</p>
      <p>Color: {mapPetColor(pet.color)}</p>
      <p>Description: {pet.description}</p>
      {pet.images && pet.images.length > 0 && (
        <div className="pet-images">
          {pet.images.map((image, index) => (
            <img key={index} src={image || "/placeholder.svg"} alt={`${pet.name} - Image ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PetDetails
