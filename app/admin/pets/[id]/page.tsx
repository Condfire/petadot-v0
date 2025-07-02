import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor, mapPetAge } from "@/lib/utils"

const PetDetailPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params

  // TODO: Fetch pet data based on ID
  // const pet = await getPetById(id)

  // Placeholder data for now
  const pet = {
    id: id,
    name: "Buddy",
    species: "dog",
    size: "medium",
    gender: "male",
    color: "brown",
    breed: "Labrador",
    age: 3,
    description: "A friendly and playful dog looking for a loving home.",
    images: ["/placeholder-pet.jpg"], // Replace with actual image URLs
  }

  if (!pet) {
    return <div>Pet não encontrado</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detalhes do Pet</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <img src={pet.images[0] || "/placeholder.svg"} alt={pet.name} className="rounded-lg shadow-md" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{pet.name}</h2>
          <p>Espécie: {mapPetSpecies(pet.species)}</p>
          <p>Porte: {mapPetSize(pet.size)}</p>
          <p>Sexo: {mapPetGender(pet.gender)}</p>
          <p>Cor: {mapPetColor(pet.color)}</p>
          <p>Raça: {pet.breed}</p>
          <p>Idade: {mapPetAge(pet.age)}</p>
          <p>Descrição: {pet.description}</p>
          {/* Add more details as needed */}
        </div>
      </div>
    </div>
  )
}

export default PetDetailPage
