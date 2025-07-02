"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateSlug, generateUniqueSlug } from "@/lib/slug-utils"
import type { PetFormUI } from "@/lib/types" // Importar o tipo PetFormUI

// Função para cadastrar um pet perdido
export async function createLostPet(formData: FormData) {
  const supabase = createClient()

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Usuário não autenticado" }
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
    if (!species || !size || !gender || !color || !lost_date || !lost_location || !contact || !main_image_url) {
      return { success: false, error: "Todos os campos obrigatórios devem ser preenchidos" }
    }

    // Generate slug
    const slug = generateSlug(name || "pet-perdido", city || "", state || "")

    // Check for blocked keywords
    const contentToCheck = `${name} ${description} ${lost_location}`
    const { data: keywords } = await supabase.from("moderation_keywords").select("keyword").eq("is_active", true)

    if (keywords && keywords.length > 0) {
      const lowerContent = contentToCheck.toLowerCase()
      for (const kw of keywords) {
        if (lowerContent.includes(kw.keyword.toLowerCase())) {
          return {
            success: false,
            error: `Conteúdo contém palavra proibida: "${kw.keyword}". Por favor, revise.`,
          }
        }
      }
    }

    // Insert pet data
    const { data, error } = await supabase
      .from("pets")
      .insert({
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
        main_image_url, // Use main_image_url instead of image_urls
        state,
        city,
        slug,
        category: "lost",
        status: "approved",
        user_id: user.id,
        is_special_needs,
        special_needs_description,
        good_with_kids,
        good_with_cats,
        good_with_dogs,
        is_vaccinated,
        is_neutered,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating lost pet:", error)
      return { success: false, error: "Erro ao salvar pet perdido: " + error.message }
    }

    // Revalidate relevant paths
    revalidatePath("/perdidos")
    revalidatePath("/dashboard")
    revalidatePath(`/perdidos/${slug}`)

    return {
      success: true,
      data,
      message: "Pet perdido cadastrado com sucesso!",
    }
  } catch (error) {
    console.error("Unexpected error creating lost pet:", error)
    return {
      success: false,
      error: "Erro inesperado ao cadastrar pet perdido",
    }
  }
}

// Função para cadastrar um pet encontrado
export async function createFoundPet(formData: FormData) {
  const supabase = createClient()

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
    // CORREÇÃO: Usar getAll para obter o array de URLs
    const image_urls = formData.getAll("image_urls") as string[]
    const main_image_url = image_urls.length > 0 ? image_urls[0] : null // Pega a primeira imagem

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
          age: formData.get("age") as string, // Declare the age variable here
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
          main_image_url: main_image_url, // Usar a primeira imagem
          image_urls: image_urls, // Salvar todas as URLs de imagem
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
          status: "approved",
          category: "found",
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
      const baseSlug = await generateSlug(name || "pet-encontrado", city || "", state || "")

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
    revalidatePath("/dashboard")

    return { success: true, data: petData }
  } catch (error) {
    console.error("Erro não tratado:", error)
    return { success: false, error: "Ocorreu um erro ao cadastrar o pet encontrado" }
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
export async function createAdoptionPet(petData: PetFormUI) {
  console.log("createAdoptionPet chamado com:", petData)

  try {
    const supabase = createClient()
    console.log("Cliente Supabase criado")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("Sessão verificada:", user ? "Autenticado" : "Não autenticado")

    if (!user) {
      console.log("Usuário não autenticado")
      return { error: "Usuário não autenticado" }
    }

    // Usar a função client-side passando o userId
    return await createAdoptionPetClientSide(petData, user.id)
  } catch (error) {
    console.error("Erro ao cadastrar pet:", error)
    return { error: `Erro ao cadastrar pet: ${error instanceof Error ? error.message : String(error)}` }
  }
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
        const petFormUIFromFormData: PetFormUI = {
          name: input.get("name") as string,
          species: input.get("species") as string,
          species_other: input.get("species_other") as string | null,
          breed: input.get("breed") as string,
          age: input.get("age") as string,
          size: input.get("size") as string,
          size_other: input.get("size_other") as string | null,
          gender: input.get("gender") as string,
          gender_other: input.get("gender_other") as string | null,
          color: input.get("color") as string,
          color_other: input.get("color_other") as string | null,
          description: input.get("description") as string,
          image_urls: input.getAll("image_urls") as string[],
          is_vaccinated: input.get("is_vaccinated") === "on",
          is_castrated: input.get("is_castrated") === "on",
          is_special_needs: input.get("is_special_needs") === "on",
          special_needs_description: input.get("special_needs_description") as string | null,
          temperament: input.get("temperament") as string | null,
          energy_level: input.get("energy_level") as string | null,
          good_with_kids: input.get("good_with_kids") === "on",
          good_with_cats: input.get("good_with_cats") === "on",
          good_with_dogs: input.get("good_with_dogs") === "on",
          city: input.get("city") as string,
          state: input.get("state") as string,
          whatsapp_contact: input.get("whatsapp_contact") as string,
          ong_id: input.get("ong_id") as string | null,
        }
        return createAdoptionPet(petFormUIFromFormData)
      default:
        return { success: false, error: "Categoria de pet inválida." }
    }
  } else {
    return createAdoptionPet(input)
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
