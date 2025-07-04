"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateSlug, generateUniqueSlug } from "@/lib/slug-utils"

async function checkForBlockedKeywords(content: string) {
  const supabase = createClient()
  try {
    const { data: setting } = await supabase
      .from("moderation_settings")
      .select("setting_value")
      .eq("setting_key", "enable_keyword_moderation")
      .single()

    if (!setting || !setting.setting_value?.enabled) {
      return { blocked: false }
    }

    const { data: keywords } = await supabase.from("moderation_keywords").select("keyword").eq("is_active", true)

    if (!keywords || keywords.length === 0) {
      return { blocked: false }
    }

    const lowerContent = content.toLowerCase()
    for (const kw of keywords) {
      if (lowerContent.includes(kw.keyword.toLowerCase())) {
        return { blocked: true, keyword: kw.keyword }
      }
    }

    return { blocked: false }
  } catch (error) {
    console.error("Erro ao verificar palavras-chave:", error)
    return { blocked: false }
  }
}

export async function createFoundPet(prevState: any, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Usuário não autenticado. Faça login para continuar." }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const found_location = formData.get("found_location") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string

  const contentToCheck = `${name} ${description} ${found_location}`
  const moderationResult = await checkForBlockedKeywords(contentToCheck)
  if (moderationResult.blocked) {
    return {
      success: false,
      error: `Conteúdo contém palavra proibida: "${moderationResult.keyword}". Por favor, revise.`,
    }
  }

  const petData = {
    name: formData.get("name") as string,
    species: formData.get("species") as string,
    species_other: formData.get("species_other") as string,
    breed: formData.get("breed") as string,
    size: formData.get("size") as string,
    size_other: formData.get("size_other") as string,
    gender: formData.get("gender") as string,
    gender_other: formData.get("gender_other") as string,
    color: formData.get("color") as string,
    color_other: formData.get("color_other") as string,
    description: formData.get("description") as string,
    found_date: formData.get("found_date") as string,
    found_location: formData.get("found_location") as string,
    current_location: formData.get("current_location") as string,
    contact: formData.get("contact") as string,
    main_image_url: formData.get("main_image_url") as string,
    state: formData.get("state") as string,
    city: formData.get("city") as string,
    is_special_needs: formData.get("is_special_needs") === "on",
    special_needs_description: formData.get("special_needs_description") as string,
    good_with_kids: formData.get("good_with_kids") === "on",
    good_with_cats: formData.get("good_with_cats") === "on",
    good_with_dogs: formData.get("good_with_dogs") === "on",
    is_vaccinated: formData.get("is_vaccinated") === "on",
    is_neutered: formData.get("is_neutered") === "on",
  }

  const slug = await generateUniqueSlug(
    generateSlug(petData.name || "pet-encontrado", petData.city || "", petData.state || ""),
    "pets",
  )

  const { data, error } = await supabase
    .from("pets")
    .insert({
      ...petData,
      slug,
      category: "found",
      status: "sheltered",
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao cadastrar pet encontrado:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/encontrados")
  revalidatePath("/dashboard/pets")
  revalidatePath(`/encontrados/${slug}`)

  return { success: true, message: "Pet encontrado cadastrado com sucesso!" }
}
