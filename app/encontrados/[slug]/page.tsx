import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PetCharacteristics } from "@/components/pet-characteristics"
import { PetInfoCard } from "@/components/pet-info-card"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetContactInfo } from "@/components/pet-contact-info"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { PetRecognitionModal } from "@/components/pet-recognition-modal"
import { ShareButton } from "@/components/share-button"
import { formatDate } from "@/lib/utils"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor } from "@/lib/utils" // Importar de lib/utils
import JsonLd from "@/components/json-ld"
import { generateFoundPetSchema } from "@/lib/structured-data"
import type { Metadata } from "next"
import { isUuid } from "@/lib/slug-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

interface PetFoundDetailPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PetFoundDetailPageProps): Promise<Metadata> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const idOrSlug = params.slug
    const isUuidValue = isUuid(idOrSlug)

    // Query based on whether it's a UUID or slug
    const { data: pet } = await supabase
      .from("pets")
      .select("*") // Adicionado .select("*")
      .eq("category", "found")
      .eq(isUuidValue ? "id" : "slug", idOrSlug)
      .maybeSingle()

    if (!pet) {
      return {
        title: "Pet não encontrado | PetAdot",
        description: "O pet encontrado que você está procurando não foi encontrado.",
      }
    }

    const location = pet.location || (pet.city && pet.state ? `${pet.city}, ${pet.state}` : "")
    const speciesDisplay = mapPetSpecies(pet.species, pet.species_other)

    return {
      title: `${pet.name || "Pet encontrado"} | Encontrados | PetAdot`,
      description: pet.description
        ? `${pet.name} - ${speciesDisplay} encontrado ${location ? `em ${location}` : ""}. ${pet.description.substring(
            0,
            150,
          )}${pet.description.length > 150 ? "..." : ""}`
        : `${pet.name} - ${speciesDisplay} encontrado ${location ? `em ${location}` : ""}. Ajude a encontrar seu dono.`,
      openGraph: {
        title: `${pet.name || "Pet encontrado"} | Encontrados | PetAdot`,
        description: pet.description
          ? `${pet.name} - ${speciesDisplay} encontrado ${location ? `em ${location}` : ""}. ${pet.description.substring(
              0,
              150,
            )}${pet.description.length > 150 ? "..." : ""}`
          : `${pet.name} - ${speciesDisplay} encontrado ${location ? `em ${location}` : ""}. Ajude a encontrar seu dono.`,
        images: [
          {
            url: pet.main_image_url || "/placeholder.svg?key=p34o7",
            width: 1200,
            height: 630,
            alt: pet.name || "Pet encontrado",
          },
        ],
        type: "website",
      },
    }
  } catch (error) {
    return {
      title: "Pet encontrado | PetAdot",
      description: "Ajude a encontrar o dono de pets encontrados na plataforma PetAdot",
    }
  }
}

export default async function PetFoundDetailPage({ params }: PetFoundDetailPageProps) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const idOrSlug = params.slug
    const isUuidValue = isUuid(idOrSlug)

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // Buscar o pet encontrado pelo ID ou slug
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*") // Adicionado .select("*")
      .eq("category", "found")
      .eq(isUuidValue ? "id" : "slug", idOrSlug)
      .maybeSingle()

    if (error || !pet) {
      console.error("Erro ao buscar pet encontrado:", error)
      notFound()
    }

    // Verificar se o pet está aprovado ou pertence ao usuário atual
    const isApproved = pet.status === "approved" || pet.status === "aprovado" || pet.status === null
    const isOwner = userId && pet.user_id === userId

    // Se o pet não estiver aprovado e não pertencer ao usuário atual, retornar 404
    if (!isApproved && !isOwner) {
      notFound()
    }

    // Formatar a data
    const formattedDate = formatDate(pet.created_at)

    // Preparar as imagens
    const images = []
    if (pet.main_image_url) images.push(pet.main_image_url)
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
    const structuredData = generateFoundPetSchema(pet, {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.petadot.com.br",
    })

    return (
      <main className="container mx-auto px-4 py-8">
        {/* JSON-LD para dados estruturados */}
        <JsonLd data={structuredData} />

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <PetImageGallery images={images} alt={pet.name || "Pet encontrado"} className="mb-4" />

            <div className="flex flex-wrap gap-2 mb-4">
              <ShareButton
                url={`${process.env.NEXT_PUBLIC_APP_URL}/encontrados/${pet.slug || pet.id}`}
                title={`Ajude a encontrar o dono deste pet!`}
                description={`Pet encontrado em ${location || "algum lugar"}. Ajude a encontrar seu dono.`}
                className="w-full sm:w-auto"
              />

              <PetRecognitionModal
                petId={pet.id}
                petName={pet.name || "Pet encontrado"}
                className="w-full sm:w-auto sm:flex-1"
              />
            </div>

            {pet.is_resolved && <PetResolvedAlert type="found" resolvedAt={pet.resolved_at} className="mb-4" />}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pet.name || "Pet Encontrado"}</h1>
              <p className="text-muted-foreground">Encontrado em {formattedDate}</p>
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
    console.error("Erro não tratado:", error)
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
