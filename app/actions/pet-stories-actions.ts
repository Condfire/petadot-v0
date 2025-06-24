"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Tipo para as histórias
export type PetStory = {
  id: string
  title: string
  content: string
  image_url?: string | null
  user_id: string
  created_at: string
  updated_at: string
  status: string
  likes: number
  pet_id?: string | null
  pet_type?: string | null
  user?: {
    name: string
    avatar_url?: string | null
  }
  pet?: {
    id: string
    name: string
    image_url?: string | null
    type: string
  } | null
}

// Verificar se a tabela existe
async function checkTableExists(supabase, tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true })
      .limit(1)

    return !error
  } catch (err) {
    console.error(`Erro ao verificar tabela ${tableName}:`, err)
    return false
  }
}

// Criar tabela pet_stories se não existir
async function createPetStoriesTable(supabase) {
  try {
    // Verificar se o usuário tem permissões para criar tabelas
    const { data: roleData, error: roleError } = await supabase.rpc("get_my_claims")

    if (roleError || !roleData?.role || roleData.role !== "service_role") {
      console.log("Usuário não tem permissões para criar tabelas")
      return false
    }

    // Criar tabela
    const { error } = await supabase.rpc("create_pet_stories_table")

    if (error) {
      console.error("Erro ao criar tabela pet_stories:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro ao criar tabela pet_stories:", error)
    return false
  }
}

// Criar uma nova história
export async function createPetStory(formData: FormData) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Você precisa estar logado para compartilhar uma história" }
    }

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return {
        success: false,
        error: "O sistema de histórias ainda não está disponível. Por favor, tente novamente mais tarde.",
      }
    }

    // Extrair dados do formulário
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const imageUrl = (formData.get("imageUrl") as string) || null
    const petIdWithType = (formData.get("petId") as string) || null

    let petId = null
    let petType = null

    // Se tiver um pet selecionado, extrair o tipo e o ID
    if (petIdWithType && petIdWithType !== "") {
      const [type, id] = petIdWithType.split(":")
      petId = id
      petType = type
    }

    // Validar dados
    if (!title || !content) {
      return { success: false, error: "Título e conteúdo são obrigatórios" }
    }

    // Inserir história no banco de dados
    const { data, error } = await supabase
      .from("pet_stories")
      .insert([
        {
          title,
          content,
          image_url: imageUrl,
          user_id: session.user.id,
          status: "pendente", // Histórias começam como pendentes
          pet_id: petId,
          pet_type: petType,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao criar história:", error)
      return { success: false, error: "Erro ao salvar a história. Tente novamente mais tarde." }
    }

    // Revalidar caminhos
    revalidatePath("/historias")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Erro ao criar história:", error)
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação" }
  }
}

// Obter todas as histórias (aprovadas para usuários não autenticados, todas para admin)
export async function getPetStories(page = 1, limit = 10) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Calcular offset para paginação
    const offset = (page - 1) * limit

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return {
        success: true,
        data: [],
        count: 0,
        totalPages: 0,
        currentPage: page,
        message:
          "O sistema de histórias ainda não está disponível. Seja o primeiro a compartilhar sua história quando estiver disponível!",
      }
    }

    // Consulta base para pet_stories
    let query = supabase.from("pet_stories").select(`*`, { count: "exact" })

    // Se não for admin, mostrar apenas histórias aprovadas ou do próprio usuário
    if (!session?.user) {
      query = query.eq("status", "aprovado")
      console.log("Usuário não autenticado, buscando apenas histórias aprovadas")
    } else {
      // Verificar se o usuário é admin
      const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

      if (!userData?.is_admin) {
        query = query.or(`status.eq.aprovado,user_id.eq.${session.user.id}`)
        console.log("Usuário autenticado (não admin), buscando histórias aprovadas e do próprio usuário")
      } else {
        console.log("Usuário admin, buscando todas as histórias")
      }
    }

    // Executar consulta com paginação
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Erro ao buscar histórias:", error)
      return { success: false, error: "Erro ao buscar histórias", data: [], count: 0 }
    }

    // Para cada história, buscar informações do usuário separadamente
    const storiesWithUsers = await Promise.all(
      data.map(async (story) => {
        // Buscar informações do usuário
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, avatar_url")
          .eq("id", story.user_id)
          .single()

        if (userError) {
          console.log(`Não foi possível buscar informações do usuário para a história ${story.id}:`, userError)
          return {
            ...story,
            user: {
              name: "Usuário",
              avatar_url: null,
            },
          }
        }

        return {
          ...story,
          user: userData,
        }
      }),
    )

    console.log(
      `Encontradas ${data.length} histórias, status das histórias:`,
      data.map((h) => h.status),
    )

    return {
      success: true,
      data: storiesWithUsers,
      count: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
      currentPage: page,
    }
  } catch (error) {
    console.error("Erro ao buscar histórias:", error)
    return {
      success: true,
      data: [],
      count: 0,
      message: "Ainda não há histórias disponíveis. Seja o primeiro a compartilhar sua história!",
    }
  }
}

