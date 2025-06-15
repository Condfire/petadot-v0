"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generatePetSlug, generateUniqueSlug } from "@/lib/slug-utils"

// Função para cadastrar um pet perdido
export async function createLostPet(formData: FormData) {
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
    const age = formData.get("age") as string
    const size = formData.get("size") as string
    const size_other = size === "other" ? (formData.get("size_other") as string) : null
    const gender = formData.get("gender") as string
    const gender_other = gender === "other" ? (formData.get("gender_other") as string) : null
    const color = formData.get("color") as string
    const color_other = color === "other" ? (formData.get("color_other") as string) : null
    const description = formData.get("description") as string
    const last_seen_date = formData.get("last_seen_date") as string
    const last_seen_location = formData.get("last_seen_location") as string
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
          age,
          size,
          size_other,
          gender,
          gender_other,
          color,
          color_other,
          description,
          last_seen_date,
          last_seen_location,
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
          status: "approved",
          category: "lost",
        },
      ])
      .select()

    if (insertError) {
      console.error("Erro ao cadastrar pet perdido:", insertError)
      return { success: false, error: insertError.message }
    }

    // Gerar slug com o ID obtido
    if (petData && petData.length > 0) {
      const pet = petData[0]
      const petType = "perdido"

      // Gerar slug base
      const baseSlug = await generatePetSlug(name || "pet", petType, city || "", state || "", pet.id, "pets")

      // Garantir que o slug seja único
      const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", pet.id)

      // Atualizar o registro com o slug
      const { error: updateError } = await supabase.from("pets").update({ slug: uniqueSlug }).eq("id", pet.id)

      if (updateError) {
        console.error("Erro ao atualizar slug do pet perdido:", updateError)
      }
    }

    // Revalidar caminhos
    revalidatePath("/perdidos")
    revalidatePath("/")

    return { success: true, data: petData }
  } catch (error) {
    console.error("Erro não tratado:", error)
    return { success: false, error: "Ocorreu um erro ao cadastrar o pet perdido" }
  }
}

// Função para cadastrar um pet encontrado
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

// Função para cadastrar um pet para adoção
export async function createAdoptionPet(petData: any) {
  console.log("[Server Action] createAdoptionPet chamado com:", petData.name)

  try {
    const supabase = createServerActionClient({ cookies })
    console.log("[Server Action] Cliente Supabase criado")

    console.log("[Server Action] Verificando autenticação...")
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("[Server Action] Usuário autenticado:", user ? user.id : "NÃO")

    if (!user) {
      console.error("[Server Action] Usuário não autenticado.")
      return { error: "Usuário não autenticado" }
    }

    const isEditing = petData.is_editing === true
    console.log("[Server Action] É edição?", isEditing)

    if (isEditing && petData.id) {
      console.log("[Server Action] Tentando atualizar pet com ID:", petData.id)
      const updateData = { ...petData }
      delete updateData.is_editing
      delete updateData.slug

      const { error: updateError } = await supabase
        .from("pets")
        .update(updateData)
        .eq("id", petData.id)
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[Server Action] Erro ao atualizar pet:", updateError)
        return { error: `Erro ao atualizar pet: ${updateError.message}` }
      }
      console.log("[Server Action] Pet atualizado com sucesso.")

      revalidatePath("/adocao")
      revalidatePath(`/adocao/${petData.id}`)
      revalidatePath("/my-pets")
      console.log("[Server Action] Caminhos revalidados após atualização.")

      return { success: true }
    }

    // Caso contrário, criar um novo pet
    // Preparar dados com os valores já processados pelo cliente
    const newPet = {
      name: petData.name,
      species: petData.species, // Usar o valor já processado do cliente
      species_other: petData.species_other,
      breed: petData.breed,
      age: petData.age,
      size: petData.size, // Usar o valor já processado do cliente
      size_other: petData.size_other,
      gender: petData.gender, // Usar o valor já processado do cliente
      gender_other: petData.gender_other,
      color: petData.color, // Usar o valor já processado do cliente
      color_other: petData.color_other,
      description: petData.description,
      main_image_url: petData.image_url,
      is_vaccinated: petData.is_vaccinated || false,
      is_neutered: petData.is_neutered || false,
      is_special_needs: petData.special_needs ? true : false,
      special_needs_description: petData.special_needs || null,
      temperament: petData.temperament,
      energy_level: petData.energy_level,
      good_with_kids: petData.good_with_kids || false,
      good_with_cats: petData.good_with_cats || false,
      good_with_dogs: petData.good_with_dogs || false,
      city: petData.city,
      state: petData.state,
      contact: petData.contact,
      user_id: user.id,
      ong_id: petData.ong_id,
      status: "available",
      category: "adoption",
      created_at: new Date().toISOString(),
    }

    console.log("[Server Action] Inserindo novo pet:", newPet.name)
    const { data: insertedPet, error: insertError } = await supabase.from("pets").insert(newPet).select().single()
    console.log("[Server Action] Resultado da inserção:", insertedPet ? "Sucesso" : "Falha", insertError || "")

    if (insertError) {
      console.error("[Server Action] Erro ao cadastrar pet (insert):", insertError)
      return { error: `Erro ao cadastrar pet: ${insertError.message}` }
    }

    if (insertedPet) {
      console.log("[Server Action] Gerando slug para o pet ID:", insertedPet.id)
      const petType = "adocao"
      const baseSlug = await generatePetSlug(
        petData.name || "pet",
        petType,
        petData.city || "",
        petData.state || "",
        insertedPet.id,
        "pets",
      )
      const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", insertedPet.id)
      console.log("[Server Action] Slug gerado:", uniqueSlug)

      console.log("[Server Action] Atualizando pet com slug...")
      const { error: updateError } = await supabase.from("pets").update({ slug: uniqueSlug }).eq("id", insertedPet.id)

      if (updateError) {
        console.error("[Server Action] Erro ao atualizar slug do pet para adoção:", updateError)
        // Este erro não é crítico para a criação do pet, mas deve ser logado.
      }
      console.log("[Server Action] Slug atualizado com sucesso (se aplicável).")
    }

    revalidatePath("/adocao")
    revalidatePath("/my-pets")
    console.log("[Server Action] Caminhos revalidados após criação.")

    return { success: true, data: insertedPet }
  } catch (error) {
    console.error("[Server Action] Erro não tratado em createAdoptionPet:", error)
    return { error: `Erro ao cadastrar pet: ${error instanceof Error ? error.message : String(error)}` }
  }
}
