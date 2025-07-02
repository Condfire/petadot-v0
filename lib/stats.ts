import { createClient } from "@supabase/supabase-js"

// Criar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Obtém estatísticas gerais do sistema
 */
export async function getSystemStats() {
  try {
    // Contar pets para adoção
    const { count: adoptionCount, error: adoptionError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    // Contar pets perdidos
    const { count: lostCount, error: lostError } = await supabase
      .from("pets_lost")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    // Contar pets encontrados
    const { count: foundCount, error: foundError } = await supabase
      .from("pets_found")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    // Contar ONGs
    const { count: ongsCount, error: ongsError } = await supabase
      .from("ongs")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true)

    // Contar histórias
    const { count: storiesCount, error: storiesError } = await supabase
      .from("pet_stories")
      .select("*", { count: "exact", head: true })
      .eq("status", "aprovado")

    // Contar eventos
    const { count: eventsCount, error: eventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("event_date", new Date().toISOString())

    // Contar usuários
    const { count: usersCount, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    return {
      adoption: adoptionCount || 0,
      lost: lostCount || 0,
      found: foundCount || 0,
      ongs: ongsCount || 0,
      stories: storiesCount || 0,
      events: eventsCount || 0,
      users: usersCount || 0,
      totalPets: (adoptionCount || 0) + (lostCount || 0) + (foundCount || 0),
    }
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error)
    return {
      adoption: 0,
      lost: 0,
      found: 0,
      ongs: 0,
      stories: 0,
      events: 0,
      users: 0,
      totalPets: 0,
    }
  }
}

/**
 * Obtém estatísticas de pets por espécie
 */
export async function getPetsBySpeciesStats() {
  try {
    // Contar pets para adoção por espécie
    const { data: adoptionData, error: adoptionError } = await supabase
      .from("pets")
      .select("species")
      .eq("status", "approved")

    // Contar pets perdidos por espécie
    const { data: lostData, error: lostError } = await supabase
      .from("pets_lost")
      .select("species")
      .eq("status", "approved")

    // Contar pets encontrados por espécie
    const { data: foundData, error: foundError } = await supabase
      .from("pets_found")
      .select("species")
      .eq("status", "approved")

    // Combinar todos os dados
    const allPets = [...(adoptionData || []), ...(lostData || []), ...(foundData || [])]

    // Contar por espécie
    const speciesCount = allPets.reduce(
      (acc, pet) => {
        const species = pet.species || "other"
        acc[species] = (acc[species] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return speciesCount
  } catch (error) {
    console.error("Erro ao obter estatísticas de pets por espécie:", error)
    return {}
  }
}

/**
 * Obtém estatísticas de ONGs por estado
 */
export async function getOngsByStateStats() {
  try {
    // Contar ONGs por estado
    const { data, error } = await supabase.from("ongs").select("state").eq("is_verified", true)

    if (error) {
      throw error
    }

    // Contar por estado
    const stateCount = data.reduce(
      (acc, ong) => {
        const state = ong.state || "Não informado"
        acc[state] = (acc[state] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return stateCount
  } catch (error) {
    console.error("Erro ao obter estatísticas de ONGs por estado:", error)
    return {}
  }
}

/**
 * Obtém estatísticas de histórias por categoria
 */
export async function getStoriesByCategoryStats() {
  try {
    // Contar histórias por categoria
    const { data, error } = await supabase.from("pet_stories").select("category").eq("status", "aprovado")

    if (error) {
      throw error
    }

    // Contar por categoria
    const categoryCount = data.reduce(
      (acc, story) => {
        const category = story.category || "Outras"
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return categoryCount
  } catch (error) {
    console.error("Erro ao obter estatísticas de histórias por categoria:", error)
    return {}
  }
}
