import type React from "react"

interface PetCardProps {
  pet: {
    id: number
    name: string
    description: string
    age: number
    species: string
    breed: string
    status: "pending" | "approved" | "rejected" | "aprovado" | "pendente" | "rejeitado"
    image_url?: string
    main_image_url?: string
  }
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  // Add a guard clause to check if pet is defined
  if (!pet) {
    return null // Or some placeholder, or an error message component
  }

  const { status } = pet

  // Normalizar o status para minúsculas para comparação e tratar undefined/null
  const currentStatusNormalized = typeof status === "string" ? status.toLowerCase() : ""

  // Status que não devem ser exibidos publicamente pelo PetCard
  const hiddenStatuses = ["pending", "pendente", "rejected", "rejeitado"]

  if (hiddenStatuses.includes(currentStatusNormalized)) {
    return null // Não renderizar o card para pets com status 'pending' ou 'rejected'
  }

  const imageUrl = pet.image_url || pet.main_image_url

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px", width: "300px" }}>
      {imageUrl && (
        <img src={imageUrl || "/placeholder.svg"} alt={pet.name} style={{ maxWidth: "100%", height: "auto" }} />
      )}
      <h3>{pet.name}</h3>
      <p>{pet.description}</p>
      <p>Age: {pet.age}</p>
      <p>Species: {pet.species}</p>
      <p>Breed: {pet.breed}</p>
    </div>
  )
}

export default PetCard
