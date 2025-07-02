import { supabase } from "./supabase" // Assumindo que supabase é importado de lib/supabase
import type { PetDB } from "./types"

export async function getPet(id: string): Promise<PetDB | null> {
  // Exportar como named export
  const { data, error } = await supabase.from("pets").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar pet:", error)
    return null
  }

  return data as PetDB
}

export async function getPetBySlug(slug: string): Promise<PetDB | null> {
  const { data, error } = await supabase.from("pets").select("*").eq("slug", slug).single()

  if (error) {
    console.error("Erro ao buscar pet por slug:", error)
    return null
  }

  return data as PetDB
}
