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
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar pets perdidos:", error)
    return []
  }

  return pets || []
}

export default async function PerdidosPage() {
  const pets = await fetchLostPets()

  return <PerdidosClientPage initialPets={pets} />
}
