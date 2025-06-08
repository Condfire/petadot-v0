import { createClient } from "@/lib/supabase/server"
import AdocaoClientPage from "./AdocaoClientPage"

// Adicionar esta configuração para indicar que a página é dinâmica
export const dynamic = "force-dynamic"

async function fetchAdoptionPets() {
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
      .eq("category", "adoption")
      .in("status", ["approved", "aprovado"]) // Apenas pets aprovados
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar pets para adoção:", error)
      return []
    }

    return pets || []
  } catch (error) {
    console.error("Erro inesperado ao buscar pets para adoção:", error)
    return []
  }
}

export default async function AdocaoPage() {
  try {
    const pets = await fetchAdoptionPets()
    return <AdocaoClientPage initialPets={pets || []} />
  } catch (error) {
    console.error("Erro na página de adoção:", error)
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar pets para adoção</h1>
        <p className="text-muted-foreground">Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.</p>
      </div>
    )
  }
}
