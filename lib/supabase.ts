import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
)

export async function getPets(type: "lost" | "found" | "adoption", page = 1, limit = 10, filters: any = {}) {
  const offset = (page - 1) * limit
  let query = supabase.from("pets").select("*").eq("status", "approved")

  if (type) {
    query = query.eq("type", type)
  }
  if (filters.species) {
    query = query.eq("species", filters.species)
  }
  if (filters.breed) {
    query = query.eq("breed", filters.breed)
  }
  if (filters.city) {
    query = query.eq("city", filters.city)
  }
  if (filters.state) {
    query = query.eq("state", filters.state)
  }
  if (filters.gender) {
    query = query.eq("gender", filters.gender)
  }
  if (filters.size) {
    query = query.eq("size", filters.size)
  }
  if (filters.color) {
    query = query.contains("color", [filters.color])
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)
    .limit(limit)

  if (error) {
    console.error("Erro ao buscar pets:", error)
    return { data: [], count: 0 }
  }
  return { data, count: count || 0 }
}

export async function getPetBySlugOrId(slugOrId: string) {
  let query = supabase.from("pets").select("*").eq("status", "approved")

  if (slugOrId.length === 36 && slugOrId.includes("-")) {
    // Assume UUID
    query = query.eq("id", slugOrId)
  } else {
    // Assume slug
    query = query.eq("slug", slugOrId)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error("Erro ao buscar pet por slug ou ID:", error)
    return null
  }
  return data
}

export async function getOngs(page = 1, limit = 10) {
  const offset = (page - 1) * limit
  const { data, error, count } = await supabase
    .from("users")
    .select("id, name, email, logo_url, contact_whatsapp, city, state, slug")
    .eq("type", "ngo_admin") // Alterado para 'ngo_admin'
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1)
    .limit(limit)

  if (error) {
    console.error("Erro ao buscar ONGs:", error)
    return { data: [], count: 0 }
  }
  console.log("ONGs encontradas:", count)
  console.log("Dados das ONGs:", data)
  return { data, count: count || 0 }
}

export async function getOngBySlugOrId(slugOrId: string) {
  let query = supabase.from("users").select("*").eq("type", "ngo_admin")

  if (slugOrId.length === 36 && slugOrId.includes("-")) {
    // Assume UUID
    query = query.eq("id", slugOrId)
  } else {
    // Assume slug
    query = query.eq("slug", slugOrId)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error("Erro ao buscar ONG por slug ou ID:", error)
    return null
  }
  return data
}

export async function getEvents(page = 1, limit = 10) {
  const offset = (page - 1) * limit
  const { data, error, count } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .order("start_date", { ascending: true })
    .range(offset, offset + limit - 1)
    .limit(limit)

  if (error) {
    console.error("Erro ao buscar eventos:", error)
    return { data: [], count: 0 }
  }
  console.log("Eventos encontrados:", count)
  console.log("Dados dos Eventos:", data)
  return { data, count: count || 0 }
}

export async function getEventBySlugOrId(slugOrId: string) {
  let query = supabase.from("events").select("*").eq("status", "approved")

  if (slugOrId.length === 36 && slugOrId.includes("-")) {
    // Assume UUID
    query = query.eq("id", slugOrId)
  } else {
    // Assume slug
    query = query.eq("slug", slugOrId)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error("Erro ao buscar evento por slug ou ID:", error)
    return null
  }
  return data
}

export async function getSuccessStories(page = 1, limit = 10) {
  const offset = (page - 1) * limit
  const { data, error, count } = await supabase
    .from("success_stories")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)
    .limit(limit)

  if (error) {
    console.error("Erro ao buscar histórias de sucesso:", error)
    return { data: [], count: 0 }
  }
  return { data, count: count || 0 }
}

export async function getSuccessStoryById(id: string) {
  const { data, error } = await supabase
    .from("success_stories")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single()

  if (error) {
    console.error("Erro ao buscar história de sucesso por ID:", error)
    return null
  }
  return data
}

export async function getPartners(page = 1, limit = 10) {
  const offset = (page - 1) * limit
  const { data, error, count } = await supabase
    .from("partners")
    .select("*")
    .eq("status", "approved")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1)
    .limit(limit)

  if (error) {
    console.error("Erro ao buscar parceiros:", error)
    return { data: [], count: 0 }
  }
  return { data, count: count || 0 }
}

export async function getPartnerById(id: string) {
  const { data, error } = await supabase.from("partners").select("*").eq("id", id).eq("status", "approved").single()

  if (error) {
    console.error("Erro ao buscar parceiro por ID:", error)
    return null
  }
  return data
}

export async function getUserPets(userId: string) {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar pets do usuário:", error)
    return []
  }
  return data
}

export async function getUserEvents(userId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar eventos do usuário:", error)
    return []
  }
  return data
}

export async function getUserSuccessStories(userId: string) {
  const { data, error } = await supabase
    .from("success_stories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar histórias de sucesso do usuário:", error)
    return []
  }
  return data
}

export async function getModerationKeywords() {
  const { data, error } = await supabase.from("moderation_keywords").select("keyword")

  if (error) {
    console.error("Erro ao buscar palavras-chave de moderação:", error)
    return []
  }
  return data.map((row) => row.keyword)
}

export async function getModerationSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "keyword_moderation_enabled")
    .single()

  if (error) {
    console.error("Erro ao buscar configuração de moderação:", error)
    return { keyword_moderation_enabled: false }
  }
  return { keyword_moderation_enabled: data?.value === "true" }
}

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, type, is_admin, is_verified")
    .or("type.eq.admin,type.eq.ngo_admin")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar usuários admin:", error)
    return []
  }
  return data
}

export async function getUserById(id: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar usuário por ID:", error)
    return null
  }
  return data
}

export async function getOngsForAdmin() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, type, is_ong_verified, cnpj, logo_url, city, state")
    .eq("type", "ngo_admin")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar ONGs para admin:", error)
    return []
  }
  return data
}

export async function getOngByIdForAdmin(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*, pets(*)") // Inclui pets relacionados
    .eq("id", id)
    .eq("type", "ngo_admin")
    .single()

  if (error) {
    console.error("Erro ao buscar ONG por ID para admin:", error)
    return null
  }
  return data
}

export async function getEventsForAdmin() {
  const { data, error } = await supabase
    .from("events")
    .select("id, name, status, start_date, city, state, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar eventos para admin:", error)
    return []
  }
  return data
}

export async function getEventByIdForAdmin(id: string) {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar evento por ID para admin:", error)
    return null
  }
  return data
}

export async function getPetsForAdmin() {
  const { data, error } = await supabase
    .from("pets")
    .select("id, name, type, status, city, state, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar pets para admin:", error)
    return []
  }
  return data
}

export async function getPetByIdForAdmin(id: string) {
  const { data, error } = await supabase.from("pets").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar pet por ID para admin:", error)
    return null
  }
  return data
}

export async function getPartnersForAdmin() {
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, status, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar parceiros para admin:", error)
    return []
  }
  return data
}

export async function getPartnerByIdForAdmin(id: string) {
  const { data, error } = await supabase.from("partners").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar parceiro por ID para admin:", error)
    return null
  }
  return data
}

export async function getSuccessStoriesForAdmin() {
  const { data, error } = await supabase
    .from("success_stories")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar histórias de sucesso para admin:", error)
    return []
  }
  return data
}

export async function getSuccessStoryByIdForAdmin(id: string) {
  const { data, error } = await supabase.from("success_stories").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar história de sucesso por ID para admin:", error)
    return null
  }
  return data
}
