import { createClient } from "@supabase/supabase-js"
import { validate as isUuid } from "uuid"
import type { Database } from "./types" // Assumindo que você tem um tipo de banco de dados

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
    const { data, error } = await supabase.from(tableName).select("*", { count: "exact", head: true }).limit(1)

    return !error
  } catch (error) {
    console.error(`Erro ao verificar tabela ${tableName}:`, error)
    return false
  }
}

// Função para buscar pets para adoção com paginação
export async function getPetsForAdoption(page = 1, pageSize = 12, filters = {}): Promise<PaginationResult<Pet>> {
  try {
    console.log("Buscando pets para adoção com timestamp:", Date.now())
    console.log("Paginação:", { page, pageSize })
    console.log("Filtros:", filters)

    // Calcular o range para paginação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Verificar se a tabela pets existe
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    // Substituir a query que fazia join com ongs por:
    let query = supabase
      .from("pets")
      .select(`*, ongs(id, name, logo_url, city)`, { count: "exact" })
      .eq("category", "adoption") // Filter for adoption pets
      // Mostrar apenas pets aprovados
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to)

    // Aplicar filtros se existirem
    if (filters) {
      // Filtro de espécie
      if (filters.species && filters.species !== "all") {
        query = query.eq("species", filters.species)
      }

      // Filtro de tamanho
      if (filters.size && filters.size !== "all") {
        query = query.eq("size", filters.size)
      }

      // Filtro de gênero
      if (filters.gender && filters.gender !== "all") {
        query = query.eq("gender", filters.gender)
      }

      // Filtro de estado
      if (filters.state) {
        query = query.eq("state", filters.state)
      }

      // Filtro de cidade
      if (filters.city) {
        query = query.eq("city", filters.city)
      }

      // Filtro de busca
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,breed.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        )
      }
    }

    // Executar a query
    const { data, error, count } = await query

    if (error) {
      console.error("Erro ao buscar pets para adoção:", error)
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    // Calcular o total de páginas
    const totalPages = Math.ceil((count || 0) / pageSize)

    // Log detalhado dos resultados
    console.log(`Encontrados ${data?.length || 0} pets para adoção (página ${page} de ${totalPages})`)
    console.log(`Total de pets: ${count}`)

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.error("Erro inesperado ao buscar pets para adoção:", error)
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }
}

// Função para buscar pets perdidos com paginação (usando tabela pets)
export async function getLostPets(page = 1, pageSize = 12, filters = {}): Promise<PaginationResult<Pet>> {
  try {
    // Adicionar um timestamp para evitar cache
    const timestamp = Date.now()
    console.log(`Buscando pets perdidos: ${timestamp}`)
    console.log("Paginação:", { page, pageSize })
    console.log("Filtros:", filters)

    // Calcular o range para paginação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Verificar se a tabela pets existe
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    // Usar a tabela pets com filtro de categoria para pets perdidos
    let query = supabase
      .from("pets")
      .select("*", { count: "exact" })
      .eq("category", "lost") // Filtrar apenas pets perdidos
      // Mostrar apenas pets aprovados
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to)

    // Aplicar filtros se existirem
    if (filters) {
      // Filtro de espécie
      if (filters.species && filters.species !== "all") {
        query = query.eq("species", filters.species)
      }

      // Filtro de tamanho
      if (filters.size && filters.size !== "all") {
        query = query.eq("size", filters.size)
      }

      // Filtro de gênero
      if (filters.gender && filters.gender !== "all") {
        query = query.eq("gender", filters.gender)
      }

      // Filtro de estado
      if (filters.state) {
        query = query.eq("state", filters.state)
      }

      // Filtro de cidade
      if (filters.city) {
        query = query.eq("city", filters.city)
      }

      // Filtro de busca
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,location_details.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        )
      }
    }

    // Executar a query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching lost pets:", error)
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    // Calcular o total de páginas
    const totalPages = Math.ceil((count || 0) / pageSize)

    console.log(`Pets perdidos encontrados: ${data?.length || 0} (página ${page} de ${totalPages})`)
    console.log(`Total de pets perdidos: ${count}`)

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.error("Erro inesperado ao buscar pets perdidos:", error)
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }
}

