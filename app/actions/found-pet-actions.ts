"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generatePetSlug, generateUniqueSlug } from "@/lib/slug-utils"

export async function createFoundPet(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  try {
    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Extrair dados do formulário
    const name = formData.get("name") as string
    const species = formData.get("species") as string
    const species_other = species === "other" ? (formData.get("species_other") as string) : null
    const breed = formData.get("breed") as string
    const size = formData.get("size") as string
    const size_other = size === "other" ? (formData.get("size_other") as string) : null
    const gender = formData.get("gender") as string
    const gender_other = gender === "other" ? (formData.get("gender_other") as string) : null
    const color = formData.get("color") as string
    const color_other = color === "other" ? (formData.get("color_other") as string) : null
    const description = formData.get("description") as string
    const found_date = formData.get("found_date") as string
    const found_location = formData.get("found_location") as string
    const current_location = formData.get("current_location") as string
    const contact = formData.get("contact") as string
    const image_url = formData.get("image_url") as string
    const state = formData.get("state") as string
    const city = formData.get("city") as string
    const is_special_needs = formData.get("is_special_needs") === "on"
    const special_needs_description = is_special_needs ? (formData.get("special_needs_description") as string) : null
    const good_with_kids = formData.get("good_with_kids") === "on"
    const good_with_cats = formData.get("good_with_cats") === "on"
    const good_with_dogs = formData.get("good_with_dogs") === "on"
    const is_vaccinated = formData.get("is_vaccinated") === "on"
    const is_neutered = formData.get("is_neutered") === "on"

    // Inserir no banco de dados para obter o ID
    const { data: petData, error: insertError } = await supabase
      .from("pets")
      .insert([
        {
          name,
          species,
          species_other,
          breed,
          size,
          size_other,
          gender,
          gender_other,
          color,
          color_other,
          description,
          found_date,
          found_location,
          current_location,
          contact,
          main_image_url: image_url,
          user_id: user.id,
          state,
          city,
          is_special_needs,
          special_needs_description,
          good_with_kids,
          good_with_cats,
          good_with_dogs,
          is_vaccinated,
          is_neutered,
          status: "pending",
          category: "found", // Usar categoria "found"
        },
      ])
      .select()

    if (insertError) {
      console.error("Erro ao cadastrar pet encontrado:", insertError)
      return { success: false, error: insertError.message }
    }

    // Gerar slug com o ID obtido
    if (petData && petData.length > 0) {
      const pet = petData[0]
      const petType = "encontrado"

      // Gerar slug base
      const baseSlug = await generatePetSlug(name || "pet", petType, city || "", state || "", pet.id, "pets")

      // Garantir que o slug seja único
      const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", pet.id)

      // Atualizar o registro com o slug
      const { error: updateError } = await supabase.from("pets").update({ slug: uniqueSlug }).eq("id", pet.id)

      if (updateError) {
        console.error("Erro ao atualizar slug do pet encontrado:", updateError)
      }
    }

    // Revalidar caminhos
    revalidatePath("/encontrados")
    revalidatePath("/")

    return { success: true, data: petData }
  } catch (error) {
    console.error("Erro não tratado:", error)
    return { success: false, error: "Ocorreu um erro ao cadastrar o pet encontrado" }
  }
}
