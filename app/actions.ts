"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

// Import the slug utilities
import { generateEntitySlug, generateUniqueSlug } from "@/lib/slug-utils"

// Função para garantir que o usuário existe na tabela users
export async function ensureUserExists(userId: string, userData: any) {
  const supabase = createServerComponentClient({ cookies })

  // Verificar se o usuário já existe
  const { data: existingUser, error: checkError } = await supabase.from("users").select("*").eq("id", userId).single()

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Erro ao verificar usuário:", checkError)
    return false
  }

  // Se o usuário não existir, criar
  if (!existingUser) {
    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      email: userData.email,
      name: userData.name || userData.email,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Erro ao criar usuário:", insertError)
      return false
    }
  }

  return true
}

// Função para verificar conteúdo contra palavras-chave bloqueadas
async function checkContentForBlockedKeywords(
  content: string,
  supabaseClient: ReturnType<typeof createServerComponentClient>,
): Promise<{ blocked: boolean; keyword?: string }> {
  try {
    console.log("Verificando conteúdo para palavras-chave bloqueadas:", content)

    // Verificar se a moderação por palavras-chave está habilitada
    const { data: setting, error: settingError } = await supabaseClient
      .from("moderation_settings")
      .select("setting_value")
      .eq("setting_key", "enable_keyword_moderation")
      .single()

    if (settingError) {
      console.error("Erro ao buscar configuração de moderação:", settingError)
      return { blocked: false }
    }

    console.log("Configuração de moderação:", setting)

    // Se a configuração não existir ou não estiver habilitada, não bloquear
    if (!setting || !setting.setting_value?.enabled) {
      console.log("Moderação por palavras-chave não está habilitada")
      return { blocked: false }
    }

    // Buscar palavras-chave ativas
    const { data: keywords, error: keywordsError } = await supabaseClient
      .from("moderation_keywords")
      .select("keyword")
      .eq("is_active", true)

    if (keywordsError) {
      console.error("Erro ao buscar palavras-chave de moderação:", keywordsError)
      return { blocked: false } // Não bloquear se houver erro na busca das palavras-chave
    }

    console.log("Palavras-chave encontradas:", keywords)

    // Se não houver palavras-chave, não bloquear
    if (!keywords || keywords.length === 0) {
      console.log("Nenhuma palavra-chave ativa encontrada")
      return { blocked: false }
    }

    // Converter conteúdo para minúsculas para comparação case-insensitive
    const lowerCaseContent = content.toLowerCase()

    // Verificar cada palavra-chave
    for (const kw of keywords) {
      console.log(`Verificando palavra-chave: "${kw.keyword}"`)
      if (lowerCaseContent.includes(kw.keyword.toLowerCase())) {
        console.log(`Conteúdo bloqueado devido à palavra-chave: "${kw.keyword}"`)
        return { blocked: true, keyword: kw.keyword }
      }
    }

    console.log("Nenhuma palavra-chave bloqueada encontrada no conteúdo")
    return { blocked: false }
  } catch (error) {
    console.error("Erro ao verificar palavras-chave bloqueadas:", error)
    return { blocked: false } // Em caso de erro, não bloquear
  }
}

// Função para criar uma ONG
export async function createOng(ongData: any) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obter a sessão do usuário
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Usar o ID do usuário da sessão
    const userId = session.user.id

    // Inserir ONG para obter o ID
    const { data: ongData, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          ...ongData,
          id: userId,
          type: "ong",
          is_verified: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (insertError) {
      console.error("Erro ao cadastrar ONG:", insertError)
      return { success: false, error: `Erro ao cadastrar ONG: ${insertError.message}` }
    }

    // Gerar slug com o ID obtido
    if (ongData && ongData.length > 0) {
      const ong = ongData[0]

      // Gerar slug base
      const baseSlug = await generateEntitySlug(ong.name || "ong", "ong", ong.city || "", ong.id)

      // Garantir que o slug seja único
      const uniqueSlug = await generateUniqueSlug(baseSlug, "ongs", ong.id)

      // Atualizar o registro com o slug
      const { error: updateError } = await supabase.from("ongs").update({ slug: uniqueSlug }).eq("id", ong.id)

      if (updateError) {
        console.error("Erro ao atualizar slug da ONG:", updateError)
      }
    }

    // Revalidar páginas
    revalidatePath("/ongs")
    revalidatePath("/ongs/dashboard")

    return { success: true, ong: ongData }
  } catch (error: any) {
    console.error("Erro ao cadastrar ONG:", error)
    return { success: false, error: `Erro ao processar solicitação: ${error.message}` }
  }
}

