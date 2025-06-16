import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ShareButtons } from "@/components/share-buttons"
import { ReportPetButton } from "@/components/report-pet-button"

async function getPet(slug: string) {
  // Simulate fetching pet data (replace with your actual data fetching logic)
  await new Promise((resolve) => setTimeout(resolve, 100))

  const pets = [
    {
      id: "1",
      slug: "max",
      name: "Max",
      description: "A friendly golden retriever",
      imageUrl: "/max.jpg",
    },
    {
      id: "2",
      slug: "bella",
      name: "Bella",
      description: "A playful calico cat",
      imageUrl: "/bella.jpg",
    },
  ]

  const pet = pets.find((pet) => pet.slug === slug)

  if (!pet) {
    return null
  }

  return pet
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const pet = await getPet(params.slug)

  if (!pet) {
    return {
      title: "Pet Not Found",
    }
  }

  return {
    title: `${pet.name} está perdido - Petadot`,
    description: pet.description,
  }
}

export default async function PetPage({ params }: { params: { slug: string } }) {
  const pet = await getPet(params.slug)

  if (!pet) {
    notFound()
  }

  const currentUrl = `https://petadot.com/perdidos/${pet.slug}`

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <img src={pet.imageUrl || "/placeholder.svg"} alt={pet.name} className="w-full md:w-1/2 rounded-lg shadow-md" />
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-4">{pet.name}</h1>
          <p className="text-gray-700 mb-4">{pet.description}</p>
          <div className="flex gap-2 flex-wrap">
            <ShareButtons title={`${pet.name} está perdido - Petadot`} url={currentUrl} />
            <ReportPetButton petId={pet.id} petName={pet.name} />
            {/* existing owner buttons */}
          </div>
          {/* Owner Actions (Example) */}
          <div className="mt-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Contact Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
