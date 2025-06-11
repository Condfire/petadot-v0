import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getPet } from "@/lib/pets"
import PetDetailsSkeleton from "@/components/pet-details-skeleton"
import PetDetails from "@/components/pet-details"

interface Props {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const pet = await getPet(slug)

  if (!pet) {
    return {
      title: "Pet não encontrado",
    }
  }

  return {
    title: pet.name,
    description: `Detalhes sobre ${pet.name}`,
  }
}

export default async function PetPage({ params: { slug } }: Props) {
  const pet = await getPet(slug)

  if (!pet) {
    notFound()
  }

  return (
    <Suspense fallback={<PetDetailsSkeleton />}>
      <PetDetails pet={pet} />
    </Suspense>
  )
}
