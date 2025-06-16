import { ShareButton } from "@/components/share-button"
import { Pet } from "@/types"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { ReportPetButton } from "@/components/report-pet-button"

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
  ];

  return pets.find((pet) => pet.slug === slug);
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pet = await getPet(params.slug)

  if (!pet) {
    return {
      title: 'Pet Not Found',
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">{pet.name}</h1>
      <img src={pet.imageUrl || "/placeholder.svg"} alt={pet.name} className="rounded-lg shadow-md mb-4" />
      <p className="text-gray-700 mb-4">{pet.description}</p>

      <div className="flex flex-col sm:flex-row gap-2">
        <ShareButton
          url={`/encontrados/${pet.slug}`}
          title={pet.name}
          body={pet.description}
          className="w-full sm:w-auto"
        />
        <ReportPetButton 
          petId={pet.id} 
          petName={pet.name || "Pet"} 
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  )
}
