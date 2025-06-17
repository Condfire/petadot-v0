import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import PetDetails from "@/components/PetDetails"
import { ShareButton } from "@/components/share-button"
import { PetRecognitionModal } from "@/components/pet-recognition-modal"
import { ReportPetButton } from "@/components/report-pet-button"
import { isUuid } from "@/lib/slug-utils"

type Props = {
  params: {
    slug: string
  }
}

async function getPetBySlugOrId(slugOrId: string) {
  // Validar o parâmetro
  if (!slugOrId || slugOrId === "{}" || slugOrId === "%7B%7D" || slugOrId === "undefined" || slugOrId === "null") {
    console.log(`[Encontrados] Parâmetro inválido: ${slugOrId}`)
    return null
  }

  const supabase = createClient()

  console.log(`[Encontrados] Buscando pet: ${slugOrId}`)

  try {
    const isUuidValue = isUuid(slugOrId)
    console.log(`[Encontrados] É UUID: ${isUuidValue}`)

    // Buscar por slug primeiro, depois por ID
    let pet = null

    if (!isUuidValue) {
      // Tentar buscar por slug
      const { data: slugData, error: slugError } = await supabase
        .from("pets")
        .select("*")
        .eq("category", "found")
        .eq("slug", slugOrId)
        .maybeSingle()

      console.log(`[Encontrados] Busca por slug:`, { slugData, slugError })

      if (!slugError && slugData) {
        pet = slugData
      }
    }

    // Se não encontrou por slug ou é UUID, buscar por ID
    if (!pet) {
      const { data: idData, error: idError } = await supabase
        .from("pets")
        .select("*")
        .eq("category", "found")
        .eq("id", slugOrId)
        .maybeSingle()

      console.log(`[Encontrados] Busca por ID:`, { idData, idError })

      if (!idError && idData) {
        pet = idData
      }
    }

    console.log(`[Encontrados] Pet encontrado:`, pet)
    return pet
  } catch (err) {
    console.error(`[Encontrados] Erro na função getPetBySlugOrId:`, err)
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
    title: `Pet encontrado em ${location} - Petadot`,
    description: pet.description || `Pet encontrado em ${location}. Ajude a encontrar seu dono.`,
    openGraph: {
      title: `Pet encontrado em ${location}!`,
      description: `Ajude a encontrar o dono deste pet. ${pet.description || ""}`,
      images: [pet.main_image_url || "/placeholder.svg?height=400&width=400"],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/encontrados/${params.slug}`,
    },
  }
}

export default async function PetEncontradoPage({ params }: Props) {
  console.log(`[Encontrados] Renderizando página para slug: ${params.slug}`)

  const pet = await getPetBySlugOrId(params.slug)

  if (!pet) {
    console.log(`[Encontrados] Pet não encontrado, retornando 404`)
    notFound()
  }

  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || ""

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <PetDetails pet={pet} type="found" />

          <div className="mt-8 space-y-6">
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Ajude a encontrar o dono!</h2>
              <p className="text-muted-foreground mb-6">
                Este pet foi encontrado em {location}. Compartilhe para ajudar a encontrar seu dono.
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
      </div>
    </div>
  )
}