// Função para atualizar uma ONG
export async function updateOng(ongId: string, ongData: any) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obter a sessão do usuário
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Verificar se o usuário é o dono da ONG
    const { data: ong, error: ongError } = await supabase
      .from("ongs")
      .select("*")
      .eq("id", ongId)
      .eq("user_id", session.user.id)
      .single()

    if (ongError || !ong) {
      return { success: false, error: "ONG não encontrada ou você não tem permissão para editá-la" }
    }

    // Verificar se precisa atualizar o slug
    let slug = ong.slug
    if (ongData.name !== ong.name || ongData.city !== ong.city) {
      // Gerar slug base
      const baseSlug = await generateEntitySlug(ongData.name || "ong", "ong", ongData.city || "", ongId)

      // Garantir que o slug seja único
      slug = await generateUniqueSlug(baseSlug, "ongs", ongId)
    }

    // Atualizar ONG
    const { data: updatedOng, error: updateError } = await supabase
      .from("ongs")
      .update({
        ...ongData,
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ongId)
      .select()

    if (updateError) {
      console.error("Erro ao atualizar ONG:", updateError)
      return { success: false, error: `Erro ao atualizar ONG: ${updateError.message}` }
    }

    // Revalidar páginas
    revalidatePath("/ongs")
    revalidatePath(`/ongs/${ongId}`)
    revalidatePath("/ongs/dashboard")

    return { success: true, ong: updatedOng }
  } catch (error: any) {
    console.error("Erro ao atualizar ONG:", error)
    return { success: false, error: `Erro ao processar solicitação: ${error.message}` }
  }
}

// Função para cadastrar um pet para adoção
export async function createAdoptionPet(petData: any) {
  const supabase = createServerComponentClient({ cookies })

  try {
    console.log("Iniciando cadastro de pet para adoção:", petData)

    // Obter a sessão do usuário
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("Usuário não autenticado")
      return { success: false, error: "Usuário não autenticado" }
    }

    // Usar o ID do usuário da sessão
    const userId = session.user.id
    console.log("Using user ID from session:", userId)

    // Verificar se o usuário é uma ONG
    const { data: ongData, error: ongError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .eq("type", "ong")
      .single()

    if (ongError && ongError.code !== "PGRST116") {
      console.error("Erro ao verificar ONG:", ongError)
      return { success: false, error: "Erro ao verificar ONG" }
    }

    // --- Nova verificação de palavras-chave ---
    const contentToCheck = `${petData.name || ""} ${petData.description || ""}`
    const { blocked, keyword } = await checkContentForBlockedKeywords(contentToCheck, supabase)
    if (blocked) {
      console.log(`Conteúdo bloqueado devido à palavra-chave: "${keyword}"`)
      return { success: false, error: `Conteúdo bloqueado devido à palavra-chave proibida: "${keyword}"` }
    }
    // --- Fim da nova verificação ---

    // Gerar slug para o pet
    const baseSlug = generateEntitySlug(
      petData.name || "pet",
      petData.species || "unknown",
      petData.city || "",
      undefined,
    )

    // Preparar dados para inserção
    const petDataToInsert = {
      ...petData,
      user_id: userId,
      category: "adoption", // Add category field
      status: ongData ? "approved" : "pending", // Se for ONG, aprova automaticamente
      created_at: new Date().toISOString(),
      slug: baseSlug,
    }

    console.log("Dados preparados para inserção:", petDataToInsert)

    // Inserir pet
    const { data: pet, error: insertError } = await supabase.from("pets").insert([petDataToInsert]).select()

    if (insertError) {
      console.error("Erro ao cadastrar pet:", insertError)
      return { success: false, error: `Erro ao cadastrar pet: ${insertError.message}` }
    }

    console.log("Pet cadastrado com sucesso:", pet)

    // Atualizar o slug com o ID real
    if (pet && pet.length > 0) {
      const petId = pet[0].id
      const finalSlug = generateEntitySlug(
        petData.name || "pet",
        petData.species || "unknown",
        petData.city || "",
        petId,
      )

      const { error: slugUpdateError } = await supabase.from("pets").update({ slug: finalSlug }).eq("id", petId)

      if (slugUpdateError) {
        console.error("Erro ao atualizar slug do pet:", slugUpdateError)
      } else {
        console.log("Slug do pet atualizado com sucesso:", finalSlug)
      }
    }

    // Revalidar página de adoção
    revalidatePath("/adocao")
    revalidatePath("/dashboard/pets")

    return { success: true, pet }
  } catch (error: any) {
    console.error("Erro ao cadastrar pet:", error)
    return { success: false, error: `Erro ao processar solicitação: ${error.message}` }
  }
}

