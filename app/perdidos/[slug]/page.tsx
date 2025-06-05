import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getPetByIdOrSlug } from "@/lib/supabase"
import Link from "next/link" // Using next/link
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Home, ShieldCheck } from "lucide-react"
import { PetImageGallery } from "@/components/pet-image-gallery" // Assuming component exists
import { PetInfoCard } from "@/components/pet-info-card" // Assuming component exists
import { PetCharacteristics } from "@/components/pet-characteristics" // Assuming component exists
import { PetContactInfo } from "@/components/pet-contact-info" // Assuming component exists
import { ShareButton } from "@/components/share-button" // Assuming component exists
import { PetSightingModal } from "@/components/pet-sighting-modal" // Assuming component exists
import { formatDate } from "@/lib/utils" // Assuming cn and formatDate exist
import JsonLd from "@/components/json-ld"
import { generateLostPetSchema } from "@/lib/structured-data"

export const dynamic = "force-dynamic"

// Define your Pet type, perhaps in lib/types.ts
interface Pet {
  id: string
  name: string
  status: string
  description: string
  category: "lost" | "adoption" | "found"
  species?: string
  breed?: string
  age?: string
  gender?: string
  size?: string
  color?: string
  main_image_url?: string | null
  additional_images?: string[] | null
  city?: string
  state?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  contact?: string // Legacy contact field
  created_at: string
  user_id?: string
  users?: {
    id: string
    name: string
    email: string
    type: string
    avatar_url?: string
  } | null
  is_vaccinated?: boolean
  is_neutered?: boolean
  is_special_needs?: boolean
  special_needs_description?: string
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean
  temperament?: string[]
  energy_level?: string
  slug?: string
  is_resolved?: boolean
  resolved_at?: string
  // Add other relevant fields
}

type PetPageProps = {
  params: { slug: string }
}

export async function generateMetadata({ params }: PetPageProps): Promise<Metadata> {
  const pet = (await getPetByIdOrSlug(params.slug, "lost")) as Pet | null

  if (!pet || (pet.status && pet.status.toLowerCase() !== "approved")) {
    return {
      title: "Pet Perdido Não Encontrado | PetAdot",
      description: "Este pet perdido não está disponível publicamente ou não foi encontrado.",
    }
  }

  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : "local não informado"
  const title = `${pet.name || "Pet Perdido"} em ${location} | PetAdot`
  const description =
    pet.description?.substring(0, 150) || `${pet.name || "Um pet"} perdido em ${location}. Ajude a encontrá-lo.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: pet.main_image_url || "/placeholder.svg?width=1200&height=630" }],
      type: "article", // More specific for a single item
    },
  }
}

export default async function PerdidoDetailPage({ params }: PetPageProps) {
  const supabaseAuth = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabaseAuth.auth.getSession()

  const pet = (await getPetByIdOrSlug(params.slug, "lost")) as Pet | null

  if (!pet) {
    notFound()
  }

  const petStatus = pet.status ? pet.status.toLowerCase() : ""
  const isPubliclyViewable = petStatus === "approved"

  let canView = isPubliclyViewable
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL
  const isOwner = pet.user_id === session?.user?.id || (pet.users && pet.users.id === session?.user?.id)

  if (!canView && session?.user) {
    if (isAdmin || isOwner) {
      canView = true
    }
  }

  if (!canView) {
    return (
      <main className="container mx-auto px-4 py-12 text-center">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pet Não Disponível Publicamente</AlertTitle>
          <AlertDescription>
            Este pet perdido não está atualmente aprovado para visualização pública.
            {isOwner && (
              <>
                <br />
                Você pode ver e gerenciar este pet no seu{" "}
                <Link href="/dashboard/pets" className="font-semibold underline hover:text-destructive-foreground">
                  painel de controle
                </Link>
                .
              </>
            )}
            {isAdmin && !isOwner && (
              <>
                <br />
                Como administrador, você pode revisar este pet no{" "}
                <Link href="/admin-alt/pets" className="font-semibold underline hover:text-destructive-foreground">
                  painel de administração
                </Link>
                .
              </>
            )}
          </AlertDescription>
        </Alert>
        <Link
          href="/perdidos"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Home className="mr-2 h-4 w-4" /> Voltar para Pets Perdidos
        </Link>
      </main>
    )
  }

  const images = [pet.main_image_url, ...(pet.additional_images || [])].filter(Boolean) as string[]
  const location = pet.city && pet.state ? `${pet.city}, ${pet.state}` : null
  const formattedDate = formatDate(pet.created_at)
  const structuredData = generateLostPetSchema(pet, {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.petadot.com.br",
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <JsonLd data={structuredData} />
      {!isPubliclyViewable && (isOwner || isAdmin) && (
        <Alert variant="warning" className="mb-6">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Visualização Restrita</AlertTitle>
          <AlertDescription>
            Este pet está com status "{pet.status}" e não é visível publicamente. Você está vendo esta página como{" "}
            {isAdmin && isOwner ? "proprietário e administrador" : isOwner ? "proprietário" : "administrador"}.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <PetImageGallery
            images={images}
            alt={pet.name || "Pet perdido"}
            className="mb-4 rounded-lg overflow-hidden shadow-lg"
          />
          <div className="flex flex-wrap gap-2 mb-4">
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_APP_URL}/perdidos/${pet.slug || pet.id}`}
              title={`Ajude a encontrar ${pet.name || "este pet"}!`}
              description={`${pet.name || "Um pet"} perdido em ${location || "local não informado"}. Ajude a encontrá-lo.`}
              className="w-full sm:w-auto"
            />
            <PetSightingModal
              petId={pet.id}
              petName={pet.name || "Pet perdido"}
              petType="lost"
              className="w-full sm:w-auto sm:flex-1"
            />
          </div>
          {pet.is_resolved && (
            <Alert variant="success" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pet Encontrado!</AlertTitle>
              <AlertDescription>
                Este pet foi marcado como encontrado em {formatDate(pet.resolved_at || "")}.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">{pet.name || "Pet Perdido"}</h1>
            <p className="text-muted-foreground">Perdido desde {formattedDate}</p>
            {location && <p className="text-muted-foreground">Localização: {location}</p>}
          </div>

          <PetInfoCard
            species={pet.species}
            breed={pet.breed}
            age={pet.age}
            gender={pet.gender}
            size={pet.size}
            color={pet.color}
            location={location}
            date={formattedDate}
          />
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
          {pet.description && (
            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Descrição Detalhada</h2>
              <p className="text-foreground whitespace-pre-wrap">{pet.description}</p>
            </div>
          )}
          <PetContactInfo name={pet.contact_name} email={pet.contact_email} phone={pet.contact_phone || pet.contact} />
        </div>
      </div>
    </main>
  )
}
