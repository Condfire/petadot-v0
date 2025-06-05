// ✅ VERSÃO ATUALIZADA - Importa as funções simplificadas
export {
  getPetsForAdoption,
  getLostPets,
  getFoundPets,
  getPetByIdOrSlug,
  debugPetStatuses,
  supabase,
  type PaginationResult,
} from "./supabase-simple"

// Manter outras funções existentes que não são relacionadas a pets
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { validate as isUuid } from "uuid"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Define types for your data - replace 'any' with actual types if you have them
// For example, in a lib/types.ts file
// export interface Pet { id: string; name: string; status: string; /* ... */ }
// export interface Event { id: string; title: string; status: string; /* ... */ }
// export interface Ong { id: string; name: string; /* ... */ }
type Pet = any
type Event = any
type Ong = any
type UserProfile = any // For user profiles or ONGs stored in 'users' or 'profiles'
type Partner = any
type PetStory = any
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
    // Using a lightweight query to check existence
    const { error } = await supabase.rpc("check_table_exists", { table_name_to_check: tableName })
    if (
      error &&
      error.message.includes("function public.check_table_exists(table_name_to_check text) does not exist")
    ) {
      // Fallback if the RLS or function doesn't exist, try a direct query (might be slower/costlier)
      console.warn("Fallback checkTableExists used for:", tableName)
      const { error: queryError } = await supabase.from(tableName).select("id", { count: "exact", head: true }).limit(1)
      return !queryError
    }
    return !error // If no error, or specific "table does not exist" error from RPC, it implies existence or non-existence.
    // This RPC needs to be created in Supabase:
    // CREATE OR REPLACE FUNCTION check_table_exists(table_name_to_check TEXT)
    // RETURNS BOOLEAN AS $$
    // BEGIN
    //   RETURN EXISTS (
    //     SELECT 1
    //     FROM information_schema.tables
    //     WHERE table_name = table_name_to_check
    //   );
    // END;
    // $$ LANGUAGE plpgsql;
  } catch (err) {
    console.error(`Erro ao verificar tabela ${tableName}:`, err)
    // Fallback if RPC fails unexpectedly
    try {
      const { error: queryError } = await supabase.from(tableName).select("id", { count: "exact", head: true }).limit(1)
      return !queryError
    } catch (fallbackErr) {
      console.error(`Fallback checkTableExists failed for ${tableName}:`, fallbackErr)
      return false
    }
  }
}

