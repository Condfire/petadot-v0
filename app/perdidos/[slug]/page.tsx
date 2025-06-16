import { ShareButton } from "@/components/share-button"
import type { Pet } from "@/types"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ReportPetButton } from "@/components/report-pet-button"
import { PetSightingModal } from "@/components/pet-sighting-modal"

type Props = {
  params: {
    slug: string
  }
}

async function getPet(slug: string): Promise<Pet | undefined> {
  // Simulate fetching pet data (replace with your actual data fetching logic)
  const pets: Pet[] = [
    { id: "1", slug: "fluffy", name: "Fluffy", description: "A fluffy cat", imageUrl: "/fluffy.jpg" },
    { id: "2", slug: "buddy", name: "Buddy", description: "A friendly dog", imageUrl: "/buddy.jpg" },
  ]

  return pets.find((pet) => pet.slug === slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pet = await getPet(params.slug)

  if (!pet) {
    return {
      title: "Pet Not Found",
    }
  }

  return {
    title: pet.name,
    description: pet.description,
  }
}

export default async function PetPage({ params }: Props) {
  const pet = await getPet(params.slug)

  if (!pet) {
    notFound()
  }

  const location = "algum lugar" // Replace with actual location data

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">{pet.name}</h1>
      <img src={pet.imageUrl || "/placeholder.svg"} alt={pet.name} className="rounded-lg shadow-md mb-4" />
      <p className="text-gray-700 mb-4">{pet.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <ShareButton
          url={`${process.env.NEXT_PUBLIC_APP_URL}/perdidos/${pet.slug || pet.id}`}
          title={`Ajude a encontrar ${pet.name || "este pet"}!`}
          description={`Pet perdido em ${location || "algum lugar"}. Ajude a encontrá-lo.`}
          className="w-full sm:w-auto"
        />

        <PetSightingModal
          petId={pet.id}
          petName={pet.name || "Pet perdido"}
          petType="lost"
          className="w-full sm:w-auto sm:flex-1"
        />

        <ReportPetButton petId={pet.id} petName={pet.name || "Pet"} className="w-full sm:w-auto" />
      </div>
    </div>
  )
}
