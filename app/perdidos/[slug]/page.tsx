import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PetCharacteristics } from "@/components/pet-characteristics"
import { PetInfoCard } from "@/components/pet-info-card"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetContactInfo } from "@/components/pet-contact-info"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { PetSightingModal } from "@/components/pet-sighting-modal"
import { ShareButton } from "@/components/share-button"
import { formatDate } from "@/lib/utils"
import { isUuid } from "@/lib/slug-utils"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils"
import JsonLd from "@/components/json-ld"
import { generateLostPetSchema } from "@/lib/structured-data"
import type { Metadata } from "next"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

interface PetLostDetailPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PetLostDetailPageProps): Promise<Metadata> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const slugOrId = params.slug
    const isUuidValue = isUuid(slugOrId)

    console.log(`[LostMetadata] Buscando pet perdido: ${slugOrId}, isUuid: ${isUuidValue}`)

    // Query for lost pets from unified pets table
    const { data: pet } = await supabase
      .from("pets")
      .select("*")
      .eq("category", "lost")
      .eq(isUuidValue ? "id" : "slug", slugOrId)
      .maybeSingle()

    if (!pet) {
      console.log("[LostMetadata] Pet perdido não encontrado para slug/ID:", slugOrId)
      return {
        title: "Pet não encontrado | PetAdot",
        description: "O pet perdido que você está procurando não foi encontrado.",
      }
    }

    console.log("[LostMetadata] Pet perdido encontrado:", pet.name, "Status:", pet.status)

    const location = pet.location || (pet.city && pet.state ? `${pet.city}, ${pet.state}` : "")
    const speciesDisplay = mapPetSpecies(pet.species, pet.species_other)

    return {
      title: `${pet.name || "Pet perdido"} | Perdidos | PetAdot`,
      description: pet.description
        ? `${pet.name} - ${speciesDisplay} perdido ${location ? `em ${location}` : ""}. ${pet.description.substring(
            0,
            150,
          )}${pet.description.length > 150 ? "..." : ""}`
        : `${pet.name} - ${speciesDisplay} perdido ${location ? `em ${location}` : ""}. Ajude a encontrá-lo.`,
      openGraph: {
        title: `${pet.name || "Pet perdido"} | Perdidos | PetAdot`,
        description: pet.description
          ? `${pet.name} - ${speciesDisplay} perdido ${location ? `em ${location}` : ""}. ${pet.description.substring(
              0,
              150,
            )}${pet.description.length > 150 ? "..." : ""}`
          : `${pet.name} - ${speciesDisplay} perdido ${location ? `em ${location}` : ""}. Ajude a encontrá-lo.`,
        images: [
          {
            url: pet.main_image_url || pet.image_url || "/placeholder.svg?key=p34o7",
            width: 1200,
            height: 630,
            alt: pet.name || "Pet perdido",
          },
        ],
        type: "website",
      },
    }
  } catch (error) {
    console.error("[LostMetadata] Erro ao gerar metadata:", error)
    return {
      title: "Pet perdido | PetAdot",
      description: "Ajude a encontrar pets perdidos na plataforma PetAdot",
    }
  }
}

