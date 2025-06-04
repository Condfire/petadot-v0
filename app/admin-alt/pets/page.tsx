import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { PetsTable } from "./pets-table"

export const metadata: Metadata = {
  title: "Gerenciamento de Pets | Admin PetAdot",
  description: "Painel administrativo para gerenciamento de pets",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getPets() {
  try {
    // Buscar pets para adoção
    const { data: adoptionPets, error: adoptionError } = await supabase
      .from("pets")
      .select("*, users!pets_user_id_fkey(name)")
      .eq("category", "adoption")
      .order("created_at", { ascending: false })

    // Buscar pets perdidos
    const { data: lostPets, error: lostError } = await supabase
      .from("pets")
      .select("*, users!pets_user_id_fkey(name)")
      .eq("category", "lost")
      .order("created_at", { ascending: false })

    // Buscar pets encontrados
    const { data: foundPets, error: foundError } = await supabase
      .from("pets")
      .select("*, users!pets_user_id_fkey(name)")
      .eq("category", "found")
      .order("created_at", { ascending: false })

    if (adoptionError || lostError || foundError) {
      console.error("Erro ao buscar pets:", { adoptionError, lostError, foundError })
      return { adoptionPets: [], lostPets: [], foundPets: [] }
    }

    return {
      adoptionPets: adoptionPets || [],
      lostPets: lostPets || [],
      foundPets: foundPets || [],
    }
  } catch (error) {
    console.error("Erro ao buscar pets:", error)
    return { adoptionPets: [], lostPets: [], foundPets: [] }
  }
}

export default function AdminPetsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Pets</h1>
        <p className="text-muted-foreground">Visualize, edite e gerencie todos os pets cadastrados no sistema.</p>
      </div>

      <PetsTable />
    </div>
  )
}
