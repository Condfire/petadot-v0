import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import PetDetails from "@/components/PetDetails"
import { ShareButton } from "@/components/share-button"
import { PetRecognitionModal } from "@/components/pet-recognition-modal"
import { ReportPetButton } from "@/components/report-pet-button"
import { isUuid } from "@/lib/slug-utils"
import type { Database } from "@/lib/database.types"

type Props = {
  params: {
    slug: string
  }
}

async function getPetBySlugOrId(slugOrId: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const isUuidValue = isUuid(slugOrId)

  const { data: pet, error } = await supabase
    .from("pets")
    .select("*") // Seleciona todas as colunas, incluindo 'images'
    .eq("category", "found")
    .eq(isUuidValue ? "id" : "slug", slugOrId)
    .single()

  if (error) {
    console.error("Erro ao buscar pet encontrado:", error)
    return null
  }

  return pet
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pet = await getPetBySlugOrId(params.slug)

  if (!pet) {
    return {
      title: "Pet não encontrado - Petadot",
    }
  }

  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || ""

  return {
    title: `Pet encontrado em ${location} - Petadot`,
    description: pet.description || `Ajude a encontrar o dono de ${pet.name || "este pet"} encontrado em ${location}`,
    openGraph: {
      title: `Ajude a encontrar o dono de ${pet.name || "este pet"}!`,
      description: `Pet encontrado em ${location}. ${pet.description || ""}`,
      images: [pet.main_image_url || (pet.images && pet.images[0]) || "/placeholder.svg?height=400&width=400"], // Usa images array primeiro
      url: `${process.env.NEXT_PUBLIC_APP_URL}/encontrados/${params.slug}`,
    },
  }
}

export default async function PetEncontradoPage({ params }: Props) {
  const pet = await getPetBySlugOrId(params.slug)

  if (!pet) {
    notFound()
  }

  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || ""

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PetDetails pet={pet} type="found" /> {/* Passa a propriedade 'type' */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold">Ajude a encontrar o dono de {pet.name || "este pet"}!</h2>
          <p className="text-muted-foreground">
            Compartilhe este anúncio para ajudar {pet.name || "este pet"} a voltar para casa.
          </p>

          <div className="flex flex-wrap gap-3">
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_APP_URL}/encontrados/${params.slug}`}
              title={`Pet encontrado em ${location}!`}
              description={`Ajude a encontrar o dono deste pet encontrado em ${location}.`}
              className="flex-1 min-w-[200px]"
            />

            <PetRecognitionModal
              petId={pet.id}
              petName={pet.name || "Pet encontrado"}
              className="flex-1 min-w-[200px]"
            />

            <ReportPetButton petId={pet.id} petName={pet.name || "Pet"} className="flex-1 min-w-[200px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
