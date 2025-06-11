import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { api } from "@/lib/api"
import { PetInfo } from "@/components/pet-info"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils"

interface Params {
  slug: string
}

interface PageProps {
  params: Params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params

  try {
    const pet = await api.get(`/pets/${slug}`).then((response) => response.data)

    if (!pet) {
      return {
        title: "Pet não encontrado",
      }
    }

    return {
      title: pet.name,
    }
  } catch (error) {
    return {
      title: "Pet não encontrado",
    }
  }
}

export default async function AdocaoPetPage({ params }: PageProps) {
  const { slug } = params

  try {
    const pet = await api.get(`/pets/${slug}`).then((response) => response.data)

    if (!pet) {
      notFound()
    }

    const mappedPet = {
      ...pet,
      species: mapPetSpecies(pet.species),
      size: mapPetSize(pet.size),
      gender: mapPetGender(pet.gender),
      color: mapPetColor(pet.color),
    }

    return (
      <div className="container mx-auto py-8">
        <PetInfo pet={mappedPet} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
