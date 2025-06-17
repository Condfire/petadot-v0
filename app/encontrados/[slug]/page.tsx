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
  const supabase = createClient()

  console.log(`[Encontrados] Iniciando busca para: ${slugOrId}`)

  try {
    // Verificar se é UUID ou slug
    const isUuidValue = isUuid(slugOrId)
    console.log(`[Encontrados] É UUID: ${isUuidValue}`)

    // Primeira tentativa: buscar pelo identificador fornecido
    let query = supabase
      .from("pets")
      .select(`
        *,
        pet_images (
          url,
          position
        )
      `)
      .eq("category", "found")

    // Não filtrar por status para debug
    if (isUuidValue) {
      query = query.eq("id", slugOrId)
    } else {
      query = query.eq("slug", slugOrId)
    }

    let { data: pet, error } = await query.single()

    console.log(`[Encontrados] Primeira busca - Pet:`, pet)
    console.log(`[Encontrados] Primeira busca - Erro:`, error)

    // Se não encontrou por slug, tentar por ID
    if (error && !isUuidValue) {
      console.log(`[Encontrados] Tentando busca por ID: ${slugOrId}`)

      const { data: petById, error: errorById } = await supabase
        .from("pets")
        .select(`
          *,
          pet_images (
            url,
            position
          )
        `)
        .eq("category", "found")
        .eq("id", slugOrId)
        .single()

      console.log(`[Encontrados] Segunda busca - Pet:`, petById)
      console.log(`[Encontrados] Segunda busca - Erro:`, errorById)

      if (!errorById && petById) {
        pet = petById
        error = null
      }
    }

    // Se ainda não encontrou, tentar buscar sem filtro de categoria para debug
    if (error) {
      console.log(`[Encontrados] Tentando busca sem filtro de categoria`)

      const { data: petAny, error: errorAny } = await supabase
        .from("pets")
        .select(`
          *,
          pet_images (
            url,
            position
          )
        `)
        .eq(isUuidValue ? "id" : "slug", slugOrId)
        .single()

      console.log(`[Encontrados] Busca sem filtro - Pet:`, petAny)
      console.log(`[Encontrados] Busca sem filtro - Erro:`, errorAny)

      if (!errorAny && petAny) {
        console.log(`[Encontrados] Pet encontrado mas com categoria: ${petAny.category}`)
      }
    }

    if (error || !pet) {
      console.error(`[Encontrados] Erro final ao buscar pet:`, error)
      return null
    }

    console.log(`[Encontrados] Pet encontrado com sucesso:`, {
      id: pet.id,
      name: pet.name,
      category: pet.category,
      status: pet.status,
      slug: pet.slug,
    })

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
  const imageUrl =
    pet.main_image_url || (pet.pet_images && pet.pet_images[0]?.url) || "/placeholder.svg?height=400&width=400"

  return {
    title: `Pet encontrado em ${location} - Petadot`,
    description: pet.description || `Pet encontrado em ${location}. Ajude a encontrar seu dono.`,
    openGraph: {
      title: `Pet encontrado em ${location}!`,
      description: `Ajude a encontrar o dono deste pet. ${pet.description || ""}`,
      images: [imageUrl],
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
