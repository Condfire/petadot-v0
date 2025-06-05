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
  // Guard clause: if pet prop is undefined or null, don't render.
  if (!pet) {
    return null
  }

  const { status, name, description, age, species, breed, image_url, main_image_url } = pet

  // Normalize the status to lowercase for consistent comparison.
  // Handles cases where status might be null or undefined on the pet object.
  const currentStatusNormalized = typeof status === "string" ? status.toLowerCase() : ""

  // Define statuses that should not be displayed by this card.
  const hiddenStatuses = ["pending", "pendente", "rejected", "rejeitado"]

  if (hiddenStatuses.includes(currentStatusNormalized)) {
    return null // Do not render the card for pets with these statuses.
  }

  const imageUrl = image_url || main_image_url

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px", width: "300px" }}>
      {imageUrl && <img src={imageUrl || "/placeholder.svg"} alt={name} style={{ maxWidth: "100%", height: "auto" }} />}
      <h3>{name}</h3>
      <p>{description}</p>
      <p>Age: {age}</p>
      <p>Species: {species}</p>
      <p>Breed: {breed}</p>
    </div>
  )
}

export default PetCard
