import { api } from "./api"
import type { PetDB } from "./types"

export async function getPet(id: string): Promise<PetDB | null> {
  const { data, error } = await api.from("pets").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar pet:", error)
    return null
  }

  return data as PetDB
}

export async function getPetBySlug(slug: string): Promise<PetDB | null> {
  const { data, error } = await api.from("pets").select("*").eq("slug", slug).single()

  if (error) {
    console.error("Erro ao buscar pet por slug:", error)
    return null
  }

  return data as PetDB
}