// Obter uma história específica pelo ID
export async function getPetStoryById(id: string) {
  try {
    console.log("Buscando história com ID:", id)

    // Usar o cliente do servidor para autenticação
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("Sessão do usuário:", session ? "Autenticado" : "Não autenticado")

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return { success: false, error: "O sistema de histórias ainda não está disponível." }
    }

    // Buscar história diretamente, sem usar a relação automática
    // Modificado para não usar .single() e tratar o caso de nenhum resultado
    const { data: stories, error } = await supabase.from("pet_stories").select("*").eq("id", id)

    if (error) {
      console.error("Erro ao buscar história:", error)
      return { success: false, error: "Erro ao buscar a história" }
    }

    // Verificar se a história foi encontrada
    if (!stories || stories.length === 0) {
      console.error("História não encontrada com ID:", id)
      return { success: false, error: "História não encontrada" }
    }

    // Usar a primeira história encontrada (deve ser única pelo ID)
    const data = stories[0]
    console.log("História encontrada:", data)

    // Buscar informações do usuário separadamente
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name, avatar_url")
      .eq("id", data.user_id)
      .single()

    // Adicionar informações do usuário à história
    const storyWithUser = {
      ...data,
      user: userError ? { name: "Usuário", avatar_url: null } : userData,
    }

    console.log("História com informações do usuário:", storyWithUser)

    // Verificar permissões apenas se a história não estiver aprovada
    if (storyWithUser.status !== "aprovado" && (!session || session.user.id !== storyWithUser.user_id)) {
      // Verificar se o usuário é admin
      if (session) {
        const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

        if (!userData?.is_admin) {
          return { success: false, error: "Você não tem permissão para visualizar esta história" }
        }
      } else {
        return { success: false, error: "Você não tem permissão para visualizar esta história" }
      }
    }

    return { success: true, data: storyWithUser }
  } catch (error) {
    console.error("Erro ao buscar história:", error)
    return { success: false, error: "Ocorreu um erro ao buscar a história" }
  }
}

// Atualizar uma história
export async function updatePetStory(storyId: string, formData: FormData) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Você precisa estar logado para editar uma história" }
    }

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return { success: false, error: "O sistema de histórias ainda não está disponível." }
    }

    const userId = session.user.id
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const imageUrl = (formData.get("imageUrl") as string) || null
    const petIdWithType = (formData.get("petId") as string) || null
    const categoryId = (formData.get("categoryId") as string) || null

    let petId = null
    let petType = null

    // Se tiver um pet selecionado, extrair o tipo e o ID
    if (petIdWithType && petIdWithType !== "") {
      const [type, id] = petIdWithType.split(":")
      petId = id
      petType = type
    }

    if (!title || !content) {
      return { success: false, error: "Título e conteúdo são obrigatórios" }
    }

    // Verificar se a história existe e pertence ao usuário
    // Modificado para não usar .single() e tratar o caso de nenhum resultado
    const { data: stories, error: storyError } = await supabase.from("pet_stories").select("*").eq("id", storyId)

    if (storyError) {
      console.error("Erro ao verificar história:", storyError)
      return { success: false, error: "Erro ao verificar a história" }
    }

    // Verificar se a história foi encontrada
    if (!stories || stories.length === 0) {
      console.error("História não encontrada com ID:", storyId)
      return { success: false, error: "História não encontrada" }
    }

    // Usar a primeira história encontrada (deve ser única pelo ID)
    const story = stories[0]

    // Verificar se o usuário é o autor da história ou admin
    if (story.user_id !== userId) {
      // Verificar se o usuário é admin
      const { data: userData } = await supabase.from("users").select("is_admin").eq("id", userId).single()

      if (!userData?.is_admin) {
        return { success: false, error: "Você não tem permissão para editar esta história" }
      }
    }

    // Atualizar a história
    const { data, error } = await supabase
      .from("pet_stories")
      .update({
        title,
        content,
        image_url: imageUrl,
        category_id: categoryId,
        pet_id: petId,
        pet_type: petType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId)
      .select()

    if (error) {
      console.error("Erro ao atualizar história:", error)
      return { success: false, error: "Erro ao atualizar a história. Tente novamente mais tarde." }
    }

    // Revalidar caminhos relevantes
    revalidatePath("/historias")
    revalidatePath(`/historias/${storyId}`)
    revalidatePath("/dashboard/historias")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Erro ao atualizar história:", error)
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação" }
  }
}

