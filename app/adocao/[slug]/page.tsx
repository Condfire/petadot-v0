import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getPetByIdOrSlug } from "@/lib/supabase" // Using the new unified function
import { Link } from "@/components/ui/link"

export const dynamic = "force-dynamic"

// Lista de slugs reservados que não devem ser tratados como slugs de pet
const RESERVED_SLUGS = ["cadastrar", "editar", "excluir", "novo"]

// Define a more specific Pet type if available
type PetPageProps = {
  params: { slug: string }
}

// Define your Pet type, perhaps in lib/types.ts
interface Pet {
  id: string
  name: string
  status: string
  description: string
  // ... other pet fields
  user_id?: string // ID of the user who listed the pet
  users?: {
    // From the join in getPetByIdOrSlug
    id: string
    name: string
    email: string
    type: string
    avatar_url?: string
  } | null
  // ... include all fields returned by getPetByIdOrSlug
}

export async function generateMetadata({ params }: PetPageProps): Promise<Metadata> {
  const pet = (await getPetByIdOrSlug(params.slug, "adoption")) as Pet | null

  if (!pet || (pet.status && pet.status.toLowerCase() !== "approved")) {
    return {
      title: "Pet não encontrado | PetAdot",
      description: "Este pet não está disponível ou não foi encontrado.",
    }
  }
  return {
    title: `${pet.name || "Pet para Adoção"} | PetAdot`,
    description: `Detalhes sobre ${pet.name || "este pet"}. ${pet.description?.substring(0, 150) || ""}`,
    openGraph: {
      title: `${pet.name || "Pet para Adoção"} | PetAdot`,
      description: pet.description || "Um amigo esperando por um lar.",
      // images: [{ url: pet.main_image_url || pet.image_url || '/default-pet-image.png' }],
    },
  }
}

export default async function AdocaoDetailPage({ params }: PetPageProps) {
  const supabaseAuth = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabaseAuth.auth.getSession()

  const pet = (await getPetByIdOrSlug(params.slug, "adoption")) as Pet | null

  if (!pet) {
    notFound()
  }

  const petStatus = pet.status ? pet.status.toLowerCase() : ""
  const isPubliclyViewable = petStatus === "approved"

  let canView = isPubliclyViewable

  // Allow owner or admin to view regardless of public status
  if (!canView && session?.user) {
    // Ensure you have a way to identify admins, e.g., a custom claim or a separate table
    // This is a simplified example for admin check. Adjust to your actual role management.
    // const { data: userProfile } = await supabaseAuth.from('profiles').select('role').eq('id', session.user.id).single();
    // const isAdmin = userProfile?.role === 'admin';
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL // Example: admin identified by specific email

    const isOwner = pet.user_id === session.user.id || (pet.users && pet.users.id === session.user.id)

    if (isAdmin || isOwner) {
      canView = true
    }
  }

  if (!canView) {
    // For non-approved pets and non-privileged users, show a specific message or 404
    // notFound();
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Pet Não Disponível</h1>
        <p>Este pet não está atualmente disponível para visualização pública.</p>
        {session?.user && (pet.user_id === session.user.id || (pet.users && pet.users.id === session.user.id)) && (
          <p className="mt-2 text-sm text-muted-foreground">
            Você pode gerenciar este pet no seu{" "}
            <Link href="/dashboard/pets" className="underline">
              painel
            </Link>
            .
          </p>
        )}
      </div>
    )
  }

  // If viewable, render pet details.
  // You should create a dedicated component for displaying pet details.
  // e.g., return <PetDetailsClient pet={pet} currentUser={session?.user} />;
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-2">{pet.name || "Detalhes do Pet"}</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Status:{" "}
        <span className={`font-semibold ${isPubliclyViewable ? "text-green-600" : "text-orange-500"}`}>
          {pet.status}
        </span>
      </p>

      {/* Placeholder for actual PetDetailsClient component */}
      <div className="bg-card p-6 rounded-lg shadow">
        <p className="mb-4 whitespace-pre-wrap">{pet.description || "Nenhuma descrição fornecida."}</p>
        {/* Add more pet details here: species, breed, age, images, contact, etc. */}
        {pet.users && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-md font-semibold">Listado por:</h3>
            <p>
              {pet.users.name} ({pet.users.type})
            </p>
          </div>
        )}
      </div>
      {/* Add image gallery, contact forms, etc. */}
    </div>
  )
}

// Remember to create similar detail pages for 'lost' and 'found' categories:
// app/perdidos/[slug]/page.tsx
// app/encontrados/[slug]/page.tsx
// They will use getPetByIdOrSlug(params.slug, "lost") or getPetByIdOrSlug(params.slug, "found") respectively,
// and apply the same status and ownership/admin checking logic.
