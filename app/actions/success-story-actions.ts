"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createSuccessStory(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Você precisa estar logado para compartilhar uma história" }
    }

    const userId = user.id
    const title = formData.get("title") as string
    const story = formData.get("story") as string
    const petId = formData.get("petId") as string
    const petType = formData.get("petType") as string
    const imageUrl = (formData.get("imageUrl") as string) || null

    if (!title || !story || !petId || !petType) {
      return { success: false, error: "Todos os campos obrigatórios devem ser preenchidos" }
    }

    // Verificar se o pet existe e pertence ao usuário
    let tableName = ""
    switch (petType) {
      case "adoption":
        tableName = "pets"
        break
      case "lost":
        tableName = "pets_lost"
        break
      case "found":
        tableName = "pets_found"
        break
      default:
        return { success: false, error: "Tipo de pet inválido" }
    }

    const { data: pet, error: petError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", petId)
      .eq("user_id", userId)
      .single()

    if (petError || !pet) {
      console.error("Erro ao verificar pet:", petError)
      return { success: false, error: "Pet não encontrado ou não pertence ao usuário" }
    }

    // Inserir a história
    const { data, error } = await supabase
      .from("success_stories")
      .insert([
        {
          title,
          story,
          pet_id: petId,
          pet_type: petType,
          user_id: userId,
          image_url: imageUrl,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao criar história:", error)
      return { success: false, error: "Erro ao salvar a história. Tente novamente mais tarde." }
    }

    // Revalidar caminhos relevantes
    revalidatePath("/historias")
    revalidatePath(`/historias/${data[0].id}`)
    revalidatePath("/my-pets")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Erro ao criar história:", error)
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação" }
  }
}

export async function getSuccessStories(limit = 10) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("success_stories")
      .select(`*, user:users(name, avatar_url)`)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Erro ao buscar histórias:", error)
      return { success: false, error: "Erro ao buscar histórias" }
    }

    // Para cada história, buscar informações do pet
    const storiesWithPets = await Promise.all(
      data.map(async (story) => {
        let petData = null
        let tableName = ""

        switch (story.pet_type) {
          case "adoption":
            tableName = "pets"
            break
          case "lost":
            tableName = "pets_lost"
            break
          case "found":
            tableName = "pets_found"
            break
        }

        if (tableName) {
          const { data: pet, error: petError } = await supabase
            .from(tableName)
            .select("id, name, image_url")
            .eq("id", story.pet_id)
            .single()

          if (!petError && pet) {
            petData = pet
          }
        }

        return {
          ...story,
          pet: petData,
        }
      }),
    )

    return { success: true, data: storiesWithPets }
  } catch (error) {
    console.error("Erro ao buscar histórias:", error)
    return { success: false, error: "Ocorreu um erro ao buscar as histórias" }
  }
}

export async function getSuccessStoryById(id: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("success_stories")
      .select(`*, user:users(name, avatar_url)`)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao buscar história:", error)
      return { success: false, error: "História não encontrada" }
    }

    // Buscar informações do pet
    let petData = null
    let tableName = ""

    switch (data.pet_type) {
      case "adoption":
        tableName = "pets"
        break
      case "lost":
        tableName = "pets_lost"
        break
      case "found":
        tableName = "pets_found"
        break
    }

    if (tableName) {
      const { data: pet, error: petError } = await supabase
        .from(tableName)
        .select("id, name, image_url, species, breed")
        .eq("id", data.pet_id)
        .single()

      if (!petError && pet) {
        petData = pet
      }
    }

    return { success: true, data: { ...data, pet: petData } }
  } catch (error) {
    console.error("Erro ao buscar história:", error)
    return { success: false, error: "Ocorreu um erro ao buscar a história" }
  }
}

export async function likeSuccessStory(storyId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Você precisa estar logado para curtir uma história" }
    }

    // Buscar a história atual
    const { data: story, error: storyError } = await supabase
      .from("success_stories")
      .select("likes")
      .eq("id", storyId)
      .single()

    if (storyError) {
      console.error("Erro ao buscar história:", storyError)
      return { success: false, error: "História não encontrada" }
    }

    // Incrementar o contador de likes
    const currentLikes = story.likes || 0
    const newLikes = currentLikes + 1

    // Atualizar a história
    const { error } = await supabase.from("success_stories").update({ likes: newLikes }).eq("id", storyId)

    if (error) {
      console.error("Erro ao curtir história:", error)
      return { success: false, error: "Erro ao curtir a história" }
    }

    // Revalidar o caminho
    revalidatePath(`/historias/${storyId}`)
    revalidatePath("/historias")

    return { success: true, likes: newLikes }
  } catch (error) {
    console.error("Erro ao curtir história:", error)
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação" }
  }
}