// Função para criar um pet perdido
export async function createLostPet(petData: any) {
  const supabase = createServerComponentClient({ cookies })

  try {
    console.log("Iniciando cadastro de pet perdido")

    // Obter a sessão do usuário
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("Sessão não encontrada")
      return { success: false, error: "Usuário não autenticado" }
    }

    // Usar o ID do usuário da sessão
    const userId = session.user.id
    console.log("ID do usuário da sessão:", userId)

    // --- Nova verificação de palavras-chave ---
    const contentToCheck = `${petData.name || ""} ${petData.description || ""}`
    const { blocked, keyword } = await checkContentForBlockedKeywords(contentToCheck, supabase)
    if (blocked) {
      console.log(`Conteúdo bloqueado devido à palavra-chave: "${keyword}"`)
      return { success: false, error: `Conteúdo bloqueado devido à palavra-chave proibida: "${keyword}"` }
    }
    // --- Fim da nova verificação ---

    // Gerar slug para o pet
    const baseSlug = generateEntitySlug(
      petData.name || "pet-perdido",
      petData.species || "unknown",
      petData.city || "",
      undefined,
    )

    // Preparar dados para inserção
    const petDataToInsert = {
      ...petData,
      user_id: userId,
      category: "lost", // Add category field
      status: "pending",
      created_at: new Date().toISOString(),
      slug: baseSlug,
    }

    console.log("Dados preparados para inserção:", JSON.stringify(petDataToInsert, null, 2))

    // Inserir pet na tabela unificada
    const { data, error } = await supabase.from("pets").insert([petDataToInsert]).select()

    if (error) {
      console.error("Erro ao cadastrar pet perdido:", error)
      return { success: false, error: `Erro ao cadastrar pet perdido: ${error.message}` }
    }

    console.log("Pet perdido cadastrado com sucesso:", data)

    // Atualizar o slug com o ID real
    if (data && data.length > 0) {
      const petId = data[0].id
      const finalSlug = generateEntitySlug(
        petData.name || "pet-perdido",
        petData.species || "unknown",
        petData.city || "",
        petId,
      )

      const { error: slugUpdateError } = await supabase.from("pets").update({ slug: finalSlug }).eq("id", petId)

      if (slugUpdateError) {
        console.error("Erro ao atualizar slug do pet perdido:", slugUpdateError)
      } else {
        console.log("Slug do pet perdido atualizado com sucesso:", finalSlug)
      }
    }

    // Revalidar página de pets perdidos
    revalidatePath("/perdidos")
    revalidatePath("/dashboard/pets")

    return { success: true, data }
  } catch (error: any) {
    console.error("Erro ao cadastrar pet perdido:", error)
    return { success: false, error: `Erro ao processar solicitação: ${error.message}` }
  }
}

