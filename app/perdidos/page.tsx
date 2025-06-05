import { createClient } from "@/lib/supabase/server"
import PerdidosClientPage from "./PerdidosClientPage"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

async function fetchLostPets(currentUserId?: string) {
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
    .eq("category", "lost")
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
    console.error("Erro ao buscar pets perdidos:", error)
    return []
  }

  return pets || []
}

export default async function PerdidosPage() {
  // Verificar se há usuário logado
  const supabaseAuth = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabaseAuth.auth.getSession()

  const currentUserId = session?.user?.id

  const pets = await fetchLostPets(currentUserId)

  return <PerdidosClientPage initialPets={pets || []} currentUserId={currentUserId} />
}
