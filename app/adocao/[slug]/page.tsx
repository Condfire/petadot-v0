import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import PetDetails from "@/components/PetDetails"
import { ShareButtons } from "@/components/share-buttons"
import { AdoptionInterestModal } from "@/components/adoption-interest-modal"
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
    .eq(isUuidValue ? "id" : "slug", slugOrId)
    .single()

  if (error) {
    console.error("Erro ao buscar pet para adoção:", error)
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
    title: `${pet.name || "Pet para adoção"} - Adoção em ${location} - Petadot`,
    description: pet.description || `Conheça ${pet.name || "este pet"} disponível para adoção em ${location}`,
    openGraph: {
      title: `Conheça ${pet.name || "este pet"} - Disponível para adoção!`,
      description: `${pet.name || "Este pet"} está procurando um lar em ${location}. ${pet.description || ""}`,
      images: [pet.main_image_url || (pet.images && pet.images[0]) || "/placeholder.svg?height=400&width=400"], // Usa images array primeiro
      url: `${process.env.NEXT_PUBLIC_APP_URL}/adocao/${params.slug}`,
    },
  }
}

export default async function PetAdocaoPage({ params }: Props) {
  const pet = await getPetBySlugOrId(params.slug)

  if (!pet) {
    notFound()
  }

  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.city || pet.state || ""

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PetDetails pet={pet} type="adoption" />

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Compartilhe</h2>
            <p className="text-muted-foreground mb-4">
              Ajude {pet.name || "este pet"} a encontrar um lar! Compartilhe com seus amigos e familiares.
            </p>

            <ShareButtons
              title={`Conheça ${pet.name || "este pet"} - Petadot`}
              url={`${process.env.NEXT_PUBLIC_APP_URL}/adocao/${params.slug}`}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Tenho interesse!</h2>
            <p className="text-muted-foreground mb-4">
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
  )
}