// Função para buscar pets encontrados com paginação (usando tabela pets)
export async function getFoundPets(page = 1, pageSize = 12, filters = {}): Promise<PaginationResult<Pet>> {
  try {
    // Adicionar um timestamp para evitar cache
    const timestamp = Date.now()
    console.log(`Buscando pets encontrados: ${timestamp}`)
    console.log("Paginação:", { page, pageSize })
    console.log("Filtros:", filters)

    // Calcular o range para paginação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Verificar se a tabela pets existe
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    // Usar a tabela pets com filtro de categoria para pets encontrados
    let query = supabase
      .from("pets")
      .select("*", { count: "exact" })
      .eq("category", "found") // Filtrar apenas pets encontrados
      // Mostrar apenas pets aprovados
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to)

    // Aplicar filtros se existirem
    if (filters) {
      // Filtro de espécie
      if (filters.species && filters.species !== "all") {
        query = query.eq("species", filters.species)
      }

      // Filtro de tamanho
      if (filters.size && filters.size !== "all") {
        query = query.eq("size", filters.size)
      }

      // Filtro de gênero
      if (filters.gender && filters.gender !== "all") {
        query = query.eq("gender", filters.gender)
      }

      // Filtro de estado
      if (filters.state) {
        query = query.eq("state", filters.state)
      }

      // Filtro de cidade
      if (filters.city) {
        query = query.eq("city", filters.city)
      }

      // Filtro de busca
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,location_details.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        )
      }
    }

    // Executar a query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching found pets:", error)
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    // Calcular o total de páginas
    const totalPages = Math.ceil((count || 0) / pageSize)

    console.log(`Pets encontrados: ${data?.length || 0} (página ${page} de ${totalPages})`)
    console.log(`Total de pets encontrados: ${count}`)

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.error("Erro inesperado ao buscar pets encontrados:", error)
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }
}

// Função para buscar eventos com paginação (sem join com ongs)
export async function getEvents(page: number, pageSize: number, filters: any) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Ou SUPABASE_ANON_KEY se for para o cliente
  )

  let query = supabase.from("events").select("*", { count: "exact" })

  // Aplica filtros
  if (filters.name) {
    query = query.ilike("name", `%${filters.name}%`)
  }
  if (filters.city) {
    query = query.eq("city", filters.city)
  }
  if (filters.state) {
    query = query.eq("state", filters.state)
  }
  if (filters.start_date) {
    query = query.gte("start_date", filters.start_date)
  }

  // REMOVER TEMPORARIAMENTE ESTE FILTRO PARA DIAGNÓSTICO
  // query = query.eq("status", "approved")
  query = query.eq("status", "approved")

  // Paginação
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize - 1
  query = query.range(startIndex, endIndex)

  // Ordenação
  query = query.order("start_date", { ascending: true })

  const { data, error, count } = await query

  if (error) {
    console.error("Erro ao buscar eventos:", error)
    return { data: [], count: 0 }
  }

  console.log("Dados do evento encontrados:", data) // Para depuração

  return { data: data || [], count: count || 0 }
}

// Função para buscar ONGs com paginação (usando tabela users)
export async function getOngs(page = 1, pageSize = 12, filters: any = {}) {
  try {
    // Verificar si a tabela users existe
    const usersTableExists = await checkTableExists("users")
    if (!usersTableExists) {
      console.error("Tabela users não existe")
      return { data: [], count: 0 }
    }

    let query = supabase.from("users").select("*", { count: "exact" })

    // Filtrar apenas usuários do tipo ONG
    query = query.eq("type", "ong")

    // Aplicar filtros se existirem
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`)
    }

    if (filters.city) {
      query = query.eq("city", filters.city)
    }

    if (filters.state) {
      query = query.eq("state", filters.state)
    }

    // Aplicar paginação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query.order("name", { ascending: true }).range(from, to)

    if (error) {
      console.error("Erro ao buscar ONGs:", error)
      return { data: [], count: 0 }
    }

    console.log(`ONGs encontradas: ${data?.length || 0}`) // Added log for ONGs
    return { data: data || [], count: count || 0 }
  } catch (error) {
    console.error("Erro ao buscar ONGs:", error)
    return { data: [], count: 0 }
  }
}

// Função para buscar parceiros com paginação
export async function getPartners(page = 1, pageSize = 12, filters: any = {}) {
  try {
    // Verificar se a tabela partners existe
    const partnersTableExists = await checkTableExists("partners")
    if (!partnersTableExists) {
      console.error("Tabela partners não existe")
      return { data: [], count: 0 }
    }

    let query = supabase.from("partners").select("*", { count: "exact" })

    // Aplicar filtros se existirem
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`)
    }

    // Aplicar paginação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query.order("name", { ascending: true }).range(from, to)

    if (error) {
      console.error("Erro ao buscar parceiros:", error)
      return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
  } catch (error) {
    console.error("Erro ao buscar parceiros:", error)
    return { data: [], count: 0 }
  }
}