// --- Functions for Single Item Details ---
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
    // Assuming 'users' table stores user info and 'pets.user_id' is the foreign key.
    // Adjust 'users!pets_user_id_fkey' if your foreign key relationship has a different name or if ONGs are in a different table.
    let query = supabase.from("pets").select(`*, user:users!pets_user_id_fkey(id, name, email, type, avatar_url)`)

    if (category) {
      query = query.eq("category", category)
    }

    query = query.eq(isUuidValue ? "id" : "slug", idOrSlug).single()

    const { data, error } = await query

    if (error) {
      if (error.code !== "PGRST116") {
        // PGRST116: "Searched for a single row, but found no rows"
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

export async function getEventBySlugOrId(slugOrId: string): Promise<Event | null> {
  try {
    if (!(await checkTableExists("events"))) {
      console.error("Tabela events não existe")
      return null
    }
    const isUuidValue = isUuid(slugOrId)
    // Assuming 'users' table stores user/ONG info and 'events.user_id' is the foreign key.
    // Adjust 'users!events_user_id_fkey' if your FK relationship is named differently.
    let query = supabase
      .from("events")
      .select("*, organizer:users!events_user_id_fkey(id, name, avatar_url, city, type)")

    if (isUuidValue) {
      query = query.eq("id", slugOrId)
    } else {
      query = query.eq("slug", slugOrId)
    }
    let { data, error } = await query.maybeSingle() // use maybeSingle to handle 0 or 1 row

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar evento (exact match):", error)
      return null // Return null on error other than "no rows"
    }

    // Fallback for slugs if no exact match (useful for partial slugs or variations)
    if (!data && !isUuidValue && slugOrId.length > 3) {
      // Added length check for performance
      console.log("No exact match for event slug, trying LIKE query for:", slugOrId)
      const { data: likeData, error: likeError } = await supabase
        .from("events")
        .select("*, organizer:users!events_user_id_fkey(id, name, avatar_url, city, type)")
        .ilike("slug", `%${slugOrId}%`)
        .limit(1) // Take the first match
        .maybeSingle()

      if (likeError && likeError.code !== "PGRST116") {
        console.error("Erro ao buscar evento (LIKE query):", likeError)
        // Potentially return null here too, or let the original 'data' (which is null) pass through
      } else if (likeData) {
        data = likeData
      }
    }

    if (!data) {
      // console.log(`Nenhum evento encontrado para slugOrId: ${slugOrId}`) // Can be noisy
      return null
    }

    // If organizer is an ONG, structure it as 'ongs' for compatibility if needed by components
    if (data && data.organizer && data.organizer.type === "ong") {
      return {
        ...data,
        ongs: {
          // Keep this if your components expect an 'ongs' object for events organized by ONGs
          id: data.organizer.id,
          name: data.organizer.name,
          logo_url: data.organizer.avatar_url, // Assuming avatar_url is used for logo
          city: data.organizer.city,
        },
      }
    }
    return data
  } catch (err) {
    console.error("Erro inesperado ao buscar evento:", err)
    return null
  }
}

export async function getOngById(id: string): Promise<UserProfile | null> {
  try {
    if (!id || id === "undefined" || id === "null") {
      console.error("ID de ONG inválido fornecido:", id)
      return null
    }
    // Assuming ONGs are stored in the 'users' table with type 'ong'
    // or in a 'profiles' table linked to auth.users
    if (!(await checkTableExists("users"))) {
      // or 'profiles'
      console.error("Tabela users (ou profiles) não existe")
      return null
    }
    const { data, error } = await supabase.from("users").select(`*`).eq("id", id).eq("type", "ong").single()

    if (error) {
      if (error.code !== "PGRST116") console.error("Error fetching ong by ID:", error)
      return null
    }
    return data || null
  } catch (err) {
    console.error("Error fetching ong by ID:", err)
    return null
  }
}

// --- Other Data Fetching Functions (Events, ONGs, Partners, Admin, User specific) ---

export async function getEvents(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<{ data: any[]; count: number }> {
  try {
    let query = supabaseClient
      .from("events")
      .select("*, organizer:users!events_user_id_fkey(id, name, logo_url, city, type)", { count: "exact" })
      .in("status", ["approved", "Aprovado"])

    if (filters.title) query = query.ilike("title", `%${filters.title}%`)
    if (filters.city) query = query.eq("city", filters.city)
    if (filters.state) query = query.eq("state", filters.state)
    if (filters.date) query = query.gte("start_date", filters.date)

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await query.order("start_date", { ascending: true }).range(from, to)

    if (error) {
      console.error("Erro ao buscar eventos:", error)
      return { data: [], count: 0 }
    }
    return { data: data || [], count: count || 0 }
  } catch (err) {
    console.error("Erro inesperado ao buscar eventos:", err)
    return { data: [], count: 0 }
  }
}

export async function getOngs(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<{ data: UserProfile[]; count: number }> {
  try {
    // Assuming ONGs are in 'users' table with type 'ong'
    if (!(await checkTableExists("users"))) {
      console.error("Tabela users não existe")
      return { data: [], count: 0 }
    }
    let query = supabase.from("users").select("*", { count: "exact" }).eq("type", "ong")
    // Add status filter if ONGs have an approval status for public listing
    // query = query.in("status", ["approved", "Aprovado"]);

    if (filters.name) query = query.ilike("name", `%${filters.name}%`)
    if (filters.city) query = query.eq("city", filters.city)
    if (filters.state) query = query.eq("state", filters.state)

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await query.order("name", { ascending: true }).range(from, to)

    if (error) {
      console.error("Erro ao buscar ONGs:", error)
      return { data: [], count: 0 }
    }
    return { data: data || [], count: count || 0 }
  } catch (err) {
    console.error("Erro inesperado ao buscar ONGs:", err)
    return { data: [], count: 0 }
  }
}

export async function getPartners(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<{ data: Partner[]; count: number }> {
  try {
    if (!(await checkTableExists("partners"))) {
      console.error("Tabela partners não existe")
      return { data: [], count: 0 }
    }
    let query = supabase.from("partners").select("*", { count: "exact" })
    // Add status filter if partners have an approval status for public listing
    // query = query.in("status", ["approved", "Aprovado"]);

    if (filters.name) query = query.ilike("name", `%${filters.name}%`)
    // Add other filters like city, state if applicable

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await query.order("name", { ascending: true }).range(from, to)

    if (error) {
      console.error("Erro ao buscar parceiros:", error)
      return { data: [], count: 0 }
    }
    return { data: data || [], count: count || 0 }
  } catch (err) {
    console.error("Erro inesperado ao buscar parceiros:", err)
    return { data: [], count: 0 }
  }
}

export async function getPendingItems(supabaseClient?: SupabaseClient): Promise<{
  pets: Pet[]
  lostPets: Pet[] // Kept for potential specific logic, though 'pets' table is now unified
  foundPets: Pet[] // Kept for potential specific logic
  events: Event[]
}> {
  const client = supabaseClient || supabase
  try {
    let pets: Pet[] = []
    let lostPets: Pet[] = []
    let foundPets: Pet[] = []
    let events: Event[] = []

    if (await checkTableExists("pets")) {
      const { data: adoptionData } = await client
        .from("pets")
        .select("*")
        .eq("category", "adoption")
        .or("status.eq.pending,status.eq.Pendente") // Case-sensitive for DB
        .order("created_at", { ascending: false })
      pets = adoptionData || []

      const { data: lostData } = await client
        .from("pets")
        .select("*")
        .eq("category", "lost")
        .or("status.eq.pending,status.eq.Pendente")
        .order("created_at", { ascending: false })
      lostPets = lostData || []

      const { data: foundData } = await client
        .from("pets")
        .select("*")
        .eq("category", "found")
        .or("status.eq.pending,status.eq.Pendente")
        .order("created_at", { ascending: false })
      foundPets = foundData || []
    }

    if (await checkTableExists("events")) {
      const { data: eventsData } = await client
        .from("events")
        .select("*")
        .or("status.eq.pending,status.eq.Pendente")
        .order("created_at", { ascending: false })
      events = eventsData || []
    }
    return { pets, lostPets, foundPets, events }
  } catch (error) {
    console.error("Erro ao buscar itens pendentes:", error)
    return { pets: [], lostPets: [], foundPets: [], events: [] }
  }
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    if (!(await checkTableExists("pets"))) return null

    const commonQuery = supabase.from("pets").select("*", { count: "exact", head: true }).eq("user_id", userId)

    const { count: adoptionCount } = await supabase
      .from("pets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", "adoption")
    const { count: lostCount } = await supabase
      .from("pets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", "lost")
    const { count: foundCount } = await supabase
      .from("pets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", "found")

    const { data: recentPets } = await supabase
      .from("pets")
      .select("id, name, main_image_url, created_at, status, category")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    return {
      adoptionCount: adoptionCount || 0,
      lostCount: lostCount || 0,
      foundCount: foundCount || 0,
      totalCount: (adoptionCount || 0) + (lostCount || 0) + (foundCount || 0),
      recentPets: recentPets || [],
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas do usuário:", error)
    return null
  }
}

// Simplified getPetById - use getPetByIdOrSlug for more details
export async function getPetById(id: string): Promise<Pet | null> {
  return getPetByIdOrSlug(id) // Delegates to the more comprehensive function
}

// Simplified getEventById - use getEventBySlugOrId for more details
export async function getEventById(id: string): Promise<Event | null> {
  return getEventBySlugOrId(id) // Delegates to the more comprehensive function
}

export async function getUserPets(userId: string): Promise<{
  adoptionPets: Pet[]
  lostPets: Pet[]
  foundPets: Pet[]
  resolvedPets: Pet[]
}> {
  try {
    if (!(await checkTableExists("pets"))) {
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
      const statusLower = (pet.status || "").toLowerCase()
      if (pet.category === "adoption") {
        if (statusLower === "adopted") {
          resolvedPets.push({ ...pet, resolvedType: "adopted", type: "adoption" })
        } else {
          adoptionPets.push(pet)
        }
      } else if (pet.category === "lost") {
        if (statusLower === "resolved" || statusLower === "found") {
          resolvedPets.push({ ...pet, resolvedType: "found", type: "lost" })
        } else {
          lostPets.push(pet)
        }
      } else if (pet.category === "found") {
        if (statusLower === "reunited") {
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
  // petType: string, // petType might be redundant if 'pets' table is unified
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await checkTableExists("pets"))) {
      return { success: false, error: "Tabela de pets não encontrada" }
    }
    const { data: pet, error: fetchError } = await supabase
      .from("pets")
      .select("id") // Only select id for verification
      .eq("id", petId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !pet) {
      console.error(`Erro ao verificar pet para exclusão ou pet não encontrado/não pertence ao usuário:`, fetchError)
      return { success: false, error: "Pet não encontrado ou você não tem permissão para excluí-lo" }
    }

    const { error } = await supabase.from("pets").delete().eq("id", petId) // user_id check already done

    if (error) {
      console.error(`Erro ao excluir pet:`, error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error: any) {
    console.error(`Erro inesperado ao excluir pet:`, error)
    return { success: false, error: error.message || "Ocorreu um erro ao excluir o pet." }
  }
}

export async function getApprovedStories(limit = 3): Promise<PetStory[]> {
  try {
    if (!(await checkTableExists("pet_stories"))) {
      return []
    }
    const { data, error } = await supabase
      .from("pet_stories")
      .select(`*`) // Consider selecting specific fields
      .in("status", ["approved", "Aprovado"])
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Erro ao buscar histórias aprovadas:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Erro inesperado ao buscar histórias aprovadas:", error)
    return []
  }
}

// Functions like checkUserPetsDirectly and createTestPet can be kept if still used.
// For brevity, they are omitted here but should be included from your previous complete version if needed.
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
