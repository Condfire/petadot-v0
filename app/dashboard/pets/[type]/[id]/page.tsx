import {
  mapPetSpecies,
  mapPetSize,
  mapPetGender,
  mapPetColor,
} from "@/lib/utils"

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
      <h1 className="text-2xl font-bold mb-4">Detalhes do Pet</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <img src={pet.imageUrl || "/placeholder.svg"} alt={pet.name} className="rounded-lg shadow-md" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{pet.name}</h2>
          <p>
            <strong>Tipo:</strong> {pet.type}
          </p>
          <p>
            <strong>Espécie:</strong> {mapPetSpecies(pet.species)}
          </p>
          <p>
            <strong>Porte:</strong> {mapPetSize(pet.size)}
          </p>
          <p>
            <strong>Sexo:</strong> {mapPetGender(pet.gender)}
          </p>
          <p>
            <strong>Cor:</strong> {mapPetColor(pet.color)}
          </p>
          <p>
            <strong>Descrição:</strong> {pet.description}
          </p>
        </div>
      </div>
    </div>
  )
}
