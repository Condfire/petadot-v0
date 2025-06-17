import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import PetDetails from "@/components/PetDetails"
import { ShareButton } from "@/components/share-button"
import { PetSightingModal } from "@/components/pet-sighting-modal"
import { ReportPetButton } from "@/components/report-pet-button"
import { isUuid } from "@/lib/slug-utils"

type Props = {
  params: {
    slug: string
  }
}

async function getPetBySlugOrId(slugOrId: string) {
  // Validar o parâmetro
  if (
    !slugOrId ||
    slugOrId === "{}" ||
    slugOrId === "%7B%7D" ||
    slugOrId === "%7B%7D" ||
    slugOrId === "undefined" ||
    slugOrId === "null"
  ) {
    console.log(`[Perdidos] Parâmetro inválido: ${slugOrId}`)
    return null
  }

  const supabase = createClient()

  console.log(`[Perdidos] Buscando pet: ${slugOrId}`)

  try {
    const isUuidValue = isUuid(slugOrId)
    console.log(`[Perdidos] É UUID: ${isUuidValue}`)

    // Buscar por slug primeiro, depois por ID
    let pet = null

    if (!isUuidValue) {
      // Tentar buscar por slug
      const { data: slugData, error: slugError } = await supabase
        .from("pets")
        .select("*")
        .eq("category", "lost")
        .eq("slug", slugOrId)
        .maybeSingle()

      console.log(`[Perdidos] Busca por slug:`, { slugData, slugError })

      if (!slugError && slugData) {
        pet = slugData
      }
    }

    // Se não encontrou por slug ou é UUID, buscar por ID
    if (!pet) {
      const { data: idData, error: idError } = await supabase
        .from("pets")
        .select("*")
        .eq("category", "lost")
        .eq("id", slugOrId)
        .maybeSingle()

      console.log(`[Perdidos] Busca por ID:`, { idData, idError })

      if (!idError && idData) {
        pet = idData
      }
    }

    console.log(`[Perdidos] Pet encontrado:`, pet)
    return pet
  } catch (err) {
    console.error(`[Perdidos] Erro na função getPetBySlugOrId:`, err)
    return null
  }
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
    title: `${pet.name || "Pet perdido"} - Pet perdido em ${location} - Petadot`,
    description: pet.description || `Ajude a encontrar ${pet.name || "este pet"} perdido em ${location}`,
    openGraph: {
      title: `Ajude a encontrar ${pet.name || "este pet"}!`,
      description: `Pet perdido em ${location}. ${pet.description || ""}`,
      images: [pet.main_image_url || "/placeholder.svg?height=400&width=400"],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/perdidos/${params.slug}`,
    },
  }
}

export default async function PetPerdidoPage({ params }: Props) {
  console.log(`[Perdidos] Renderizando página para slug: ${params.slug}`)

  const pet = await getPetBySlugOrId(params.slug)

  if (!pet) {
    console.log(`[Perdidos] Pet não encontrado, retornando 404`)
    notFound()
  }

  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || ""

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <PetDetails pet={pet} type="lost" />

          <div className="mt-8 space-y-6">
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Ajude a encontrar {pet.name || "este pet"}!</h2>
              <p className="text-muted-foreground mb-6">
                Compartilhe este anúncio para ajudar {pet.name || "este pet"} a voltar para casa.
              </p>

              <div className="flex flex-wrap gap-3">
                <ShareButton
                  url={`${process.env.NEXT_PUBLIC_APP_URL}/perdidos/${params.slug}`}
                  title={`Ajude a encontrar ${pet.name || "este pet"}!`}
                  description={`Pet perdido em ${location}. Ajude a encontrá-lo.`}
                  className="flex-1 min-w-[200px]"
                />

                <PetSightingModal
                  petId={pet.id}
                  petName={pet.name || "Pet perdido"}
                  petType="lost"
                  className="flex-1 min-w-[200px]"
                />

                <ReportPetButton petId={pet.id} petName={pet.name || "Pet"} className="flex-1 min-w-[200px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
