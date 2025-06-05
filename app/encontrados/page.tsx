import type { Metadata } from "next"
import Link from "next/link"
import SectionHeader from "@/components/section-header"
import { Button } from "@/components/ui/button"
import EncontradosClientPage from "./EncontradosClientPage"
import { createClient } from "@/lib/supabase/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Pets Encontrados | PetAdot",
  description: "Pets encontrados aguardando por seus tutores. Ajude a reunir famílias.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function fetchFoundPets(currentUserId?: string) {
  const supabase = createClient()

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
    .order("created_at", { ascending: false })

  // Se não há usuário logado, mostrar apenas pets aprovados
  if (!currentUserId) {
    query = query.in("status", ["approved", "aprovado"])
  } else {
    // Se há usuário logado, mostrar pets aprovados + seus próprios pets
    query = query.or(`status.in.(approved,aprovado),user_id.eq.${currentUserId}`)
  }

  const { data: pets, error } = await query

  if (error) {
    console.error("Erro ao buscar pets encontrados:", error)
    return { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 }
  }

  return {
    data: pets || [],
    total: pets?.length || 0,
    page: 1,
    pageSize: 12,
    totalPages: Math.ceil((pets?.length || 0) / 12),
  }
}

export default async function FoundPetsPage() {
  // Verificar se há usuário logado
  const supabaseAuth = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabaseAuth.auth.getSession()

  const currentUserId = session?.user?.id
  const foundPetsResult = await fetchFoundPets(currentUserId)

  console.log(`Renderizando página de pets encontrados com ${foundPetsResult.data.length} pets`)

  return (
    <div className="container py-8 md:py-12">
      <SectionHeader
        title="Pets Encontrados"
        description="Estes pets foram encontrados e estão aguardando por seus tutores. Se algum deles for seu, entre em contato."
      />

      <EncontradosClientPage pets={foundPetsResult.data} pagination={foundPetsResult} currentUserId={currentUserId} />

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="text-xl font-bold mb-4">Encontrou um pet?</h3>
        <p className="mb-4">
          Se você encontrou um pet perdido, cadastre as informações dele aqui para que possamos ajudar a encontrar o
          tutor. Forneça o máximo de detalhes possível para facilitar a identificação.
        </p>
        <div className="flex justify-center">
          <Link href="/encontrados/cadastrar">
            <Button>Cadastrar Pet Encontrado</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
