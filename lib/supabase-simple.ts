import { createClient } from "@supabase/supabase-js"
import { validate as isUuid } from "uuid"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Interface para paginação
export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Função para verificar se um status é considerado "aprovado"
function isApprovedStatus(status: string | null | undefined): boolean {
  if (!status || typeof status !== "string") return false
  const normalizedStatus = status.toLowerCase().trim()
  return normalizedStatus === "approved" || normalizedStatus === "aprovado"
}

// Função de debug para verificar status dos pets
export async function debugPetStatuses() {
  try {
    console.log("🔍 Verificando status dos pets no banco...")

    const { data: allPets, error } = await supabase
      .from("pets")
      .select("id, name, status, category")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("❌ Erro ao buscar pets:", error)
      return
    }

    console.log(`📊 Total de pets encontrados: ${allPets?.length || 0}`)

    // Agrupar por status
    const statusGroups: Record<string, any[]> = {}
    allPets?.forEach((pet) => {
      const status = pet.status || "null"
      if (!statusGroups[status]) statusGroups[status] = []
      statusGroups[status].push(pet)
    })

    console.log("📋 Status encontrados:")
    Object.entries(statusGroups).forEach(([status, pets]) => {
      const isApproved = isApprovedStatus(status)
      console.log(`  ${isApproved ? "✅" : "❌"} ${status}: ${pets.length} pets`)
    })

    // Mostrar pets aprovados por categoria
    const approvedPets = allPets?.filter((pet) => isApprovedStatus(pet.status)) || []
    console.log(`\n✅ Pets aprovados: ${approvedPets.length}`)

    const categoryGroups: Record<string, any[]> = {}
    approvedPets.forEach((pet) => {
      const category = pet.category || "unknown"
      if (!categoryGroups[category]) categoryGroups[category] = []
      categoryGroups[category].push(pet)
    })

    Object.entries(categoryGroups).forEach(([category, pets]) => {
      console.log(`  📂 ${category}: ${pets.length} pets`)
    })
  } catch (error) {
    console.error("❌ Erro no debug:", error)
  }
}

// Função principal para buscar pets para adoção
export async function getPetsForAdoption(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  try {
    console.log(`🔍 Buscando pets para adoção - Página ${page}, Tamanho ${pageSize}`)

    // Buscar TODOS os pets de adoção primeiro
    let query = supabase
      .from("pets")
      .select(`*, ongs(id, name, logo_url, city)`)
      .eq("category", "adoption")
      .order("created_at", { ascending: false })

    // Aplicar filtros de busca
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

    const { data, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets para adoção:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    console.log(`📊 Total de pets encontrados no banco: ${data?.length || 0}`)

    // Filtrar apenas pets aprovados
    const approvedPets = (data || []).filter((pet) => {
      const isApproved = isApprovedStatus(pet.status)
      if (!isApproved) {
        console.log(`❌ Pet rejeitado: ${pet.name} (status: ${pet.status})`)
      }
      return isApproved
    })

    console.log(`✅ Pets aprovados após filtro: ${approvedPets.length}`)

    // Aplicar paginação nos pets aprovados
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    const totalPages = Math.ceil(approvedPets.length / pageSize)

    console.log(`📄 Pets na página atual: ${paginatedPets.length}`)

    return {
      data: paginatedPets,
      total: approvedPets.length,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("❌ Erro inesperado ao buscar pets para adoção:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// Função para buscar pets perdidos
export async function getLostPets(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  try {
    console.log(`🔍 Buscando pets perdidos - Página ${page}, Tamanho ${pageSize}`)

    let query = supabase.from("pets").select("*").eq("category", "lost").order("created_at", { ascending: false })

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

    const { data, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets perdidos:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    console.log(`📊 Total de pets perdidos encontrados: ${data?.length || 0}`)

    const approvedPets = (data || []).filter((pet) => isApprovedStatus(pet.status))
    console.log(`✅ Pets perdidos aprovados: ${approvedPets.length}`)

    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    const totalPages = Math.ceil(approvedPets.length / pageSize)

    return {
      data: paginatedPets,
      total: approvedPets.length,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("❌ Erro inesperado ao buscar pets perdidos:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// Função para buscar pets encontrados
export async function getFoundPets(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  try {
    console.log(`🔍 Buscando pets encontrados - Página ${page}, Tamanho ${pageSize}`)

    let query = supabase.from("pets").select("*").eq("category", "found").order("created_at", { ascending: false })

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

    const { data, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets encontrados:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    console.log(`📊 Total de pets encontrados: ${data?.length || 0}`)

    const approvedPets = (data || []).filter((pet) => isApprovedStatus(pet.status))
    console.log(`✅ Pets encontrados aprovados: ${approvedPets.length}`)

    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    const totalPages = Math.ceil(approvedPets.length / pageSize)

    return {
      data: paginatedPets,
      total: approvedPets.length,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("❌ Erro inesperado ao buscar pets encontrados:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// Função para buscar pet por ID ou slug
export async function getPetByIdOrSlug(
  idOrSlug: string,
  category?: "adoption" | "lost" | "found",
): Promise<any | null> {
  try {
    const isUuidValue = isUuid(idOrSlug)
    let query = supabase.from("pets").select(`*, user:users!pets_user_id_fkey(id, name, email, type, avatar_url)`)

    if (category) {
      query = query.eq("category", category)
    }

    query = query.eq(isUuidValue ? "id" : "slug", idOrSlug).single()

    const { data, error } = await query

    if (error) {
      if (error.code !== "PGRST116") {
        console.error(`❌ Erro ao buscar pet por ${isUuidValue ? "ID" : "slug"} (${idOrSlug}):`, error)
      }
      return null
    }
    return data || null
  } catch (err) {
    console.error(`❌ Erro inesperado ao buscar pet por ${idOrSlug}:`, err)
    return null
  }
}