// Excluir uma história
export async function deletePetStory(id: string) {
  try {
    console.log("Tentando excluir história com ID:", id)

    // Usar o cliente do servidor para autenticação
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("Usuário não autenticado")
      return { success: false, error: "Você precisa estar logado para excluir uma história" }
    }

    console.log("Usuário autenticado:", session.user.id)

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return { success: false, error: "O sistema de histórias ainda não está disponível." }
    }

    // Verificar se a história existe e pertence ao usuário
    // Modificado para não usar .single() e tratar o caso de nenhum resultado
    const { data: stories, error: storyError } = await supabase.from("pet_stories").select("*").eq("id", id)

    if (storyError) {
      console.error("Erro ao verificar história:", storyError)
      return { success: false, error: "Erro ao verificar a história" }
    }

    // Verificar se a história foi encontrada
    if (!stories || stories.length === 0) {
      console.error("História não encontrada com ID:", id)
      return { success: false, error: "História não encontrada" }
    }

    // Usar a primeira história encontrada (deve ser única pelo ID)
    const story = stories[0]
    console.log("História encontrada:", story)

    // Verificar se o usuário é o autor da história ou admin
    if (story.user_id !== session.user.id) {
      // Verificar se o usuário é admin
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", session.user.id)
        .single()

      if (userError || !userData?.is_admin) {
        console.log("Usuário não é o autor nem admin")
        return { success: false, error: "Você não tem permissão para excluir esta história" }
      }

      console.log("Usuário é admin, permitindo exclusão")
    } else {
      console.log("Usuário é o autor da história")
    }

    // Excluir a história
    const { error } = await supabase.from("pet_stories").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir história:", error)
      return { success: false, error: "Erro ao excluir a história. Tente novamente mais tarde." }
    }

    console.log("História excluída com sucesso")

    // Revalidar caminhos
    revalidatePath("/historias")
    revalidatePath("/dashboard/historias")
    revalidatePath("/") // Revalidar a página inicial também

    // Tentar revalidação via API também para garantir
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?path=/`, {
        method: "POST",
      }).catch((e) => console.error("Erro ao revalidar via API:", e))
    } catch (revalidateError) {
      console.error("Erro ao revalidar via API:", revalidateError)
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir história:", error)
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação" }
  }
}

// Aprovar uma história (apenas admin)
export async function approvePetStory(id: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Você precisa estar logado para aprovar uma história" }
    }

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return { success: false, error: "O sistema de histórias ainda não está disponível." }
    }

    // Verificar se o usuário é admin
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

    if (!userData?.is_admin) {
      return { success: false, error: "Você não tem permissão para aprovar histórias" }
    }

    // Aprovar história - usando "aprovado" em vez de "approved"
    const { data, error } = await supabase.from("pet_stories").update({ status: "aprovado" }).eq("id", id).select()

    if (error) {
      console.error("Erro ao aprovar história:", error)
      return { success: false, error: "Erro ao aprovar a história. Tente novamente mais tarde." }
    }

    console.log("História aprovada com sucesso:", data)

    // Revalidar caminhos
    try {
      // Revalidar página de histórias
      revalidatePath("/historias")

      // Revalidar página inicial
      revalidatePath("/")

      // Revalidar página da história específica
      revalidatePath(`/historias/${id}`)

      // Tentar revalidação via API também
      const revalidateHistorias = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?path=/historias`, {
        method: "POST",
      }).catch((e) => console.error("Erro ao revalidar via API:", e))

      const revalidateHome = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?path=/`, {
        method: "POST",
      }).catch((e) => console.error("Erro ao revalidar via API:", e))
    } catch (revalidateError) {
      console.error("Erro ao revalidar páginas:", revalidateError)
    }

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Erro ao aprovar história:", error)
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação" }
  }
}

// Rejeitar uma história (apenas admin)
export async function rejectPetStory(id: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Você precisa estar logado para rejeitar uma história" }
    }

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return { success: false, error: "O sistema de histórias ainda não está disponível." }
    }

    // Verificar se o usuário é admin
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

    if (!userData?.is_admin) {
      return { success: false, error: "Você não tem permissão para rejeitar histórias" }
    }

    // Rejeitar história
    const { data, error } = await supabase.from("pet_stories").update({ status: "rejeitado" }).eq("id", id).select()

    if (error) {
      console.error("Erro ao rejeitar história:", error)
      return { success: false, error: "Erro ao rejeitar a história. Tente novamente mais tarde." }
    }

    // Revalidar caminhos
    revalidatePath("/historias")
    revalidatePath(`/historias/${id}`)
    revalidatePath("/admin/historias")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Erro ao rejeitar história:", error)
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação" }
  }
}

// Curtir uma história
export async function likeStory(id: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Você precisa estar logado para curtir uma história" }
    }

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return { success: false, error: "O sistema de histórias ainda não está disponível." }
    }

    // Buscar a história atual
    const { data: story, error: storyError } = await supabase.from("pet_stories").select("likes").eq("id", id).single()

    if (storyError) {
      console.error("Erro ao buscar história:", storyError)
      return { success: false, error: "História não encontrada" }
    }

    // Incrementar o contador de likes
    const currentLikes = story.likes || 0
    const newLikes = currentLikes + 1

    // Atualizar a história
    const { error } = await supabase.from("pet_stories").update({ likes: newLikes }).eq("id", id)

    if (error) {
      console.error("Erro ao curtir história:", error)
      return { success: false, error: "Erro ao curtir a história" }
    }

    // Revalidar caminhos
    revalidatePath(`/historias/${id}`)
    revalidatePath("/historias")

    return { success: true, data: newLikes }
  } catch (error) {
    console.error("Erro ao curtir história:", error)
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação" }
  }
}

// Obter histórias pendentes (apenas admin)
export async function getPendingPetStories() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Você precisa estar logado para visualizar histórias pendentes", data: [] }
    }

    // Verificar se o usuário é admin
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

    if (!userData?.is_admin) {
      return { success: false, error: "Você não tem permissão para visualizar histórias pendentes", data: [] }
    }

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return { success: false, error: "O sistema de histórias ainda não está disponível.", data: [] }
    }

    // Buscar histórias pendentes
    const { data, error } = await supabase
      .from("pet_stories")
      .select("*")
      .eq("status", "pendente")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar histórias pendentes:", error)
      return {
        success: true,
        data: [],
        message: "Erro ao buscar histórias pendentes. Tente novamente mais tarde.",
      }
    }

    // Se não houver histórias pendentes
    if (data.length === 0) {
      return {
        success: true,
        data: [],
        message: "Não há histórias pendentes para moderação no momento.",
      }
    }

    // Para cada história, buscar informações do usuário
    const storiesWithUsers = await Promise.all(
      data.map(async (story) => {
        // Buscar informações do usuário
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, avatar_url")
          .eq("id", story.user_id)
          .single()

        if (userError) {
          console.log(`Não foi possível buscar informações do usuário para a história ${story.id}:`, userError)
          return {
            ...story,
            user: {
              name: "Usuário",
              avatar_url: null,
            },
          }
        }

        return {
          ...story,
          user: userData,
        }
      }),
    )

    return { success: true, data: storiesWithUsers }
  } catch (error) {
    console.error("Erro ao buscar histórias pendentes:", error)
    return {
      success: true,
      data: [],
      message: "Ocorreu um erro ao buscar as histórias pendentes. Tente novamente mais tarde.",
    }
  }
}

// Obter histórias do usuário atual
export async function getUserPetStories() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Você precisa estar logado para visualizar suas histórias", data: [] }
    }

    // Verificar se a tabela pet_stories existe
    const tableExists = await checkTableExists(supabase, "pet_stories")

    if (!tableExists) {
      return { success: false, error: "O sistema de histórias ainda não está disponível.", data: [] }
    }

    console.log("Buscando histórias do usuário:", session.user.id)

    // Buscar histórias do usuário
    const { data, error } = await supabase
      .from("pet_stories")
      .select(`*`)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar histórias do usuário:", error)
      return { success: false, error: "Erro ao buscar suas histórias", data: [] }
    }

    console.log(`Encontradas ${data.length} histórias do usuário`)
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar histórias do usuário:", error)
    return { success: false, error: "Ocorreu um erro ao buscar suas histórias", data: [] }
  }
}
