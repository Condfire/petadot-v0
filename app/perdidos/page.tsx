import { createClient } from "@/lib/supabase/server"
import PerdidosClientPage from "./PerdidosClientPage"

async function fetchLostPets() {
  const supabase = createClient()

  const { data: pets, error } = await supabase
    .from("pets")
    .select(`
    *,
    pet_images (
      url,
      position
    )
  `)
    .eq("category", "lost")
    .in("status", ["approved", "aprovado"]) // Apenas pets aprovados
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar pets perdidos:", error)
    return []
  }

  return pets || []
}

export default async function PerdidosPage() {
  const pets = await fetchLostPets()

  // A função fetchLostPets já retorna apenas pets aprovados.
  return <PerdidosClientPage initialPets={pets || []} />
}
