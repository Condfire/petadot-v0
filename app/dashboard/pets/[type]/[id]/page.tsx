import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils"

export default async function PetDetailPage({ params }: { params: { type: string; id: string } }) {
  const { type, id } = params

  // Placeholder data - replace with actual data fetching
  const pet = {
    id: id,
    type: type,
    name: "Buddy",
    species: "dog",
    size: "medium",
    gender: "male",
    color: "brown",
    description: "A friendly and playful dog looking for a loving home.",
    imageUrl: "/images/dog.jpg", // Replace with actual image URL
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pet Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <img src={pet.imageUrl || "/placeholder.svg"} alt={pet.name} className="rounded-lg shadow-md" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{pet.name}</h2>
          <p>
            <strong>Type:</strong> {pet.type}
          </p>
          <p>
            <strong>Species:</strong> {mapPetSpecies(pet.species)}
          </p>
          <p>
            <strong>Size:</strong> {mapPetSize(pet.size)}
          </p>
          <p>
            <strong>Gender:</strong> {mapPetGender(pet.gender)}
          </p>
          <p>
            <strong>Color:</strong> {mapPetColor(pet.color)}
          </p>
          <p>
            <strong>Description:</strong> {pet.description}
          </p>
        </div>
      </div>
    </div>
  )
}
