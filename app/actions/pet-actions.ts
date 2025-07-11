"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateSlug, generateUniqueSlug } from "@/lib/slug-utils"
import type { PetFormUI } from "@/lib/types"

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

// Função para cadastrar um pet perdido
export async function createLostPet(formData: FormData) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Extract form data
    const name = formData.get("name") as string
    const species = formData.get("species") as string
    const breed = formData.get("breed") as string
    const color = formData.get("color") as string
    const size = formData.get("size") as string
    const gender = formData.get("gender") as string
    const age = formData.get("age") as string
    const description = formData.get("description") as string
    const lastSeenLocation = formData.get("last_seen_location") as string
    const lastSeenDate = formData.get("last_seen_date") as string
    const contactPhone = formData.get("contact_phone") as string
    const contactEmail = formData.get("contact_email") as string
    const reward = formData.get("reward") as string
    const specialNeeds = formData.get("special_needs") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const imagesJson = formData.get("images") as string

    // Validate required fields
    if (!name || !species || !breed || !color || !size || !gender || !description || !city || !state) {
      return { success: false, error: "Campos obrigatórios não preenchidos" }
    }

    // Parse images
    let images: string[] = []
    if (imagesJson) {
      try {
        images = JSON.parse(imagesJson)
      } catch (e) {
        console.error("Error parsing images:", e)
      }
    }

    // Generate slug
    const slug = generateSlug(name, city, state)

    // Insert into database
    const { data, error } = await supabase
      .from("pets")
      .insert({
        user_id: user.id,
        name,
        species,
        breed,
        color,
        size,
        gender,
        age: age || null,
        description,
        last_seen_location: lastSeenLocation,
        last_seen_date: lastSeenDate,
        contact: contactPhone,
        contact_email: contactEmail || null,
        reward: reward || null,
        special_needs_description: specialNeeds || null,
        city,
        state,
        main_image_url: images[0] || null,
        image_urls: images,
        slug,
        status: "missing",
        category: "lost",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: "Erro ao salvar no banco de dados" }
    }

    // Revalidate relevant paths
    revalidatePath("/perdidos")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/pets")

    return { success: true, data }
  } catch (error) {
    console.error("Server action error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Função para cadastrar um pet encontrado
export async function createFoundPet(formData: FormData) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Extract form data
    const species = formData.get("species") as string
    const breed = formData.get("breed") as string
    const color = formData.get("color") as string
    const size = formData.get("size") as string
    const gender = formData.get("gender") as string
    const age = formData.get("age") as string
    const description = formData.get("description") as string
    const foundLocation = formData.get("found_location") as string
    const foundDate = formData.get("found_date") as string
    const contactPhone = formData.get("contact_phone") as string
    const contactEmail = formData.get("contact_email") as string
    const temporaryCare = formData.get("temporary_care") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const imagesJson = formData.get("images") as string

    // Validate required fields
    if (!species || !breed || !color || !size || !gender || !description || !city || !state) {
      return { success: false, error: "Campos obrigatórios não preenchidos" }
    }

    // Parse images
    let images: string[] = []
    if (imagesJson) {
      try {
        images = JSON.parse(imagesJson)
      } catch (e) {
        console.error("Error parsing images:", e)
      }
    }

    // Generate slug for found pets
    const slug = generateSlug(`${species}-encontrado`, city, state)

    // Insert into database
    const { data, error } = await supabase
      .from("pets")
      .insert({
        user_id: user.id,
        name: null, // Found pets may not have names
        species,
        breed,
        color,
        size,
        gender,
        age: age || null,
        description,
        found_location: foundLocation,
        found_date: foundDate,
        contact: contactPhone,
        contact_email: contactEmail || null,
        temporary_care: temporaryCare || null,
        city,
        state,
        main_image_url: images[0] || null,
        image_urls: images,
        slug,
        status: "found",
        category: "found",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: "Erro ao salvar no banco de dados" }
    }

    // Revalidate relevant paths
    revalidatePath("/encontrados")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/pets")

    return { success: true, data }
  } catch (error) {
    console.error("Server action error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Função para cadastrar um pet para adoção - VERSÃO CLIENT-SIDE
export async function createAdoptionPetClientSide(petData: PetFormUI, userId: string) {
  console.log("createAdoptionPetClientSide chamado com:", petData, "userId:", userId)

  try {
    // Usar createClient com cookies para manter a sessão
    const supabase = createClient()
    console.log("Cliente Supabase criado")

    // Verificar se é uma edição ou criação
    const isEditing = petData.is_editing === true

    // Se for edição, atualizar o pet existente
    if (isEditing && petData.id) {
      const updateData = { ...petData }
      delete updateData.is_editing
      delete updateData.slug // Não atualizar o slug se já existir

      const { error: updateError } = await supabase
        .from("pets")
        .update(updateData)
        .eq("id", petData.id)
        .eq("user_id", userId)

      if (updateError) {
        console.error("Erro ao atualizar pet:", updateError)
        return { error: `Erro ao atualizar pet: ${updateError.message}` }
      }

      // Revalidar as páginas relacionadas
      revalidatePath("/adocao")
      revalidatePath(`/adocao/${petData.id}`)
      revalidatePath("/ongs/dashboard")

      return { success: true }
    }

    // Caso contrário, criar um novo pet
    const newPet = {
      name: petData.name,
      species: petData.species,
      species_other: petData.species_other,
      breed: petData.breed,
      age: petData.age,
      size: petData.size,
      size_other: petData.size_other,
      gender: petData.gender,
      gender_other: petData.gender_other,
      color: petData.color,
      color_other: petData.color_other,
      description: petData.description,
      main_image_url: petData.image_urls?.[0] || null,
      image_urls: petData.image_urls || [],
      is_vaccinated: petData.is_vaccinated || false,
      is_neutered: petData.is_castrated || false,
      is_special_needs: petData.is_special_needs || false,
      special_needs_description: petData.special_needs_description || null,
      temperament: petData.temperament,
      energy_level: petData.energy_level,
      good_with_kids: petData.good_with_kids || false,
      good_with_cats: petData.good_with_cats || false,
      good_with_dogs: petData.good_with_dogs || false,
      city: petData.city,
      state: petData.state,
      contact: petData.whatsapp_contact,
      user_id: userId,
      ong_id: petData.ong_id,
      status: "available",
      category: "adoption",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Inserindo novo pet:", newPet)

    const { data: insertedPet, error: insertError } = await supabase.from("pets").insert(newPet).select().single()

    console.log("Resultado da inserção:", insertedPet ? "Sucesso" : "Falha", insertError || "")

    if (insertError) {
      console.error("Erro ao cadastrar pet:", insertError)
      return { error: `Erro ao cadastrar pet: ${insertError.message}` }
    }

    // Gerar slug com o ID obtido
    if (insertedPet) {
      const petType = "adocao"
      const baseSlug = await generateSlug(
        petData.name || "pet",
        petType,
        petData.city || "",
        petData.state || "",
        insertedPet.id,
        "pets",
      )
      const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", insertedPet.id)

      const { error: updateError } = await supabase.from("pets").update({ slug: uniqueSlug }).eq("id", insertedPet.id)

      if (updateError) {
        console.error("Erro ao atualizar slug do pet para adoção:", updateError)
      }
    }

    // Revalidar as páginas relacionadas
    revalidatePath("/adocao")
    revalidatePath("/ongs/dashboard")

    return { success: true, data: insertedPet }
  } catch (error) {
    console.error("Erro ao cadastrar pet:", error)
    return { error: `Erro ao cadastrar pet: ${error instanceof Error ? error.message : String(error)}` }
  }
}

// Função para cadastrar um pet para adoção - VERSÃO ORIGINAL (mantida para compatibilidade)
export async function createAdoptionPet(prevState: any, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Usuário não autenticado. Faça login para continuar." }
  }

  const petData = {
    name: formData.get("name") as string,
    species: formData.get("species") as string,
    species_other: formData.get("species_other") as string,
    breed: formData.get("breed") as string,
    age: formData.get("age") as string,
    size: formData.get("size") as string,
    size_other: formData.get("size_other") as string,
    gender: formData.get("gender") as string,
    gender_other: formData.get("gender_other") as string,
    color: formData.get("color") as string,
    color_other: formData.get("color_other") as string,
    description: formData.get("description") as string,
    main_image_url: formData.get("main_image_url") as string,
    is_vaccinated: formData.get("is_vaccinated") === "on",
    is_neutered: formData.get("is_neutered") === "on",
    is_special_needs: formData.get("is_special_needs") === "on",
    special_needs_description: formData.get("special_needs_description") as string,
    temperament: formData.get("temperament") as string,
    energy_level: formData.get("energy_level") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    contact: formData.get("contact") as string,
    ong_id: formData.get("ong_id") as string,
  }

  const slug = await generateUniqueSlug(
    generateSlug(petData.name || "pet-adocao", petData.city || "", petData.state || ""),
    "pets",
  )

  const { data, error } = await supabase
    .from("pets")
    .insert({
      ...petData,
      user_id: user.id,
      slug,
      category: "adoption",
      status: "available",
      is_castrated: petData.is_neutered, // Mapeamento correto
      whatsapp_contact: petData.contact, // Mapeamento correto
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao cadastrar pet para adoção:", error)
    return { success: false, error: `Erro ao cadastrar pet: ${error.message}` }
  }

  revalidatePath("/adocao")
  revalidatePath("/ongs/dashboard")

  return { success: true, message: "Pet para adoção cadastrado com sucesso!" }
}

// Função genérica para criar pet, para resolver o erro de exportação ausente.
export async function createPet(input: FormData | PetFormUI) {
  console.warn("createPet foi chamado. Considere usar createLostPet, createFoundPet ou createAdoptionPet diretamente.")

  if (input instanceof FormData) {
    const category = input.get("category") as string

    switch (category) {
      case "lost":
        return createLostPet(input)
      case "found":
        return createFoundPet(input)
      case "adoption":
        console.error("createPet: Tentativa de usar FormData para categoria 'adoption'. Isso pode causar erros.")
        return createAdoptionPet(null, input)
      default:
        return { success: false, error: "Categoria de pet inválida." }
    }
  } else {
    // Se for PetFormUI, assumir que é para adoção
    const userId = input.user_id || ""
    return createAdoptionPetClientSide(input, userId)
  }
}

// Função para atualizar o status de um pet
export async function updatePetStatus(petId: string, status: "found" | "lost" | "adopted") {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Check if user owns the pet
    const { data: pet, error: petError } = await supabase.from("pets").select("user_id").eq("id", petId).single()

    if (petError || !pet) {
      return { success: false, error: "Pet não encontrado" }
    }

    if (pet.user_id !== user.id) {
      return { success: false, error: "Você não tem permissão para alterar este pet" }
    }

    // Update pet status
    const { error: updateError } = await supabase
      .from("pets")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", petId)

    if (updateError) {
      console.error("Error updating pet status:", updateError)
      return { success: false, error: "Erro ao atualizar status do pet" }
    }

    // Revalidate paths
    revalidatePath("/dashboard")
    revalidatePath("/perdidos")
    revalidatePath("/encontrados")
    revalidatePath("/adocao")

    return { success: true, message: "Status do pet atualizado com sucesso!" }
  } catch (error) {
    console.error("Unexpected error updating pet status:", error)
    return { success: false, error: "Erro inesperado ao atualizar status" }
  }
}

// Função para deletar um pet
export async function deletePet(petId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Check if user owns the pet
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("user_id, main_image_url")
      .eq("id", petId)
      .single()

    if (petError || !pet) {
      return { success: false, error: "Pet não encontrado" }
    }

    if (pet.user_id !== user.id) {
      return { success: false, error: "Você não tem permissão para excluir este pet" }
    }

    // Delete the pet
    const { error: deleteError } = await supabase.from("pets").delete().eq("id", petId)

    if (deleteError) {
      console.error("Error deleting pet:", deleteError)
      return { success: false, error: "Erro ao excluir pet" }
    }

    // TODO: Delete associated image from storage if needed
    // if (pet.main_image_url) {
    //   // Delete image from Supabase storage
    // }

    // Revalidate paths
    revalidatePath("/dashboard")
    revalidatePath("/perdidos")
    revalidatePath("/encontrados")
    revalidatePath("/adocao")

    return { success: true, message: "Pet excluído com sucesso!" }
  } catch (error) {
    console.error("Unexpected error deleting pet:", error)
    return { success: false, error: "Erro inesperado ao excluir pet" }
  }
}

// Função para atualizar um pet
export async function updatePet(petId: string, formData: FormData) {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Check if user owns the pet
    const { data: existingPet, error: petError } = await supabase
      .from("pets")
      .select("user_id, slug")
      .eq("id", petId)
      .single()

    if (petError || !existingPet) {
      return { success: false, error: "Pet não encontrado" }
    }

    if (existingPet.user_id !== user.id) {
      return { success: false, error: "Você não tem permissão para editar este pet" }
    }

    // Extract form data
    const name = formData.get("name") as string
    const species = formData.get("species") as string
    const breed = formData.get("breed") as string
    const size = formData.get("size") as string
    const gender = formData.get("gender") as string
    const color = formData.get("color") as string
    const description = formData.get("description") as string
    const lost_date = formData.get("lost_date") as string
    const lost_location = formData.get("lost_location") as string
    const contact = formData.get("contact") as string
    const main_image_url = formData.get("main_image_url") as string
    const state = formData.get("state") as string
    const city = formData.get("city") as string
    const is_special_needs = formData.get("is_special_needs") === "true"
    const special_needs_description = formData.get("special_needs_description") as string
    const good_with_kids = formData.get("good_with_kids") === "true"
    const good_with_cats = formData.get("good_with_cats") === "true"
    const good_with_dogs = formData.get("good_with_dogs") === "true"
    const is_vaccinated = formData.get("is_vaccinated") === "true"
    const is_neutered = formData.get("is_neutered") === "true"

    // Validate required fields
    if (!species || !size || !gender || !color || !lost_date || !lost_location || !contact) {
      return { success: false, error: "Todos os campos obrigatórios devem ser preenchidos" }
    }

    // Generate new slug if name, city, or state changed
    const newSlug = generateSlug(name || "pet-perdido", city || "", state || "")

    // Update pet data
    const { data, error } = await supabase
      .from("pets")
      .update({
        name,
        species,
        breed,
        size,
        gender,
        color,
        description,
        lost_date,
        lost_location,
        contact,
        main_image_url,
        state,
        city,
        slug: newSlug,
        is_special_needs,
        special_needs_description,
        good_with_kids,
        good_with_cats,
        good_with_dogs,
        is_vaccinated,
        is_neutered,
        updated_at: new Date().toISOString(),
      })
      .eq("id", petId)
      .select()
      .single()

    if (error) {
      console.error("Error updating pet:", error)
      return { success: false, error: "Erro ao atualizar pet: " + error.message }
    }

    // Revalidate relevant paths
    revalidatePath("/perdidos")
    revalidatePath("/dashboard")
    revalidatePath(`/perdidos/${existingPet.slug}`)
    revalidatePath(`/perdidos/${newSlug}`)

    return {
      success: true,
      data,
      message: "Pet atualizado com sucesso!",
    }
  } catch (error) {
    console.error("Unexpected error updating pet:", error)
    return {
      success: false,
      error: "Erro inesperado ao atualizar pet",
    }
  }
}
