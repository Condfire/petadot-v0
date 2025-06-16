import { ShareButtons } from "@/components/share-buttons"
import { PetInfo } from "@/components/pet-info"
import { getPet } from "@/services/petService"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ReportPetButton } from "@/components/report-pet-button"

interface Params {
  slug: string
}

interface Props {
  params: Params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pet = await getPet(params.slug)

  if (!pet) {
    return {
      title: "Pet não encontrado - PetAdote",
    }
  }

  return {
    title: `${pet.name} - PetAdote`,
    description: `Conheça ${pet.name} e ajude-o a encontrar um lar.`,
    openGraph: {
      title: `${pet.name} - PetAdote`,
      description: `Conheça ${pet.name} e ajude-o a encontrar um lar.`,
      images: [pet.image],
    },
  }
}

export default async function Adocao({ params }: Props) {
  const pet = await getPet(params.slug)

  if (!pet) {
    notFound()
  }

  const currentUrl = `https://petadote.vercel.app/adocao/${pet.id}`

  return (
    <div className="container py-10">
      <PetInfo pet={pet} />

      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Compartilhe</h2>
        <p className="mb-4">Ajude o {pet.name} a encontrar um lar! Compartilhe com seus amigos e familiares.</p>

        <div className="flex gap-2 flex-wrap">
          <ShareButtons title={`Conheça ${pet.name} - Petadot`} url={currentUrl} />
          <ReportPetButton petId={pet.id} petName={pet.name} />
          {/* existing owner buttons */}
        </div>
      </div>
    </div>
  )
}
