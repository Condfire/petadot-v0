import { ShareButtons } from "@/components/share-buttons"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ReportPetButton } from "@/components/report-pet-button"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetInfoCard } from "@/components/pet-info-card"
import { AdoptionInterestModal } from "@/components/adoption-interest-modal"

interface Params {
  slug: string
}

interface Props {
  params: Params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug

  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: pet, error } = await supabase
    .from("pets")
    .select(
      `
      *,
      owner:profiles(*)
    `,
    )
    .eq("id", slug)
    .single()

  if (!pet) {
    return {
      title: "Pet não encontrado - PetAdote",
    }
  }

  return {
    title: `${pet.name} - PetAdote`,
    description: pet.description,
    openGraph: {
      images: [pet.images?.[0] || "/images/dog_placeholder.jpg"],
    },
  }
}

export default async function Adocao({ params }: Props) {
  const slug = params.slug

  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: pet, error } = await supabase
    .from("pets")
    .select(
      `
      *,
      owner:profiles(*)
    `,
    )
    .eq("id", slug)
    .single()

  if (!pet) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <PetImageGallery images={pet.images} name={pet.name} />

        {/* Pet Info Card */}
        <PetInfoCard pet={pet} />
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Compartilhe</h2>
        <p className="mb-4">Ajude o {pet.name} a encontrar um lar! Compartilhe com seus amigos e familiares.</p>

        <div className="flex gap-2 flex-wrap">
          <ShareButtons
            title={`Conheça ${pet.name} - Petadot`}
            url={`${process.env.NEXT_PUBLIC_SITE_URL}/adocao/${pet.id}`}
          />
          {/* existing owner buttons */}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Tenho interesse!</h2>
        <p className="mb-4">
          Se você tem interesse em adotar o {pet.name}, clique no botão abaixo para enviar uma mensagem para o tutor
          dele!
        </p>

        <AdoptionInterestModal petName={pet.name} owner={pet.owner} />
        <ReportPetButton petId={pet.id} petName={pet.name || "este pet"} className="w-full sm:w-auto" />
      </div>
    </div>
  )
}
