import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PetCharacteristics } from "@/components/pet-characteristics"
import { PetInfoCard } from "@/components/pet-info-card"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { AdoptionInterestModal } from "@/components/adoption-interest-modal"
import { ShareButton } from "@/components/share-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils" // Importar formatDate de lib/utils
import { isUuid } from "@/lib/slug-utils"
import JsonLd from "@/components/json-ld"
import { generateAdoptionPetSchema } from "@/lib/structured-data"
import { mapPetSpecies, mapPetSize, mapPetGender } from "@/lib/utils" // Importar de lib/utils

export const dynamic = "force-dynamic"

// Lista de slugs reservados que não devem ser tratados como slugs de pet
const RESERVED_SLUGS = ["cadastrar", "editar", "excluir", "novo"]

interface PetAdoptionDetailPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PetAdoptionDetailPageProps): Promise<Metadata> {
  // Verificar se o slug é um slug reservado
  if (RESERVED_SLUGS.includes(params.slug)) {
    return {
      title: "Pet não encontrado | PetAdot",
      description: "O pet que você está procurando não foi encontrado.",
    }
  }

  try {
    const supabase = createServerComponentClient({ cookies })
    const slugOrId = params.slug
    const isUuidValue = isUuid(slugOrId)

    // Query based on whether it's a UUID or slug
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*")
      .eq(isUuidValue ? "id" : "slug", slugOrId)
      .maybeSingle()

    if (error || !pet) {
      console.error("Erro ao buscar pet para metadata:", error?.message || "Pet não encontrado ou erro desconhecido.") // Mensagem de erro mais específica
      return {
        title: "Pet não encontrado | PetAdot",
        description: "O pet que você está procurando não foi encontrado.",
      }
    }

    const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : null

    return {
      title: `${pet.name || "Pet para adoção"} | Adoção | PetAdot`,
      description: pet.description
        ? `${pet.name} - ${pet.species} para adoção ${location ? `em ${location}` : ""}. ${pet.description.substring(
            0,
            150,
          )}${pet.description.length > 150 ? "..." : ""}`
        : `${pet.name} - ${pet.species} para adoção ${location ? `em ${location}` : ""}`,
      openGraph: {
        title: `${pet.name || "Pet para adoção"} | Adoção | PetAdot`,
        description: pet.description
          ? `${pet.name} - ${pet.species} para adoção ${location ? `em ${location}` : ""}. ${pet.description.substring(
              0,
              150,
            )}${pet.description.length > 150 ? "..." : ""}`
          : `${pet.name} - ${pet.species} para adoção ${location ? `em ${location}` : ""}`,
        images: [
          {
            url: pet.main_image_url || "/placeholder.svg?key=p34o7",
            width: 1200,
            height: 630,
            alt: pet.name || "Pet para adoção",
          },
        ],
        type: "website",
      },
    }
  } catch (error) {
    console.error("Erro ao gerar metadata:", error)
    return {
      title: "Pet para adoção | PetAdot",
      description: "Encontre o pet ideal para adoção na plataforma PetAdot",
    }
  }
}

export default async function PetAdoptionDetailPage({ params }: PetAdoptionDetailPageProps) {
  try {
    // Verificar se o slug é um slug reservado
    if (RESERVED_SLUGS.includes(params.slug)) {
      // Em vez de redirecionar, mostrar uma página de "não encontrado"
      notFound()
    }

    const supabase = createServerComponentClient({ cookies })
    const slugOrId = params.slug
    const isUuidValue = isUuid(slugOrId)

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // Get pet details using slug or UUID
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*")
      .eq(isUuidValue ? "id" : "slug", slugOrId)
      .maybeSingle()

    if (error) {
      console.error("Erro ao buscar pet:", error.message) // Mensagem de erro mais específica
      notFound()
    }

    if (!pet) {
      console.error("Pet não encontrado para o slug/ID:", slugOrId) // Mensagem de erro mais específica
      notFound()
    }

    // Verificar se o pet está aprovado ou pertence ao usuário atual
    const isApproved = pet.status === "approved" || pet.status === "aprovado" || pet.status === null
    const isOwner = userId && pet.user_id === userId

    // Se o pet não estiver aprovado e não pertencer ao usuário atual, retornar 404
    if (!isApproved && !isOwner) {
      console.warn(
        `Acesso negado para pet ${pet.id} (status: ${pet.status}, owner: ${pet.user_id}, current user: ${userId})`,
      ) // Log de aviso
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

    // Informações de contato da ONG
    const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : null

    // Obter o número de telefone para contato (pode estar em phone ou contact)
    const contactPhone = pet.contact || null

    // Gerar dados estruturados
    const structuredData = generateAdoptionPetSchema(pet, {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.petadot.com.br",
    })

    return (
      <main className="container mx-auto px-4 py-8">
        {/* JSON-LD para dados estruturados */}
        <JsonLd data={structuredData} />

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <PetImageGallery images={images} alt={pet.name || "Pet para adoção"} className="mb-4" />

            <div className="flex flex-wrap gap-2 mb-4">
              <ShareButton
                url={`${process.env.NEXT_PUBLIC_APP_URL}/adocao/${pet.slug || pet.id}`}
                title={`Adote ${pet.name || "este pet"}!`}
                description={`${pet.name} está disponível para adoção. Conheça mais sobre este pet.`}
                className="w-full sm:w-auto"
              />

              <AdoptionInterestModal
                petId={pet.id}
                petName={pet.name}
                ongId={pet.ong_id}
                contactPhone={contactPhone}
                ongName={pet.ong_name}
                className="w-full sm:w-auto sm:flex-1"
              />
            </div>

            {pet.is_resolved && <PetResolvedAlert type="adoption" resolvedAt={pet.resolved_at} className="mb-4" />}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pet.name || "Pet para Adoção"}</h1>
              <p className="text-muted-foreground">Disponível desde {formattedDate}</p>
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
                  species={mapPetSpecies(pet.species, pet.species_other)} // Usar mapPetSpecies
                  breed={pet.breed}
                  age={pet.age}
                  gender={mapPetGender(pet.gender, pet.gender_other)} // Usar mapPetGender
                  size={mapPetSize(pet.size, pet.size_other)} // Usar mapPetSize
                  color={pet.color}
                  location={location}
                />
              </TabsContent>

              <TabsContent value="characteristics" className="space-y-4 pt-4">
                <PetCharacteristics
                  temperament={pet.temperament}
                  energy_level={pet.energy_level}
                  isVaccinated={pet.is_vaccinated}
                  isNeutered={pet.is_neutered}
                  isSpecialNeeds={pet.is_special_needs}
                  specialNeedsDescription={pet.special_needs_description}
                  goodWithKids={pet.good_with_kids}
                  goodWithCats={pet.good_with_cats}
                  goodWithDogs={pet.good_with_dogs}
                />
              </TabsContent>

              <TabsContent value="description" className="space-y-4 pt-4">
                <p>{pet.description || "Nenhuma descrição fornecida."}</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error("Erro ao buscar ou exibir detalhes do pet:", error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro!</AlertTitle>
        <AlertDescription>
          Ocorreu um erro ao carregar os detalhes deste pet. Por favor, tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    )
  }
}
