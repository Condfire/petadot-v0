import { createClient } from "@supabase/supabase-js"
import { validate as isUuid } from "uuid"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define types for your data - replace 'any' with actual types
type Pet = any
type Event = any
type Ong = any
type UserStats = any

// Interface para paginação
export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Função para criar um cliente Supabase (útil para server components)
export function createSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
}

// Função auxiliar para verificar se uma tabela existe
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select("*", { count: "exact", head: true }).limit(1)
    return !error
  } catch (err) {
    console.error(`Erro ao verificar tabela ${tableName}:`, err)
    return false
  }
}

// --- Functions for Public Pet Listings ---

// Função para buscar pets para adoção com paginação
export async function getPetsForAdoption(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<Pet>> {
  try {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    if (!(await checkTableExists("pets"))) {
      console.error("Tabela pets não existe")
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    let query = supabase
      .from("pets")
      .select(`*, ongs(id, name, logo_url, city)`, { count: "exact" })
      .eq("category", "adoption")
      .in("status", ["approved", "Aprovado"]) // SQL filter for approved (case-sensitive if DB is)
      .order("created_at", { ascending: false })
      .range(from, to)

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        if (key === "search") {
          query = query.or(
            `name.ilike.%${filters[key]}%,breed.ilike.%${filters[key]}%,description.ilike.%${filters[key]}%`,
          )
        } else {
          query = query.eq(key, filters[key])
        }
      }
    })

    const { data, error, count } = await query

    if (error) {
      console.error("Erro ao buscar pets para adoção:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    const safeData = data || []
    const approvedPets = safeData.filter((pet) => {
      if (!pet || typeof pet.status !== "string") return false
      return pet.status.toLowerCase() === "approved" // Strict JS filter (case-insensitive)
    })

    const totalFilteredPets = approvedPets.length
    const totalPages = Math.ceil(totalFilteredPets / pageSize)

    return {
      data: approvedPets,
      total: totalFilteredPets,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("Erro inesperado ao buscar pets para adoção:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// Função para buscar pets perdidos com paginação (usando tabela pets)
export async function getLostPets(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<Pet>> {
  try {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    if (!(await checkTableExists("pets"))) {
      console.error("Tabela pets não existe")
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    let query = supabase
      .from("pets")
      .select("*", { count: "exact" })
      .eq("category", "lost")
      .in("status", ["approved", "Aprovado"]) // SQL filter
      .order("created_at", { ascending: false })
      .range(from, to)

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        if (key === "search") {
          query = query.or(
            `name.ilike.%${filters[key]}%,location_details.ilike.%${filters[key]}%,description.ilike.%${filters[key]}%`,
          )
        } else {
          query = query.eq(key, filters[key])
        }
      }
    })

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching lost pets:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    const safeData = data || []
    const approvedPets = safeData.filter((pet) => {
      if (!pet || typeof pet.status !== "string") return false
      return pet.status.toLowerCase() === "approved" // Strict JS filter
    })

    const totalFilteredPets = approvedPets.length
    const totalPages = Math.ceil(totalFilteredPets / pageSize)

    return {
      data: approvedPets,
      total: totalFilteredPets,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("Erro inesperado ao buscar pets perdidos:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// Função para buscar pets encontrados com paginação (usando tabela pets)
export async function getFoundPets(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<Pet>> {
  try {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    if (!(await checkTableExists("pets"))) {
      console.error("Tabela pets não existe")
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    let query = supabase
      .from("pets")
      .select("*", { count: "exact" })
      .eq("category", "found")
      .in("status", ["approved", "Aprovado"]) // SQL filter
      .order("created_at", { ascending: false })
      .range(from, to)

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all") {
        if (key === "search") {
          query = query.or(
            `name.ilike.%${filters[key]}%,location_details.ilike.%${filters[key]}%,description.ilike.%${filters[key]}%`,
          )
        } else {
          query = query.eq(key, filters[key])
        }
      }
    })

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching found pets:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    const safeData = data || []
    const approvedPets = safeData.filter((pet) => {
      if (!pet || typeof pet.status !== "string") return false
      return pet.status.toLowerCase() === "approved" // Strict JS filter
    })

    const totalFilteredPets = approvedPets.length
    const totalPages = Math.ceil(totalFilteredPets / pageSize)

    return {
      data: approvedPets,
      total: totalFilteredPets,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("Erro inesperado ao buscar pets encontrados:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// --- Functions for Pet Detail Pages (fetching by ID/Slug) ---
// These functions fetch the pet; the page component will handle status checks for public view.

export async function getPetByIdOrSlug(
  idOrSlug: string,
  category?: "adoption" | "lost" | "found",
): Promise<Pet | null> {
  try {
    if (!(await checkTableExists("pets"))) {
      console.error("Tabela pets não existe")
      return null
    }
    const isUuidValue = isUuid(idOrSlug)
    let query = supabase.from("pets").select(`*, users!pets_user_id_fkey(id, name, email, type, avatar_url)`) // Include user details

    if (category) {
      query = query.eq("category", category)
    }

    query = query.eq(isUuidValue ? "id" : "slug", idOrSlug).single()

    const { data, error } = await query

    if (error) {
      // Don't log "No rows found" as an error, it's a valid case for notFound()
      if (error.code !== "PGRST116") {
        console.error(`Error fetching pet by ${isUuidValue ? "ID" : "slug"} (${idOrSlug}):`, error)
      }
      return null
    }
    return data || null
  } catch (err) {
    console.error(`Unexpected error fetching pet by ${idOrSlug}:`, err)
    return null
  }
}

// (Rest of lib/supabase.ts: getEvents, getOngs, getPartners, getUserStats, etc. remain as they are,
// as their status logic is specific to their context and not general public pet listings.)
// ... (include other functions from the existing lib/supabase.ts as needed)
// For brevity, I'm omitting the rest of the functions like getEvents, getOngs, etc.
// Assume they are present and correct from your existing file.
// The key changes are in getPetsForAdoption, getLostPets, getFoundPets, and adding getPetByIdOrSlug.

// Make sure to include other functions like getEventBySlugOrId, getOngById, etc. from your original file.
// Example:
export async function getEventBySlugOrId(slugOrId: string) {
  try {
    console.log(`Buscando evento com slugOrId: ${slugOrId}`)
    const eventsTableExists = await checkTableExists("events")
    if (!eventsTableExists) {
      console.error("Tabela events não existe")
      return null
    }
    const isUuidValue = isUuid(slugOrId)
    let query = supabase.from("events").select("*, users!events_user_id_fkey(id, name, avatar_url, city, type)")
    if (isUuidValue) {
      query = query.eq("id", slugOrId)
    } else {
      query = query.eq("slug", slugOrId)
    }
    let { data, error } = await query.maybeSingle()
    if (!data && !isUuidValue) {
      console.log("No exact match found, trying LIKE query")
      const { data: likeData, error: likeError } = await supabase
        .from("events")
        .select("*, users!events_user_id_fkey(id, name, avatar_url, city, type)")
        .ilike("slug", `%${slugOrId}%`)
        .limit(1)
        .maybeSingle()
      if (!likeError && likeData) {
        data = likeData
      }
    }
    if (error) {
      console.error("Erro ao buscar evento:", error)
      return null
    }
    if (!data) {
      console.log(`Nenhum evento encontrado para slugOrId: ${slugOrId}`)
      return null
    }
    if (data && data.users && data.users.type === "ong") {
      return {
        ...data,
        ongs: { id: data.users.id, name: data.users.name, logo_url: data.users.avatar_url, city: data.users.city },
      }
    }
    return data
  } catch (error) {
    console.error("Erro ao buscar evento:", error)
    return null
  }
}
export async function getOngById(id: string) {
  try {
    if (!id || id === "undefined" || id === "null") {
      console.error("ID de ONG inválido fornecido:", id)
      return null
    }
    const usersTableExists = await checkTableExists("users")
    if (!usersTableExists) {
      console.error("Tabela users não existe")
      return null
    }
    const { data, error } = await supabase.from("users").select(`*`).eq("id", id).eq("type", "ong").single()
    if (error) {
      console.error("Error fetching ong by ID:", error)
      return null
    }
    return data || null
  } catch (error) {
    console.error("Error fetching ong by ID:", error)
    return null
  }
}

export async function getUserPets(userId: string): Promise<{
  adoptionPets: Pet[]
  lostPets: Pet[]
  foundPets: Pet[]
  resolvedPets: Pet[]
}> {
  try {
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return { adoptionPets: [], lostPets: [], foundPets: [], resolvedPets: [] }
    }
    const { data: userPets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Erro ao buscar pets do usuário:", error)
      return { adoptionPets: [], lostPets: [], foundPets: [], resolvedPets: [] }
    }
    const adoptionPets: Pet[] = []
    const lostPets: Pet[] = []
    const foundPets: Pet[] = []
    const resolvedPets: Pet[] = []
    ;(userPets || []).forEach((pet) => {
      if (pet.category === "adoption") {
        if (pet.status === "adopted") {
          resolvedPets.push({ ...pet, resolvedType: "adopted", type: "adoption" })
        } else {
          adoptionPets.push(pet)
        }
      } else if (pet.category === "lost") {
        if (pet.status === "resolved" || pet.status === "found") {
          resolvedPets.push({ ...pet, resolvedType: "found", type: "lost" })
        } else {
          lostPets.push(pet)
        }
      } else if (pet.category === "found") {
        if (pet.status === "reunited") {
          resolvedPets.push({ ...pet, resolvedType: "reunited", type: "found" })
        } else {
          foundPets.push(pet)
        }
      }
    })
    return { adoptionPets, lostPets, foundPets, resolvedPets }
  } catch (error) {
    console.error("Erro inesperado ao buscar pets do usuário:", error)
    return { adoptionPets: [], lostPets: [], foundPets: [], resolvedPets: [] }
  }
}

export async function deleteUserPet(
  petId: string,
  userId: string,
  petType: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Função deleteUserPet chamada com:", { petId, userId, petType })
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return { success: false, error: "Tabela de pets não encontrada" }
    }
    const { data: pet, error: fetchError } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .eq("user_id", userId)
      .single()
    if (fetchError) {
      console.error(`Erro ao verificar pet:`, fetchError)
      return { success: false, error: fetchError.message }
    }
    if (!pet) {
      console.error(`Pet não encontrado ou não pertence ao usuário:`, { petId, userId })
      return { success: false, error: "Pet não encontrado ou você não tem permissão para excluí-lo" }
    }
    console.log(`Pet encontrado, prosseguindo com a exclusão:`, pet)
    const { error } = await supabase.from("pets").delete().eq("id", petId).eq("user_id", userId)
    if (error) {
      console.error(`Erro ao excluir pet:`, error)
      return { success: false, error: error.message }
    }
    console.log(`Pet excluído com sucesso`)
    return { success: true }
  } catch (error) {
    console.error(`Erro ao excluir pet:`, error)
    return { success: false, error: "Ocorreu um erro ao excluir o pet." }
  }
}

export async function checkUserPetsDirectly(email: string) {
  try {
    if (!email) {
      return { success: false, error: "Email não fornecido" }
    }
    const usersTableExists = await checkTableExists("users")
    if (!usersTableExists) {
      return { success: false, error: "Tabela de usuários não encontrada" }
    }
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single()
    if (userError) {
      return { success: false, error: `Usuário não encontrado: ${userError.message}` }
    }
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      return { success: true, userId: userData.id, email: userData.email, pets: { adoption: [], lost: [], found: [] } }
    }
    const { data: adoptionPets } = await supabase
      .from("pets")
      .select("id, name, species, status")
      .eq("user_id", userData.id)
      .eq("category", "adoption")
    const { data: lostPets } = await supabase
      .from("pets")
      .select("id, name, species, status")
      .eq("user_id", userData.id)
      .eq("category", "lost")
    const { data: foundPets } = await supabase
      .from("pets")
      .select("id, name, species, status")
      .eq("user_id", userData.id)
      .eq("category", "found")
    return {
      success: true,
      userId: userData.id,
      email: userData.email,
      pets: {
        adoption: adoptionPets || [],
        lost: lostPets || [],
        found: foundPets || [],
      },
    }
  } catch (error) {
    console.error("Erro ao verificar pets:", error)
    return { success: false, error: "Erro ao verificar pets" }
  }
}

export async function createTestPet(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "ID do usuário não fornecido" }
    }
    const usersTableExists = await checkTableExists("users")
    if (!usersTableExists) {
      return { success: false, error: "Tabela de usuários não encontrada" }
    }
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      return { success: false, error: "Tabela de pets não encontrada" }
    }
    const { error: userError } = await supabase.from("users").select("id").eq("id", userId).single()
    if (userError) {
      const { error: createUserError } = await supabase
        .from("users")
        .insert([{ id: userId, name: "Usuário de Teste", email: "teste@exemplo.com" }])
        .select()
      if (createUserError) {
        return { success: false, error: `Erro ao criar usuário: ${createUserError.message}` }
      }
    }
    const { data: newPet, error: petError } = await supabase
      .from("pets")
      .insert([
        {
          name: "Pet de Teste",
          species: "dog",
          breed: "Vira-lata",
          age: "adult",
          size: "medium",
          gender: "male",
          color: "brown",
          description: "Este é um pet de teste criado automaticamente.",
          lost_date: new Date().toISOString(),
          location_details: "Rua de Teste, 123",
          contact_email: "teste@exemplo.com",
          main_image_url: "/golden-retriever-park.png",
          status: "pending",
          category: "lost",
          user_id: userId,
        },
      ])
      .select()
    if (petError) {
      return { success: false, error: `Erro ao criar pet de teste: ${petError.message}` }
    }
    return { success: true, petId: newPet[0].id, message: "Pet de teste criado com sucesso" }
  } catch (error) {
    console.error("Erro ao criar pet de teste:", error)
    return { success: false, error: "Erro ao criar pet de teste" }
  }
}

export async function getApprovedStories(limit = 3) {
  try {
    console.log("Buscando histórias aprovadas")
    const storiesTableExists = await checkTableExists("pet_stories")
    if (!storiesTableExists) {
      console.log("Tabela pet_stories não existe")
      return []
    }
    const { data, error } = await supabase
      .from("pet_stories")
      .select(`*`)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) {
      console.error("Erro ao buscar histórias aprovadas:", error)
      return []
    }
    console.log(`Encontradas ${data.length} histórias aprovadas`)
    return data || []
  } catch (error) {
    console.error("Erro ao buscar histórias aprovadas:", error)
    return []
  }
}

export async function getLostPetById(idOrSlug: string) {
  try {
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return null
    }
    const isUuidValue = isUuid(idOrSlug)
    const { data, error } = await supabase
      .from("pets")
      .select(`*`)
      .eq("category", "lost")
      .eq(isUuidValue ? "id" : "slug", idOrSlug)
      .single()
    if (error) {
      console.error("Error fetching lost pet by ID:", error)
      return null
    }
    return data || null
  } catch (error) {
    console.error("Error fetching lost pet by ID:", error)
    return null
  }
}

export async function getFoundPetById(idOrSlug: string) {
  try {
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return null
    }
    const isUuidValue = isUuid(idOrSlug)
    const { data, error } = await supabase
      .from("pets")
      .select(`*`)
      .eq("category", "found")
      .eq(isUuidValue ? "id" : "slug", idOrSlug)
      .single()
    if (error) {
      console.error("Error fetching found pet by ID:", error)
      return null
    }
    return data || null
  } catch (error) {
    console.error("Error fetching found pet by ID:", error)
    return null
  }
}