export async function getPendingItems(supabaseClient: any) {
  try {
    console.log("Buscando itens pendentes para moderação")

    // Usar o cliente Supabase fornecido
    const supabaseInstance = supabaseClient || createSupabaseClient()

    // Verificar se as tabelas existem
    const petsTableExists = await checkTableExists("pets")
    const eventsTableExists = await checkTableExists("events")

    let pets = []
    let lostPets = []
    let foundPets = []
    let events = []

    if (petsTableExists) {
      // Buscar pets para adoção pendentes
      const { data: petsData, error: petsError } = await supabaseInstance
        .from("pets")
        .select("*")
        .eq("category", "adoption")
        .or("status.eq.pending,status.eq.pendente")
        .order("created_at", { ascending: false })

      if (!petsError) {
        pets = petsData || []
      }

      // Buscar pets perdidos pendentes
      const { data: lostPetsData, error: lostPetsError } = await supabaseInstance
        .from("pets")
        .select("*")
        .eq("category", "lost")
        .or("status.eq.pending,status.eq.pendente")
        .order("created_at", { ascending: false })

      if (!lostPetsError) {
        lostPets = lostPetsData || []
      }

      // Buscar pets encontrados pendentes
      const { data: foundPetsData, error: foundPetsError } = await supabaseInstance
        .from("pets")
        .select("*")
        .eq("category", "found")
        .or("status.eq.pending,status.eq.pendente")
        .order("created_at", { ascending: false })

      if (!foundPetsError) {
        foundPets = foundPetsData || []
      }
    }

    if (eventsTableExists) {
      // Buscar eventos pendentes
      const { data: eventsData, error: eventsError } = await supabaseInstance
        .from("events")
        .select("*")
        .or("status.eq.pending,status.eq.pendente")
        .order("created_at", { ascending: false })

      if (!eventsError) {
        events = eventsData || []
      }
    }

    console.log("Itens pendentes encontrados:", {
      pets: pets.length,
      lostPets: lostPets.length,
      foundPets: foundPets.length,
      events: events.length,
    })

    return {
      pets,
      lostPets,
      foundPets,
      events,
    }
  } catch (error) {
    console.error("Erro ao buscar itens pendentes:", error)
    // Retornar arrays vazios em caso de erro para evitar quebrar a página
    return {
      pets: [],
      lostPets: [],
      foundPets: [],
      events: [],
    }
  }
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    console.log("Buscando estatísticas para o usuário:", userId)

    // Verificar se a tabela pets existe
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return null
    }

    // Buscar contagem de pets para adoção
    const { count: adoptionCount, error: adoptionError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", "adoption")

    // Buscar contagem de pets perdidos
    const { count: lostCount, error: lostError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", "lost")

    // Buscar contagem de pets encontrados
    const { count: foundCount, error: foundError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", "found")

    // Buscar pets recentes do usuário (todos os tipos)
    const { data: recentPets, error: recentError } = await supabase
      .from("pets")
      .select("id, name, main_image_url, created_at, status, category")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (adoptionError || lostError || foundError || recentError) {
      console.error("Erro ao buscar estatísticas do usuário:", {
        adoptionError,
        lostError,
        foundError,
        recentError,
      })
    }

    console.log("Pets recentes encontrados:", recentPets?.length || 0)

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

export async function getPetById(id: string): Promise<Pet | null> {
  try {
    // Verificar se a tabela pets existe
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return null
    }

    const { data, error } = await supabase.from("pets").select(`*`).eq("id", id).single()

    if (error) {
      console.error("Error fetching pet by ID:", error)
      return null
    }

    return data || null
  } catch (error) {
    console.error("Error fetching pet by ID:", error)
    return null
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    // Verificar se a tabela events existe
    const eventsTableExists = await checkTableExists("events")
    if (!eventsTableExists) {
      console.error("Tabela events não existe")
      return null
    }

    const { data, error } = await supabase.from("events").select(`*`).eq("id", id).single()

    if (error) {
      console.error("Error fetching event by ID:", error)
      return null
    }

    return data || null
  } catch (error) {
    console.error("Error fetching event by ID:", error)
    return null
  }
}

export async function getOngById(id: string): Promise<Ong | null> {
  try {
    // Verificar se o ID é válido
    if (!id || id === "undefined" || id === "null") {
      console.error("ID de ONG inválido fornecido:", id)
      return null
    }

    // Verificar se a tabela users existe
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
  resolvedPets: Pet[] // Pets que foram 'adopted', 'resolved' (para lost), ou 'reunited' (para found)
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
          // 'found' as status for lost pet means resolved
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

    // Verificar se a tabela pets existe
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      console.error("Tabela pets não existe")
      return { success: false, error: "Tabela de pets não encontrada" }
    }

    // Verificar se o pet pertence ao usuário
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

// Função para verificar pets de um usuário diretamente
export async function checkUserPetsDirectly(email: string) {
  try {
    // Verificar se o email foi fornecido
    if (!email) {
      return {
        success: false,
        error: "Email não fornecido",
      }
    }

    // Verificar se a tabela users existe
    const usersTableExists = await checkTableExists("users")
    if (!usersTableExists) {
      return {
        success: false,
        error: "Tabela de usuários não encontrada",
      }
    }

    // Buscar o usuário pelo email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single()

    if (userError) {
      return {
        success: false,
        error: `Usuário não encontrado: ${userError.message}`,
      }
    }

    // Verificar se a tabela pets existe
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      return {
        success: true,
        userId: userData.id,
        email: userData.email,
        pets: {
          adoption: [],
          lost: [],
          found: [],
        },
      }
    }

    // Buscar pets para adoção do usuário
    const { data: adoptionPets, error: adoptionError } = await supabase
      .from("pets")
      .select("id, name, species, status")
      .eq("user_id", userData.id)
      .eq("category", "adoption")

    // Buscar pets perdidos do usuário
    const { data: lostPets, error: lostError } = await supabase
      .from("pets")
      .select("id, name, species, status")
      .eq("user_id", userData.id)
      .eq("category", "lost")

    // Buscar pets encontrados do usuário
    const { data: foundPets, error: foundError } = await supabase
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
    return {
      success: false,
      error: "Erro ao verificar pets",
    }
  }
}

// Função para criar um pet de teste
export async function createTestPet(userId: string) {
  try {
    // Verificar se o ID do usuário foi fornecido
    if (!userId) {
      return {
        success: false,
        error: "ID do usuário não fornecido",
      }
    }

    // Verificar se a tabela users existe
    const usersTableExists = await checkTableExists("users")
    if (!usersTableExists) {
      return {
        success: false,
        error: "Tabela de usuários não encontrada",
      }
    }

    // Verificar se a tabela pets existe
    const petsTableExists = await checkTableExists("pets")
    if (!petsTableExists) {
      return {
        success: false,
        error: "Tabela de pets não encontrada",
      }
    }

    // Verificar se o usuário existe na tabela users
    const { data: userData, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      // Se o usuário não existir, criar um registro na tabela users
      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert([
          {
            id: userId,
            name: "Usuário de Teste",
            email: "teste@exemplo.com",
          },
        ])
        .select()

      if (createUserError) {
        return {
          success: false,
          error: `Erro ao criar usuário: ${createUserError.message}`,
        }
      }
    }

    // Criar um pet perdido de teste
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
      return {
        success: false,
        error: `Erro ao criar pet de teste: ${petError.message}`,
      }
    }

    return {
      success: true,
      petId: newPet[0].id,
      message: "Pet de teste criado com sucesso",
    }
  } catch (error) {
    console.error("Erro ao criar pet de teste:", error)
    return {
      success: false,
      error: "Erro ao criar pet de teste",
    }
  }
}

// Adicionar após as funções existentes

export async function getApprovedStories(limit = 3) {
  try {
    console.log("Buscando histórias aprovadas")

    // Verificar se a tabela pet_stories existe
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

// Adicionar função para buscar evento por slug ou id

// Function to get lost pet by ID or slug
export async function getLostPetById(idOrSlug: string) {
  try {
    // Verificar se a tabela pets existe
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

// Function to get found pet by ID or slug
export async function getFoundPetById(idOrSlug: string) {
  try {
    // Verificar se a tabela pets existe
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

// Function to get event by slug or ID
export async function getEventBySlugOrId(slugOrId: string) {
  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  let query = supabase.from("events").select("*").limit(1)

  if (isNaN(Number(slugOrId))) {
    // É um slug
    query = query.eq("slug", slugOrId)
  } else {
    // É um ID
    query = query.eq("id", slugOrId)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error("Erro ao buscar evento por slug ou ID:", error)
    return null
  }

  return data
}