// Função para criar um pet encontrado
export async function createFoundPet(petData: any) {
  const supabase = createServerComponentClient({ cookies })

  try {
    console.log("Iniciando cadastro de pet encontrado:", petData)

    // Obter a sessão do usuário
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("Usuário não autenticado")
      return { success: false, error: "Usuário não autenticado" }
    }

    // Usar o ID do usuário da sessão
    const userId = session.user.id
    console.log("Using user ID from session:", userId)

    // --- Nova verificação de palavras-chave ---
    const contentToCheck = `${petData.name || ""} ${petData.description || ""}`
    const { blocked, keyword } = await checkContentForBlockedKeywords(contentToCheck, supabase)
    if (blocked) {
      console.log(`Conteúdo bloqueado devido à palavra-chave: "${keyword}"`)
      return { success: false, error: `Conteúdo bloqueado devido à palavra-chave proibida: "${keyword}"` }
    }
    // --- Fim da nova verificação ---

    // Gerar slug para o pet
    const baseSlug = generateEntitySlug(
      petData.name || "pet-encontrado",
      petData.species || "unknown",
      petData.city || "",
      undefined,
    )

    // Preparar dados para inserção
    const petDataToInsert = {
      ...petData,
      user_id: userId,
      category: "found", // Add category field
      status: "pending",
      created_at: new Date().toISOString(),
      slug: baseSlug,
    }

    console.log("Dados preparados para inserção:", petDataToInsert)

    // Inserir pet na tabela unificada
    const { data, error } = await supabase.from("pets").insert([petDataToInsert]).select()

    if (error) {
      console.error("Erro ao cadastrar pet encontrado:", error)
      return { success: false, error: `Erro ao cadastrar pet encontrado: ${error.message}` }
    }

    console.log("Pet encontrado cadastrado com sucesso:", data)

    // Atualizar o slug com o ID real
    if (data && data.length > 0) {
      const petId = data[0].id
      const finalSlug = generateEntitySlug(
        petData.name || "pet-encontrado",
        petData.species || "unknown",
        petData.city || "",
        petId,
      )

      const { error: slugUpdateError } = await supabase.from("pets").update({ slug: finalSlug }).eq("id", petId)

      if (slugUpdateError) {
        console.error("Erro ao atualizar slug do pet encontrado:", slugUpdateError)
      } else {
        console.log("Slug do pet encontrado atualizado com sucesso:", finalSlug)
      }
    }

    // Revalidar página de pets encontrados
    revalidatePath("/encontrados")
    revalidatePath("/dashboard/pets")

    return { success: true, data }
  } catch (error: any) {
    console.error("Erro ao cadastrar pet encontrado:", error)
    return { success: false, error: `Erro ao processar solicitação: ${error.message}` }
  }
}

export type EventFormData = {
  name: string
  description: string
  date: string
  end_date?: string
  location: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  image_url: string
  ong_id?: string
}

// Função para criar um evento
export async function createEvent(eventData: EventFormData) {
  const supabase = createServerComponentClient({ cookies })

  try {
    console.log("Iniciando cadastro de evento:", eventData)

    // Obter a sessão do usuário
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("Usuário não autenticado")
      return { success: false, error: "Usuário não autenticado" }
    }

    // Verificar campos obrigatórios
    const requiredFields = ["name", "description", "date", "location", "image_url"]
    const missingFields = requiredFields.filter((field) => !eventData[field as keyof EventFormData])

    if (missingFields.length > 0) {
      console.log("Campos obrigatórios ausentes:", missingFields)
      return { success: false, error: `Campos obrigatórios ausentes: ${missingFields.join(", ")}` }
    }

    // --- Nova verificação de palavras-chave ---
    const contentToCheck = `${eventData.name || ""} ${eventData.description || ""}`
    const { blocked, keyword } = await checkContentForBlockedKeywords(contentToCheck, supabase)
    if (blocked) {
      console.log(`Conteúdo bloqueado devido à palavra-chave: "${keyword}"`)
      return { success: false, error: `Conteúdo bloqueado devido à palavra-chave proibida: "${keyword}"` }
    }
    // --- Fim da nova verificação ---

    // Gerar slug para o evento
    const baseSlug = generateEntitySlug(
      eventData.name || "evento",
      "event",
      eventData.city || "",
      undefined, // Ainda não temos o ID
    )

    // Inserir evento
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          ...eventData,
          user_id: session.user.id,
          status: "approved", // Eventos são publicados automaticamente
          created_at: new Date().toISOString(),
          slug: baseSlug,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao cadastrar evento:", error)
      return { success: false, error: `Erro ao cadastrar evento: ${error.message}` }
    }

    console.log("Evento cadastrado com sucesso:", data)

    // Atualizar o slug com o ID real
    if (data && data.length > 0) {
      const eventId = data[0].id
      const finalSlug = generateEntitySlug(eventData.name || "evento", "event", eventData.city || "", eventId)

      const { error: slugUpdateError } = await supabase.from("events").update({ slug: finalSlug }).eq("id", eventId)

      if (slugUpdateError) {
        console.error("Erro ao atualizar slug do evento:", slugUpdateError)
        // Não é crítico, já temos um slug base
      } else {
        console.log("Slug do evento atualizado com sucesso:", finalSlug)
      }
    }

    // Revalidar página de eventos
    revalidatePath("/eventos")

    return { success: true, data }
  } catch (error: any) {
    console.error("Erro ao cadastrar evento:", error)
    return { success: false, error: `Erro ao processar solicitação: ${error.message}` }
  }
}

