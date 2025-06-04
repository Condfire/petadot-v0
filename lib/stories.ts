import { createClient } from "@supabase/supabase-js"

// Criar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Obtém histórias aprovadas com paginação
 * @param page Número da página
 * @param pageSize Tamanho da página
 * @param category Categoria para filtrar (opcional)
 */
export async function getApprovedStories(page = 1, pageSize = 9, category?: string) {
  try {
    // Calcular o offset com base na página e tamanho da página
    const offset = (page - 1) * pageSize

    // Construir a consulta base
    let query = supabase
      .from("pet_stories")
      .select(
        `
        id, 
        title, 
        content, 
        image_url, 
        created_at, 
        updated_at, 
        user_id, 
        category,
        likes,
        users (
          id,
          name,
          email
        )
      `,
        { count: "exact" },
      )
      .eq("status", "aprovado")
      .order("created_at", { ascending: false })

    // Adicionar filtro por categoria se fornecido
    if (category && category !== "todas") {
      query = query.eq("category", category)
    }

    // Adicionar paginação
    query = query.range(offset, offset + pageSize - 1)

    // Executar a consulta
    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      stories: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  } catch (error) {
    console.error("Erro ao obter histórias aprovadas:", error)
    return {
      stories: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
    }
  }
}

/**
 * Obtém uma história específica pelo ID
 * @param id ID da história
 */
export async function getStoryById(id: string) {
  try {
    const { data, error } = await supabase
      .from("pet_stories")
      .select(
        `
        id, 
        title, 
        content, 
        image_url, 
        created_at, 
        updated_at, 
        user_id, 
        category,
        status,
        likes,
        users (
          id,
          name,
          email
        )
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error(`Erro ao obter história com ID ${id}:`, error)
    return null
  }
}

/**
 * Obtém histórias de um usuário específico
 * @param userId ID do usuário
 */
export async function getUserStories(userId: string) {
  try {
    const { data, error } = await supabase
      .from("pet_stories")
      .select(
        `
        id, 
        title, 
        content, 
        image_url, 
        created_at, 
        updated_at, 
        user_id, 
        category,
        status,
        likes
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error(`Erro ao obter histórias do usuário ${userId}:`, error)
    return []
  }
}

/**
 * Obtém histórias em destaque (mais recentes e aprovadas)
 * @param limit Número máximo de histórias a retornar
 */
export async function getFeaturedStories(limit = 3) {
  try {
    const { data, error } = await supabase
      .from("pet_stories")
      .select(
        `
        id, 
        title, 
        content, 
        image_url, 
        created_at, 
        category,
        likes,
        users (
          id,
          name
        )
      `,
      )
      .eq("status", "aprovado")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao obter histórias em destaque:", error)
    return []
  }
}

/**
 * Obtém histórias populares (com mais curtidas)
 * @param limit Número máximo de histórias a retornar
 */
export async function getPopularStories(limit = 3) {
  try {
    const { data, error } = await supabase
      .from("pet_stories")
      .select(
        `
        id, 
        title, 
        content, 
        image_url, 
        created_at, 
        category,
        likes,
        users (
          id,
          name
        )
      `,
      )
      .eq("status", "aprovado")
      .order("likes", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao obter histórias populares:", error)
    return []
  }
}

/**
 * Obtém categorias de histórias disponíveis
 */
export async function getStoryCategories() {
  try {
    const { data, error } = await supabase.from("story_categories").select("*").order("name", { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Erro ao obter categorias de histórias:", error)
    return []
  }
}

/**
 * Incrementa o contador de curtidas de uma história
 * @param storyId ID da história
 */
export async function incrementStoryLikes(storyId: string) {
  try {
    // Primeiro, obter o número atual de curtidas
    const { data: story, error: getError } = await supabase
      .from("pet_stories")
      .select("likes")
      .eq("id", storyId)
      .single()

    if (getError) {
      throw getError
    }

    // Incrementar o contador de curtidas
    const currentLikes = story?.likes || 0
    const newLikes = currentLikes + 1

    // Atualizar o contador de curtidas
    const { error: updateError } = await supabase.from("pet_stories").update({ likes: newLikes }).eq("id", storyId)

    if (updateError) {
      throw updateError
    }

    return { success: true, likes: newLikes }
  } catch (error) {
    console.error(`Erro ao incrementar curtidas da história ${storyId}:`, error)
    return { success: false, error: "Erro ao curtir história" }
  }
}
