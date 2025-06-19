"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateEntitySlug } from "@/lib/slug-utils"

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
      return { blocked: false }
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
    return { blocked: false }
  }
}

export async function createFoundPet(formData: FormData) {
  const supabase = createServerComponentClient({ cookies })

  try {
    console.log("Iniciando cadastro de pet encontrado")

    // Obter a sessão do usuário
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("Sessão não encontrada")
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id
    console.log("ID do usuário da sessão:", userId)

    // Extrair dados do formulário
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const species = formData.get("species") as string
    const breed = formData.get("breed") as string
    const size = formData.get("size") as string
    const gender = formData.get("gender") as string
    const color = formData.get("color") as string
    const found_date = formData.get("found_date") as string
    const found_location = formData.get("found_location") as string
    const current_location = formData.get("current_location") as string
    const contact = formData.get("contact") as string
    const main_image_url = formData.get("main_image_url") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string

    // Extrair e parsear campos booleanos e de texto relacionados a necessidades especiais/compatibilidade
    const is_special_needs = formData.get("is_special_needs") === "true"
    const special_needs_description = formData.get("special_needs_description") as string
    const good_with_kids = formData.get("good_with_kids") === "true"
    const good_with_cats = formData.get("good_with_cats") === "true"
    const good_with_dogs = formData.get("good_with_dogs") === "true"
    const is_vaccinated = formData.get("is_vaccinated") === "true"
    const is_neutered = formData.get("is_neutered") === "true"

    // Verificar conteúdo contra palavras-chave bloqueadas
    const contentToCheck = `${name || ""} ${description || ""} ${found_location || ""} ${current_location || ""}`
    const { blocked, keyword } = await checkContentForBlockedKeywords(contentToCheck, supabase)

    let status = "approved"
    let rejection_reason = null

    if (blocked) {
      console.log(`Conteúdo bloqueado devido à palavra-chave: "${keyword}"`)
      status = "rejected"
      rejection_reason = `Rejeitado automaticamente: palavra-chave proibida "${keyword}"`
    }

    // Gerar slug para o pet
    const baseSlug = await generateEntitySlug(
      "pet",
      {
        name: name || "pet-encontrado",
        type: "found",
        city: city || "",
        state: state || "",
        table: "pets",
      },
      undefined,
    )

    // Preparar dados para inserção
    const petDataToInsert = {
      name,
      description,
      species,
      breed,
      size,
      gender,
      color,
      found_date,
      found_location,
      current_location,
      contact,
      main_image_url,
      city,
      state,
      user_id: userId,
      category: "found",
      status,
      rejection_reason,
      created_at: new Date().toISOString(),
      slug: baseSlug,
      // Adicionando os campos que estavam faltando
      is_special_needs,
      special_needs_description: is_special_needs ? special_needs_description : null, // Salva apenas se is_special_needs for true
      good_with_kids,
      good_with_cats,
      good_with_dogs,
      is_vaccinated,
      is_neutered,
    }

    console.log("Dados preparados para inserção:", JSON.stringify(petDataToInsert, null, 2))

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
      const finalSlug = await generateEntitySlug(
        "pet",
        {
          name: name || "pet-encontrado",
          type: "found",
          city: city || "",
          state: state || "",
          table: "pets",
        },
        petId,
      )

      const { error: slugUpdateError } = await supabase.from("pets").update({ slug: finalSlug }).eq("id", petId)

      if (slugUpdateError) {
        console.error("Erro ao atualizar slug do pet encontrado:", slugUpdateError)
      } else {
        console.log("Slug do pet encontrado atualizado com sucesso:", finalSlug)
      }
    }

    // Revalidar páginas
    revalidatePath("/encontrados")
    revalidatePath("/my-pets")
    revalidatePath("/admin/moderation")

    if (blocked) {
      return {
        success: true,
        data,
        warning: `Pet cadastrado mas rejeitado automaticamente devido à palavra-chave proibida: "${keyword}". Entre em contato com o suporte se isso foi um erro.`,
      }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Erro ao cadastrar pet encontrado:", error)
    return { success: false, error: `Erro ao processar solicitação: ${error.message}` }
  }
}
