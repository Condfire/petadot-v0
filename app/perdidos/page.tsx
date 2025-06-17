import { createClient } from "@/lib/supabase/server"
import PerdidosClientPage from "./PerdidosClientPage"

export const metadata = {
  title: "Pets Perdidos - Petadot",
  description:
    "Ajude a encontrar pets perdidos. Veja os anúncios e compartilhe para aumentar as chances de reencontro.",
}

async function getLostPets() {
  const supabase = createClient()

  console.log("[Perdidos] Buscando pets perdidos...")

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

  console.log(`[Perdidos] ${pets?.length || 0} pets perdidos`)

  // Log dos primeiros pets para debug
  if (pets && pets.length > 0) {
    console.log(
      "[Perdidos] Primeiros pets:",
      pets.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        status: p.status,
      })),
    )
  }

  return pets || []
}

export default async function PerdidosPage() {
  const pets = await getLostPets()

  return <PerdidosClientPage initialPets={pets} />
}
