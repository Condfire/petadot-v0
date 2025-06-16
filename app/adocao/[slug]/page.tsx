import { ShareButtons } from "@/components/share-buttons"
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
  return {
    title: "Pet não encontrado - PetAdote",
  }
}

export default async function Adocao({ params }: Props) {
  notFound()
  return (
    <div className="container py-10">
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Compartilhe</h2>
        <p className="mb-4">Ajude o a encontrar um lar! Compartilhe com seus amigos e familiares.</p>

        <div className="flex gap-2 flex-wrap">
          <ShareButtons title={`Conheça  - Petadot`} url={``} />
          <ReportPetButton petId={""} petName={""} />
          {/* existing owner buttons */}
        </div>
      </div>
    </div>
  )
}
