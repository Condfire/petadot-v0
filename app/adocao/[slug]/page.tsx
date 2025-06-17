import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import PetDetails from "@/components/PetDetails"
import { ShareButtons } from "@/components/share-buttons"
import { AdoptionInterestModal } from "@/components/adoption-interest-modal"
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
    console.log(`[Adoção] Parâmetro inválido: ${slugOrId}`)
    return null
  }

  const supabase = createClient()

  console.log(`[Adoção] Buscando pet: ${slugOrId}`)

  try {
    const isUuidValue = isUuid(slugOrId)
    console.log(`[Adoção] É UUID: ${isUuidValue}`)

    // Buscar por slug primeiro, depois por ID
    let pet = null

    if (!isUuidValue) {
      // Tentar buscar por slug
      const { data: slugData, error: slugError } = await supabase
        .from("pets")
        .select(`
          *,
          ongs:user_id(
            id,
            name,
            logo_url,
            city,
            state,
            contact_whatsapp
          )
        `)
        .eq("category", "adoption")
        .eq("slug", slugOrId)
        .maybeSingle()

      console.log(`[Adoção] Busca por slug:`, { slugData, slugError })

      if (!slugError && slugData) {
        pet = slugData
      }
    }

    // Se não encontrou por slug ou é UUID, buscar por ID
    if (!pet) {
      const { data: idData, error: idError } = await supabase
        .from("pets")
        .select(`
          *,
          ongs:user_id(
            id,
            name,
            logo_url,
            city,
            state,
            contact_whatsapp
          )
        `)
        .eq("category", "adoption")
        .eq("id", slugOrId)
        .maybeSingle()

      console.log(`[Adoção] Busca por ID:`, { idData, idError })

      if (!idError && idData) {
        pet = idData
      }
    }

    console.log(`[Adoção] Pet encontrado:`, pet)
    return pet
  } catch (err) {
    console.error(`[Adoção] Erro na função getPetBySlugOrId:`, err)
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
    title: `${pet.name || "Pet para adoção"} - Adoção em ${location} - Petadot`,
    description: pet.description || `Conheça ${pet.name || "este pet"} disponível para adoção em ${location}`,
    openGraph: {
      title: `Conheça ${pet.name || "este pet"} - Disponível para adoção!`,
      description: `${pet.name || "Este pet"} está procurando um lar em ${location}. ${pet.description || ""}`,
      images: [pet.main_image_url || "/placeholder.svg?height=400&width=400"],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/adocao/${params.slug}`,
    },
  }
}

export default async function PetAdocaoPage({ params }: Props) {
  console.log(`[Adoção] Renderizando página para slug: ${params.slug}`)

  const pet = await getPetBySlugOrId(params.slug)

  if (!pet) {
    console.log(`[Adoção] Pet não encontrado, retornando 404`)
    notFound()
  }

  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || ""

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <PetDetails pet={pet} type="adoption" />

          <div className="mt-8 space-y-6">
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Compartilhe</h2>
              <p className="text-muted-foreground mb-6">
                Ajude {pet.name || "este pet"} a encontrar um lar! Compartilhe com seus amigos e familiares.
              </p>

              <ShareButtons
                title={`Conheça ${pet.name || "este pet"} - Petadot`}
                url={`${process.env.NEXT_PUBLIC_APP_URL}/adocao/${params.slug}`}
              />
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Tenho interesse!</h2>
              <p className="text-muted-foreground mb-6">
                Se você tem interesse em adotar {pet.name || "este pet"}, clique no botão abaixo para entrar em contato!
              </p>

              <div className="flex flex-wrap gap-3">
                <AdoptionInterestModal
                  petName={pet.name || "este pet"}
                  owner={pet.ongs || null}
                  className="flex-1 min-w-[200px]"
                />

                <ReportPetButton petId={pet.id} petName={pet.name || "este pet"} className="flex-1 min-w-[200px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