export default async function PetLostDetailPage({ params }: PetLostDetailPageProps) {
  try {
    console.log(`[LostDetail] Iniciando busca para slug: ${params.slug}`)

    // Check if this is a special route like "cadastrar"
    if (params.slug === "cadastrar") {
      console.log(`[LostDetail] Slug reservado detectado: ${params.slug}`)
      notFound()
    }

    const supabase = createServerComponentClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    console.log(`[LostDetail] Usuário autenticado: ${userId ? "Sim" : "Não"}`)

    // Determine if the slug is a UUID or a slug
    const isUUID = isUuid(params.slug)

    console.log(`[LostDetail] Parâmetros: slug=${params.slug}, isUuid=${isUUID}`)

    // Query for lost pets from unified pets table
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*")
      .eq("category", "lost")
      .eq(isUUID ? "id" : "slug", params.slug)
      .maybeSingle()

    console.log(`[LostDetail] Query executada. Erro:`, error)
    console.log(`[LostDetail] Pet encontrado:`, pet ? `${pet.name} (${pet.id})` : "Nenhum")

    if (error) {
      console.error("[LostDetail] Erro ao buscar pet perdido:", error)
      notFound()
    }

    if (!pet) {
      console.error("[LostDetail] Pet perdido não encontrado para slug/ID:", params.slug)
      notFound()
    }

    // Verificar se o pet está aprovado ou pertence ao usuário atual
    const isApproved = pet.status === "approved" || pet.status === "aprovado" || pet.status === null
    const isOwner = userId && pet.user_id === userId

    console.log(`[LostDetail] Status do pet: ${pet.status}, Aprovado: ${isApproved}, É dono: ${isOwner}`)

    // Se o pet não estiver aprovado e não pertencer ao usuário atual, retornar 404
    if (!isApproved && !isOwner) {
      console.warn(
        `[LostDetail] Acesso negado para pet ${pet.id} (status: ${pet.status}, owner: ${pet.user_id}, current user: ${userId})`,
      )
      notFound()
    }

    // Formatar a data
    const formattedDate = formatDate(pet.created_at)

    // Preparar as imagens
    const images = []
    const imageUrl = pet.main_image_url || pet.image_url
    if (imageUrl) images.push(imageUrl)
    if (pet.additional_images && Array.isArray(pet.additional_images)) {
      images.push(...pet.additional_images)
    }

    // Preparar a localização
    const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : null

    // Mapear valores para exibição em português
    const speciesDisplay = mapPetSpecies(pet.species, pet.species_other)
    const sizeDisplay = mapPetSize(pet.size, pet.size_other)
    const genderDisplay = mapPetGender(pet.gender, pet.gender_other)
    const colorDisplay = mapPetColor(pet.color, pet.color_other)

    // Gerar dados estruturados
    const structuredData = generateLostPetSchema(pet, {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.petadot.com.br",
    })

    console.log(`[LostDetail] Renderizando página para pet: ${pet.name}`)

    return (
      <main className="container mx-auto px-4 py-8">
        {/* JSON-LD para dados estruturados */}
        <JsonLd data={structuredData} />

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <PetImageGallery images={images} alt={pet.name || "Pet perdido"} className="mb-4" />

            <div className="flex flex-wrap gap-2 mb-4">
              <ShareButton
                url={`${process.env.NEXT_PUBLIC_APP_URL}/perdidos/${pet.slug || pet.id}`}
                title={`Ajude a encontrar ${pet.name || "este pet"}!`}
                description={`Pet perdido em ${location || "algum lugar"}. Ajude a encontrá-lo.`}
                className="w-full sm:w-auto"
              />

              <PetSightingModal
                petId={pet.id}
                petName={pet.name || "Pet perdido"}
                petType="lost"
                className="w-full sm:w-auto sm:flex-1"
              />
            </div>

            {pet.is_resolved && <PetResolvedAlert type="lost" resolvedAt={pet.resolved_at} className="mb-4" />}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pet.name || "Pet Perdido"}</h1>
              <p className="text-muted-foreground">Perdido desde {formattedDate}</p>
              {location && <p className="text-muted-foreground">Localização: {location}</p>}
            </div>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="characteristics">Características</TabsTrigger>
                <TabsTrigger value="description">Descrição</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 pt-4">
                <PetInfoCard
                  species={speciesDisplay}
                  breed={pet.breed}
                  age={pet.age}
                  gender={genderDisplay}
                  size={sizeDisplay}
                  color={colorDisplay}
                  location={location}
                  date={formattedDate}
                />

                <PetContactInfo
                  name={pet.contact_name}
                  email={pet.contact_email}
                  phone={pet.contact_phone || pet.contact}
                />
              </TabsContent>

              <TabsContent value="characteristics" className="pt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Características do Pet</h3>

                  <PetCharacteristics
                    isVaccinated={pet.is_vaccinated}
                    isNeutered={pet.is_neutered}
                    isSpecialNeeds={pet.is_special_needs}
                    specialNeedsDescription={pet.special_needs_description}
                    goodWithKids={pet.good_with_kids}
                    goodWithCats={pet.good_with_cats}
                    goodWithDogs={pet.good_with_dogs}
                  />
                </div>
              </TabsContent>

              <TabsContent value="description" className="pt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                  <p className="whitespace-pre-wrap">{pet.description || "Nenhuma descrição fornecida."}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error("[LostDetail] Erro não tratado:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro!</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao carregar os detalhes deste pet. Por favor, tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}