// Função para verificar uma ONG
export async function verifyOng(ongId: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar se o usuário é um administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (userError || !user?.is_admin) {
      return { success: false, error: "Usuário não autorizado" }
    }

    // Atualizar ONG
    const { error: updateError } = await supabase.from("ongs").update({ is_verified: true }).eq("id", ongId)

    if (updateError) {
      console.error("Erro ao verificar ONG:", updateError)
      return { success: false, error: "Erro ao verificar ONG" }
    }

    // Revalidar páginas
    revalidatePath("/ongs")
    revalidatePath(`/ongs/${ongId}`)
    revalidatePath("/admin/ongs")
    revalidatePath(`/admin/ongs/${ongId}`)

    return { success: true }
  } catch (error) {
    console.error("Erro ao verificar ONG:", error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}

// Função para excluir uma ONG
export async function deleteOng(ongId: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar se o usuário é um administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (userError || !user?.is_admin) {
      return { success: false, error: "Usuário não autorizado" }
    }

    console.log(`Iniciando exclusão da ONG com ID: ${ongId}`)

    // Primeiro, excluir todos os pets associados à ONG
    const { error: petsError } = await supabase.from("pets").delete().eq("ong_id", ongId)

    if (petsError) {
      console.error("Erro ao excluir pets da ONG:", petsError)
      return { success: false, error: "Erro ao excluir pets da ONG" }
    }

    console.log("Pets associados à ONG excluídos com sucesso")

    // Excluir todos os eventos associados à ONG
    const { error: eventsError } = await supabase.from("events").delete().eq("ong_id", ongId)

    if (eventsError) {
      console.error("Erro ao excluir eventos da ONG:", eventsError)
      return { success: false, error: "Erro ao excluir eventos da ONG" }
    }

    console.log("Eventos associados à ONG excluídos com sucesso")

    // Finalmente, excluir a ONG
    const { error: deleteError } = await supabase.from("ongs").delete().eq("id", ongId)

    if (deleteError) {
      console.error("Erro ao excluir ONG:", deleteError)
      return { success: false, error: "Erro ao excluir ONG" }
    }

    console.log("ONG excluída com sucesso")

    // Revalidar páginas
    revalidatePath("/ongs")
    revalidatePath("/admin/ongs")

    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir ONG:", error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}

// Update the approveItem function
export async function approveItem(itemId: string, type: "adoption" | "event" | "lost" | "found") {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar se o usuário é um administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (userError || !user?.is_admin) {
      return { success: false, error: "Usuário não autorizado" }
    }

    // Determinar a tabela com base no tipo
    let table = ""
    let revalidationPaths = []

    switch (type) {
      case "adoption":
      case "lost":
      case "found":
        table = "pets"
        revalidationPaths = ["/adocao", "/perdidos", "/encontrados", "/admin/pets", "/admin/moderation"]
        break
      case "event":
        table = "events"
        revalidationPaths = ["/eventos", "/admin/events", "/admin/moderation"]
        break
      default:
        return { success: false, error: "Tipo de item inválido" }
    }

    console.log(`Aprovando item do tipo ${type} com ID ${itemId} na tabela ${table}`)

    // Atualizar item
    const { error: updateError } = await supabase.from(table).update({ status: "approved" }).eq("id", itemId)

    if (updateError) {
      console.error(`Erro ao aprovar ${type}:`, updateError)
      return { success: false, error: `Erro ao aprovar ${type}` }
    }

    // Revalidar páginas
    for (const path of revalidationPaths) {
      console.log(`Revalidando caminho: ${path}`)
      revalidatePath(path)
    }

    // Revalidar a página inicial também
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error(`Erro ao aprovar ${type}:`, error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}

// Update the rejectItem function
export async function rejectItem(itemId: string, type: "adoption" | "event" | "lost" | "found") {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar se o usuário é um administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (userError || !user?.is_admin) {
      return { success: false, error: "Usuário não autorizado" }
    }

    // Determinar a tabela com base no tipo
    let table = ""
    switch (type) {
      case "adoption":
      case "lost":
      case "found":
        table = "pets"
        break
      case "event":
        table = "events"
        break
      default:
        return { success: false, error: "Tipo de item inválido" }
    }

    // Atualizar item
    const { error: updateError } = await supabase.from(table).update({ status: "rejected" }).eq("id", itemId)

    if (updateError) {
      console.error(`Erro ao rejeitar ${type}:`, updateError)
      return { success: false, error: `Erro ao rejeitar ${type}` }
    }

    // Revalidar páginas
    revalidatePath("/adocao")
    revalidatePath("/perdidos")
    revalidatePath("/encontrados")
    revalidatePath("/eventos")
    revalidatePath("/admin/pets")
    revalidatePath("/admin/events")
    revalidatePath("/admin/moderation")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error(`Erro ao rejeitar ${type}:`, error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}

export async function submitContactForm(formData: FormData) {
  "use server"

  try {
    // Extrair dados do formulário
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // Validar dados
    if (!name || !email || !subject || !message) {
      return { success: false, message: "Todos os campos são obrigatórios." }
    }

    // Aqui você pode adicionar código para enviar o email ou salvar no banco de dados
    // Por enquanto, vamos apenas simular um sucesso

    // Simular um pequeno atraso para dar feedback ao usuário
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true, message: "Mensagem enviada com sucesso! Entraremos em contato em breve." }
  } catch (error) {
    console.error("Erro ao enviar mensagem de contato:", error)
    return { success: false, message: "Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente." }
  }
}

// Modify createPet function to generate and save a slug
export async function createPet(formData: FormData) {
  try {
    const supabase = createServerActionClient({ cookies })
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Não autorizado. Faça login para cadastrar um pet." }
    }

    // Extract form data (existing code)
    const name = formData.get("name") as string
    const species = formData.get("species") as string
    const breed = formData.get("breed") as string
    const age = formData.get("age") as string
    const size = formData.get("size") as string
    const gender = formData.get("gender") as string
    const color = formData.get("color") as string
    const description = formData.get("description") as string
    const temperament = formData.get("temperament") as string
    const energy_level = formData.get("energy_level") as string
    const shedding = formData.get("shedding") as string
    const trainability = formData.get("trainability") as string
    const sociability = formData.get("sociability") as string
    const is_vaccinated = formData.get("is_vaccinated") === "true"
    const is_neutered = formData.get("is_neutered") === "true"
    const is_special_needs = formData.get("is_special_needs") === "true"
    const good_with_kids = formData.get("good_with_kids") === "true"
    const good_with_cats = formData.get("good_with_cats") === "true"
    const good_with_dogs = formData.get("good_with_dogs") === "true"
    const adoption_requirements = formData.get("adoption_requirements") as string
    const image_url = formData.get("image_url") as string
    const additional_images = formData.get("additional_images") as string
    const location = formData.get("location") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const ong_id = formData.get("ong_id") as string

    // --- Nova verificação de palavras-chave ---
    const contentToCheck = `${name || ""} ${description || ""}`
    const { blocked, keyword } = await checkContentForBlockedKeywords(contentToCheck, supabase)
    if (blocked) {
      console.log(`Conteúdo bloqueado devido à palavra-chave: "${keyword}"`)
      return { error: `Conteúdo bloqueado devido à palavra-chave proibida: "${keyword}"` }
    }
    // --- Fim da nova verificação ---

    // Generate a slug for the pet
    const baseSlug = generateEntitySlug(
      name,
      species,
      city,
      undefined, // We don't have an ID yet
    )

    // Insert data
    const { data, error } = await supabase
      .from("pets")
      .insert([
        {
          name,
          species,
          breed,
          age,
          size,
          gender,
          color,
          description,
          temperament,
          energy_level,
          shedding,
          trainability,
          sociability,
          is_vaccinated,
          is_neutered,
          is_special_needs,
          good_with_kids,
          good_with_cats,
          good_with_dogs,
          adoption_requirements,
          image_url,
          additional_images,
          status: "pending",
          user_id: session.user.id,
          location,
          city,
          state,
          ong_id,
          slug: baseSlug, // Add the slug
        },
      ])
      .select()

    if (error) {
      console.error("Error creating pet:", error)
      return { error: "Erro ao cadastrar pet: " + error.message }
    }

    // Now that we have the ID, update the slug to include it
    if (data && data.length > 0) {
      const petId = data[0].id
      const finalSlug = generateEntitySlug(name, species, city, petId)

      const { error: slugUpdateError } = await supabase.from("pets").update({ slug: finalSlug }).eq("id", petId)

      if (slugUpdateError) {
        console.error("Error updating pet slug:", slugUpdateError)
        // Not critical, we already have a base slug
      }
    }

    // Revalidate the adoption page
    revalidatePath("/adocao")

    return { success: true }
  } catch (error) {
    console.error("Error in createPet:", error)
    return { error: "Erro interno ao cadastrar pet." }
  }
}
