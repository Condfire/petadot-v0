import { createClient } from "@supabase/supabase-js"

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

// ✅ SOLUÇÃO SIMPLES: Função que normaliza status
function isApprovedStatus(status: string | null | undefined): boolean {
  if (!status) return false
  const normalizedStatus = status.toLowerCase().trim()
  return normalizedStatus === "approved" || normalizedStatus === "aprovado"
}

// ✅ PETS PARA ADOÇÃO - VERSÃO SIMPLIFICADA
export async function getPetsForAdoption(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  try {
    console.log("🔍 Buscando pets para adoção...")

    // 1. BUSCAR TODOS os pets de adoção (sem filtro de status no SQL)
    let query = supabase
      .from("pets")
      .select(`*, ongs(id, name, logo_url, city)`)
      .eq("category", "adoption")
      .order("created_at", { ascending: false })

    // 2. Aplicar outros filtros
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all" && key !== "search") {
        query = query.eq(key, filters[key])
      }
    })

    // 3. Aplicar filtro de busca
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,breed.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      )
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    console.log(`📊 Total de pets encontrados: ${data?.length || 0}`)

    // 4. FILTRAR APENAS APROVADOS no JavaScript
    const approvedPets = (data || []).filter((pet) => {
      const approved = isApprovedStatus(pet.status)
      if (!approved) {
        console.log(`🚫 Pet rejeitado: ${pet.name} (status: ${pet.status})`)
      }
      return approved
    })

    console.log(`✅ Pets aprovados: ${approvedPets.length}`)

    // 5. APLICAR PAGINAÇÃO nos dados já filtrados
    const total = approvedPets.length
    const totalPages = Math.ceil(total / pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    console.log(`📄 Página ${page}/${totalPages} - Mostrando ${paginatedPets.length} pets`)

    return {
      data: paginatedPets,
      total,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("💥 Erro inesperado:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// ✅ PETS PERDIDOS - VERSÃO SIMPLIFICADA
export async function getLostPets(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  try {
    console.log("🔍 Buscando pets perdidos...")

    let query = supabase.from("pets").select("*").eq("category", "lost").order("created_at", { ascending: false })

    // Aplicar filtros
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all" && key !== "search") {
        query = query.eq(key, filters[key])
      }
    })

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,location_details.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      )
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets perdidos:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    // Filtrar apenas aprovados
    const approvedPets = (data || []).filter((pet) => isApprovedStatus(pet.status))

    // Aplicar paginação
    const total = approvedPets.length
    const totalPages = Math.ceil(total / pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    console.log(`✅ Pets perdidos aprovados: ${approvedPets.length} (página ${page}/${totalPages})`)

    return {
      data: paginatedPets,
      total,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("💥 Erro inesperado:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// ✅ PETS ENCONTRADOS - VERSÃO SIMPLIFICADA
export async function getFoundPets(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  try {
    console.log("🔍 Buscando pets encontrados...")

    let query = supabase.from("pets").select("*").eq("category", "found").order("created_at", { ascending: false })

    // Aplicar filtros
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "all" && key !== "search") {
        query = query.eq(key, filters[key])
      }
    })

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,location_details.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      )
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets encontrados:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    // Filtrar apenas aprovados
    const approvedPets = (data || []).filter((pet) => isApprovedStatus(pet.status))

    // Aplicar paginação
    const total = approvedPets.length
    const totalPages = Math.ceil(total / pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    console.log(`✅ Pets encontrados aprovados: ${approvedPets.length} (página ${page}/${totalPages})`)

    return {
      data: paginatedPets,
      total,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("💥 Erro inesperado:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// ✅ BUSCAR PET POR ID/SLUG - VERSÃO SIMPLIFICADA
export async function getPetByIdOrSlug(
  idOrSlug: string,
  category?: "adoption" | "lost" | "found",
): Promise<any | null> {
  try {
    console.log(`🔍 Buscando pet: ${idOrSlug}`)

    const isUuid = idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)

    let query = supabase.from("pets").select(`*, users!pets_user_id_fkey(id, name, email, type, avatar_url)`)

    if (category) {
      query = query.eq("category", category)
    }

    query = query.eq(isUuid ? "id" : "slug", idOrSlug).single()

    const { data, error } = await query

    if (error) {
      if (error.code !== "PGRST116") {
        console.error(`❌ Erro ao buscar pet:`, error)
      }
      return null
    }

    console.log(`📋 Pet encontrado: ${data?.name} (status: ${data?.status})`)
    return data || null
  } catch (err) {
    console.error(`💥 Erro inesperado ao buscar pet:`, err)
    return null
  }
}

// ✅ FUNÇÃO PARA DEBUG - Ver todos os status
export async function debugPetStatuses() {
  try {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, status, category")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("❌ Erro ao buscar pets para debug:", error)
      return
    }

    console.log("🔍 DEBUG - Status dos pets:")
    const statusCount: Record<string, number> = {}

    data?.forEach((pet) => {
      const status = pet.status || "null"
      statusCount[status] = (statusCount[status] || 0) + 1
      console.log(`${pet.name}: "${pet.status}" (${pet.category})`)
    })

    console.log("📊 Contagem por status:", statusCount)
  } catch (err) {
    console.error("💥 Erro no debug:", err)
  }
}
