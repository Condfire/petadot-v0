import { createClient } from "@/lib/supabase/server"
import EncontradosClientPage from "./EncontradosClientPage"

export const metadata = {
  title: "Pets Encontrados - Petadot",
  description:
    "Veja os pets que foram encontrados e ajude a reunir famílias. Compartilhe para aumentar as chances de reencontro.",
}

async function getFoundPets() {
  const supabase = createClient()

  console.log("[Encontrados] Buscando pets encontrados...")

  const { data: pets, error } = await supabase
    .from("pets")
    .select(`
      *,
      pet_images (
        url,
        position
      )
    `)
    .eq("category", "found")
    .in("status", ["sheltered", "approved"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar pets encontrados:", error)
    return []
  }

  console.log(`[Encontrados] ${pets?.length || 0} pets encontrados`)

  // Log dos primeiros pets para debug
  if (pets && pets.length > 0) {
    console.log(
      "[Encontrados] Primeiros pets:",
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

export default async function EncontradosPage() {
  const pets = await getFoundPets()

  return <EncontradosClientPage initialPets={pets} />
}
