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
import { formatDate } from "@/lib/utils"
import { isUuid } from "@/lib/slug-utils"
import JsonLd from "@/components/json-ld"
import { generateAdoptionPetSchema } from "@/lib/structured-data"

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

    console.log(`[Metadata] Buscando pet para adoção: ${slugOrId}, isUuid: ${isUuidValue}`)

    // Query for adoption pets from unified pets table
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*")
      .eq("category", "adoption")
      .eq(isUuidValue ? "id" : "slug", slugOrId)
      .maybeSingle()

    if (error) {
      console.error("[Metadata] Erro ao buscar pet para metadata:", error)
      return {
        title: "Pet não encontrado | PetAdot",
        description: "O pet que você está procurando não foi encontrado.",
      }
    }

    if (!pet) {
      console.log("[Metadata] Pet não encontrado para slug/ID:", slugOrId)
      return {
        title: "Pet não encontrado | PetAdot",
        description: "O pet que você está procurando não foi encontrado.",
      }
    }

    console.log("[Metadata] Pet encontrado:", pet.name, "Status:", pet.status)

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
    console.error("[Metadata] Erro ao gerar metadata:", error)
    return {
      title: "Pet para adoção | PetAdot",
      description: "Encontre o pet ideal para adoção na plataforma PetAdot",
    }
  }
}

export default async function PetAdoptionDetailPage({ params }: PetAdoptionDetailPageProps) {
  try {
    console.log(`[AdoptionDetail] Iniciando busca para slug: ${params.slug}`)

    // Verificar se o slug é um slug reservado
    if (RESERVED_SLUGS.includes(params.slug)) {
      console.log(`[AdoptionDetail] Slug reservado detectado: ${params.slug}`)
      notFound()
    }

    const supabase = createServerComponentClient({ cookies })
    const slugOrId = params.slug
    const isUuidValue = isUuid(slugOrId)

    console.log(`[AdoptionDetail] Parâmetros: slug=${slugOrId}, isUuid=${isUuidValue}`)

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    console.log(`[AdoptionDetail] Usuário autenticado: ${userId ? "Sim" : "Não"}`)

    // Get pet details using slug or UUID from unified pets table
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*")
      .eq("category", "adoption")
      .eq(isUuidValue ? "id" : "slug", slugOrId)
      .maybeSingle()

    console.log(`[AdoptionDetail] Query executada. Erro:`, error)
    console.log(`[AdoptionDetail] Pet encontrado:`, pet ? `${pet.name} (${pet.id}) - Status: ${pet.status}` : "Nenhum")
    console.log(`[AdoptionDetail] Pet data completo:`, pet)

    if (error) {
      console.error("[AdoptionDetail] Erro ao buscar pet:", error)
      notFound()
    }

    if (!pet) {
      console.error("[AdoptionDetail] Pet não encontrado para slug/ID:", slugOrId)
      notFound()
    }

    // Add additional validation for required fields
    if (!pet.id) {
      console.error("[AdoptionDetail] Pet data is missing required fields:", pet)
      notFound()
    }

    // Verificar se o pet está aprovado ou pertence ao usuário atual
    // Para pets de adoção, verificar status "available", "approved" ou null
    const isApproved = pet.status === "approved" || pet.status === "available" || pet.status === null
    const isOwner = userId && pet.user_id === userId

    console.log(`[AdoptionDetail] Status do pet: ${pet.status}, Aprovado: ${isApproved}, É dono: ${isOwner}`)

    // Se o pet não estiver aprovado e não pertencer ao usuário atual, retornar 404
    if (!isApproved && !isOwner) {
      console.warn(
        `[AdoptionDetail] Acesso negado para pet ${pet.id} (status: ${pet.status}, owner: ${pet.user_id}, current user: ${userId})`,
      )
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

    // Informações de contato
    const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : null

    // Obter o número de telefone para contato
    const contactPhone = pet.contact || pet.contact_phone || null

    // Gerar dados estruturados
    const structuredData = generateAdoptionPetSchema(pet, {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.petadot.com.br",
    })

    console.log(`[AdoptionDetail] Renderizando página para pet: ${pet.name}`)

    return (
      <main className="container mx-auto px-4 py-8">
        {/* JSON-LD para dados estruturados */}
        <JsonLd data={structuredData} />

        {pet ? (
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
                  <PetInfoCard pet={pet} />
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
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pet não encontrado</AlertTitle>
            <AlertDescription>
              O pet que você está procurando não foi encontrado ou não está disponível.
            </AlertDescription>
          </Alert>
        )}
      </main>
    )
  } catch (error) {
    console.error("[AdoptionDetail] Erro não tratado:", error)
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
