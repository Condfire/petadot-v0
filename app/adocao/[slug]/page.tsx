import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getPetByIdOrSlug } from "@/services/pet"
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

// Define a placeholder Pet type. Replace with your actual Pet type definition.
type Pet = {
  id: string
  name: string
  // ... other pet properties
  visible: boolean
  status?: string
  user_id?: string
  description?: string
  users?: {
    name: string
    type: string
  }
}

interface PetPageProps {
  params: {
    slug: string
  }
}

// Define a placeholder function to fetch the pet data.
// Replace with your actual data fetching logic.
async function getPet(slug: string): Promise<Pet | null> {
  // Simulate fetching pet data based on the slug.
  // In a real application, you would fetch this from a database or API.
  if (slug === "valid-pet") {
    return {
      id: "123",
      name: "Buddy",
      visible: true,
    }
  } else if (slug === "hidden-pet") {
    return {
      id: "456",
      name: "Shadow",
      visible: false,
    }
  } else {
    return null
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
  const isApproved = petStatus === "approved" || petStatus === "aprovado"
  const currentUserId = session?.user?.id
  const isOwner = currentUserId && pet.user_id === currentUserId

  // Verificar se o usuário pode ver este pet
  let canView = isApproved

  // Permitir que o dono veja independente do status
  if (!canView && isOwner) {
    canView = true
  }

  // Permitir que admin veja (se implementado)
  if (!canView && session?.user) {
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL
    if (isAdmin) {
      canView = true
    }
  }

  if (!canView) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Pet Não Disponível</h1>
        <p>Este pet não está atualmente disponível para visualização pública.</p>
        <p className="mt-4">
          <Link href="/adocao" className="text-primary underline">
            ← Voltar para adoção
          </Link>
        </p>
      </div>
    )
  }

  // Se pode ver, renderizar os detalhes do pet
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Alerta para pets não aprovados */}
      {!isApproved && isOwner && (
        <Alert variant="default" className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {petStatus === "rejected" || petStatus === "rejeitado"
              ? "Seu pet foi rejeitado e só é visível para você. Entre em contato com o suporte para mais informações."
              : "Seu pet está aguardando aprovação e só é visível para você."}
          </AlertDescription>
        </Alert>
      )}

      <h1 className="text-4xl font-bold mb-2">{pet.name || "Detalhes do Pet"}</h1>

      {/* Badge de status */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg text-muted-foreground">Status:</span>
        {petStatus === "approved" || petStatus === "aprovado" ? (
          <Badge className="bg-green-500 text-white">Aprovado</Badge>
        ) : petStatus === "rejected" || petStatus === "rejeitado" ? (
          <Badge className="bg-red-500 text-white">Rejeitado</Badge>
        ) : (
          <Badge className="bg-yellow-500 text-white">Pendente</Badge>
        )}
        {isOwner && (
          <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
            <User className="h-3 w-3 mr-1" />
            Seu Pet
          </Badge>
        )}
      </div>

      {/* Resto do conteúdo da página permanece igual */}
      <div className="bg-card p-6 rounded-lg shadow">
        <p className="mb-4 whitespace-pre-wrap">{pet.description || "Nenhuma descrição fornecida."}</p>
        {pet.users && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-md font-semibold">Listado por:</h3>
            <p>
              {pet.users.name} ({pet.users.type})
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
