import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

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
  if (!status) return false
  const statusLower = status.toLowerCase().trim()

  // Lista de status considerados aprovados (case-insensitive)
  const approvedStatuses = ["approved", "aprovado", "ativo", "active", "publicado", "published"]

  return approvedStatuses.includes(statusLower)
}

// Função de debug para verificar status no banco
export async function debugPetStatuses() {
  console.log("🔍 DEBUG: Verificando status dos pets no banco...")

  try {
    const { data: allPets, error } = await supabase.from("pets").select("id, name, status, category").limit(50)

    if (error) {
      console.error("❌ Erro ao buscar pets:", error)
      return
    }

    console.log(`📊 Total de pets encontrados: ${allPets?.length || 0}`)

    // Agrupar por status
    const statusGroups: Record<string, any[]> = {}
    allPets?.forEach((pet) => {
      const status = pet.status || "null"
      if (!statusGroups[status]) {
        statusGroups[status] = []
      }
      statusGroups[status].push(pet)
    })

    console.log("📋 Status encontrados no banco:")
    Object.entries(statusGroups).forEach(([status, pets]) => {
      const isApproved = isApprovedStatus(status)
      console.log(
        `  ${isApproved ? "✅" : "❌"} "${status}": ${pets.length} pets ${isApproved ? "(SERÁ EXIBIDO)" : "(NÃO SERÁ EXIBIDO)"}`,
      )
    })

    // Mostrar pets aprovados por categoria
    const approvedPets = allPets?.filter((pet) => isApprovedStatus(pet.status)) || []
    console.log(`\n🎯 Pets aprovados que SERÃO exibidos: ${approvedPets.length}`)

    const categories = ["adoption", "lost", "found"]
    categories.forEach((category) => {
      const categoryPets = approvedPets.filter((pet) => pet.category === category)
      console.log(`  📂 ${category}: ${categoryPets.length} pets`)
    })
  } catch (error) {
    console.error("❌ Erro no debug:", error)
  }
}

// ✅ FUNÇÃO SIMPLIFICADA PARA PETS DE ADOÇÃO
export async function getPetsForAdoption(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  console.log(`🏠 Buscando pets para adoção - Página ${page}`)

  try {
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

    const { data: allPets, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets para adoção:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    console.log(`📊 Total de pets de adoção encontrados no banco: ${allPets?.length || 0}`)

    // ✅ FILTRAR APENAS PETS APROVADOS (JavaScript)
    const approvedPets = (allPets || []).filter((pet) => {
      const isApproved = isApprovedStatus(pet.status)
      if (!isApproved) {
        console.log(`❌ Pet "${pet.name}" com status "${pet.status}" foi FILTRADO`)
      }
      return isApproved
    })

    console.log(`✅ Pets aprovados para adoção: ${approvedPets.length}`)

    // ✅ APLICAR PAGINAÇÃO NOS PETS APROVADOS
    const totalApproved = approvedPets.length
    const totalPages = Math.ceil(totalApproved / pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    console.log(`📄 Página ${page}/${totalPages} - Exibindo ${paginatedPets.length} pets`)

    return {
      data: paginatedPets,
      total: totalApproved,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("❌ Erro inesperado ao buscar pets para adoção:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// ✅ FUNÇÃO SIMPLIFICADA PARA PETS PERDIDOS
export async function getLostPets(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  console.log(`😢 Buscando pets perdidos - Página ${page}`)

  try {
    // Buscar TODOS os pets perdidos primeiro
    let query = supabase.from("pets").select("*").eq("category", "lost").order("created_at", { ascending: false })

    // Aplicar filtros de busca
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

    const { data: allPets, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets perdidos:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    console.log(`📊 Total de pets perdidos encontrados no banco: ${allPets?.length || 0}`)

    // ✅ FILTRAR APENAS PETS APROVADOS (JavaScript)
    const approvedPets = (allPets || []).filter((pet) => {
      const isApproved = isApprovedStatus(pet.status)
      if (!isApproved) {
        console.log(`❌ Pet perdido "${pet.name}" com status "${pet.status}" foi FILTRADO`)
      }
      return isApproved
    })

    console.log(`✅ Pets perdidos aprovados: ${approvedPets.length}`)

    // ✅ APLICAR PAGINAÇÃO NOS PETS APROVADOS
    const totalApproved = approvedPets.length
    const totalPages = Math.ceil(totalApproved / pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    console.log(`📄 Página ${page}/${totalPages} - Exibindo ${paginatedPets.length} pets`)

    return {
      data: paginatedPets,
      total: totalApproved,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("❌ Erro inesperado ao buscar pets perdidos:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// ✅ FUNÇÃO SIMPLIFICADA PARA PETS ENCONTRADOS
export async function getFoundPets(
  page = 1,
  pageSize = 12,
  filters: Record<string, any> = {},
): Promise<PaginationResult<any>> {
  console.log(`😊 Buscando pets encontrados - Página ${page}`)

  try {
    // Buscar TODOS os pets encontrados primeiro
    let query = supabase.from("pets").select("*").eq("category", "found").order("created_at", { ascending: false })

    // Aplicar filtros de busca
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

    const { data: allPets, error } = await query

    if (error) {
      console.error("❌ Erro ao buscar pets encontrados:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 1 }
    }

    console.log(`📊 Total de pets encontrados no banco: ${allPets?.length || 0}`)

    // ✅ FILTRAR APENAS PETS APROVADOS (JavaScript)
    const approvedPets = (allPets || []).filter((pet) => {
      const isApproved = isApprovedStatus(pet.status)
      if (!isApproved) {
        console.log(`❌ Pet encontrado "${pet.name}" com status "${pet.status}" foi FILTRADO`)
      }
      return isApproved
    })

    console.log(`✅ Pets encontrados aprovados: ${approvedPets.length}`)

    // ✅ APLICAR PAGINAÇÃO NOS PETS APROVADOS
    const totalApproved = approvedPets.length
    const totalPages = Math.ceil(totalApproved / pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize
    const paginatedPets = approvedPets.slice(from, to)

    console.log(`📄 Página ${page}/${totalPages} - Exibindo ${paginatedPets.length} pets`)

    return {
      data: paginatedPets,
      total: totalApproved,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    }
  } catch (err) {
    console.error("❌ Erro inesperado ao buscar pets encontrados:", err)
    return { data: [], total: 0, page, pageSize, totalPages: 1 }
  }
}

// ✅ FUNÇÃO PARA BUSCAR PET POR ID/SLUG (para páginas de detalhes)
export async function getPetByIdOrSlug(
  idOrSlug: string,
  category?: "adoption" | "lost" | "found",
): Promise<any | null> {
  console.log(`🔍 Buscando pet por ${idOrSlug}`)

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

    let query = supabase.from("pets").select(`*, user:users!pets_user_id_fkey(id, name, email, type, avatar_url)`)

    if (category) {
      query = query.eq("category", category)
    }

    query = query.eq(isUuid ? "id" : "slug", idOrSlug).single()

    const { data: pet, error } = await query

    if (error) {
      if (error.code !== "PGRST116") {
        console.error(`❌ Erro ao buscar pet:`, error)
      }
      return null
    }

    if (!pet) {
      console.log(`❌ Pet não encontrado: ${idOrSlug}`)
      return null
    }

    console.log(`✅ Pet encontrado: "${pet.name}" com status "${pet.status}"`)
    return pet
  } catch (err) {
    console.error(`❌ Erro inesperado ao buscar pet:`, err)
    return null
  }
}
