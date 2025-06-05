import { createClient } from "@/lib/supabase/server"
import EncontradosClientPage from "./EncontradosClientPage"

// Adicionar esta configuração para indicar que a página é dinâmica
export const dynamic = "force-dynamic"

async function fetchFoundPets() {
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
      .eq("category", "found")
      .in("status", ["approved", "aprovado"]) // Apenas pets aprovados
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar pets encontrados:", error)
      return []
    }

    return pets || []
  } catch (error) {
    console.error("Erro inesperado ao buscar pets encontrados:", error)
    return []
  }
}

export default async function EncontradosPage() {
  try {
    const pets = await fetchFoundPets()
    return <EncontradosClientPage initialPets={pets || []} />
  } catch (error) {
    console.error("Erro na página de encontrados:", error)
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar pets encontrados</h1>
        <p className="text-muted-foreground">Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.</p>
      </div>
    )
  }
}
