import { createClient } from "@/lib/supabase/server"
import PerdidosClientPage from "./PerdidosClientPage"

async function fetchLostPets() {
  const supabase = createClient()

  try {
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
      .in("status", ["approved", "aprovado"]) // Apenas pets aprovados para visitantes
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar pets perdidos:", error)
      return []
    }

    return pets || []
  } catch (error) {
    console.error("Erro inesperado ao buscar pets perdidos:", error)
    return []
  }
}

export default async function PerdidosPage() {
  try {
    const pets = await fetchLostPets()
    return <PerdidosClientPage initialPets={pets || []} />
  } catch (error) {
    console.error("Erro na página de perdidos:", error)
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar pets perdidos</h1>
        <p className="text-muted-foreground">Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.</p>
      </div>
    )
  }
}
