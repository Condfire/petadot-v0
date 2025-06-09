"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generatePetSlug, generateUniqueSlug } from "@/lib/slug-utils"
import { z } from "zod"

// Schema for creating an adoption pet by an ONG
const createAdoptionPetSchema = z.object({
  name: z.string().min(2),
  species: z.enum(["dog", "cat", "other"]),
  breed: z.string().min(2),
  size: z.enum(["small", "medium", "large"]),
  gender: z.enum(["male", "female"]),
  age: z.string().min(1),
  color: z.string().min(2),
  description: z.string().min(10),
  special_needs: z.string().optional(),
  main_image_url: z.string().url(),
})

export async function createAdoptionPetByOng(formData: unknown) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // 1. Get current user and their ONG
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado." }
    }

    const { data: ong, error: ongError } = await supabase
      .from("ongs")
      .select("id, city, state")
      .eq("user_id", user.id)
      .single()

    if (ongError || !ong) {
      return { success: false, error: "ONG não encontrada ou usuário não associado a uma ONG." }
    }

    // 2. Validate form data
    const validationResult = createAdoptionPetSchema.safeParse(formData)
    if (!validationResult.success) {
      console.error("Validation Error:", validationResult.error.flatten().fieldErrors)
      return { success: false, error: "Dados do formulário inválidos." }
    }
    const petData = validationResult.data

    // 3. Insert pet data into the database
    const { data: newPet, error: insertError } = await supabase
      .from("pets")
      .insert([
        {
          ...petData,
          category: "adoption",
          status: "available", // Default status for new adoption pets
          user_id: user.id,
          ong_id: ong.id,
          city: ong.city, // Inherit city/state from ONG
          state: ong.state,
        },
      ])
      .select("id, name, city, state")
      .single()

    if (insertError) {
      console.error("Supabase Insert Error:", insertError)
      return { success: false, error: "Erro ao salvar o pet no banco de dados." }
    }

    // 4. Generate and update slug
    const baseSlug = generatePetSlug(newPet.name, newPet.city, newPet.state)
    const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", newPet.id)

    const { error: slugError } = await supabase.from("pets").update({ slug: uniqueSlug }).eq("id", newPet.id)

    if (slugError) {
      // Log the error but don't fail the whole operation, as the pet is already created
      console.error("Error updating slug:", slugError)
    }

    // 5. Revalidate paths to show new data
    revalidatePath("/ongs/dashboard")
    revalidatePath("/adocao")

    return { success: true, petId: newPet.id }
  } catch (e: any) {
    console.error("Unexpected error in createAdoptionPetByOng:", e)
    return { success: false, error: "Ocorreu um erro inesperado." }
  }
}

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
          status: "pending",
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
          status: "pending",
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
  console.log("createAdoptionPet chamado com:", petData)

  try {
    // Usar o mesmo método de criação do cliente Supabase que as outras funções
    const supabase = createServerActionClient({ cookies })
    console.log("Cliente Supabase criado")

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("Sessão verificada:", user ? "Autenticado" : "Não autenticado")

    if (!user) {
      console.log("Usuário não autenticado")
      return { error: "Usuário não autenticado" }
    }

    // Verificar se é uma edição ou criação
    const isEditing = petData.is_editing === true

    // Se for edição, atualizar o pet existente
    if (isEditing && petData.id) {
      // Se o slug já existir, não o sobrescrever
      const updateData = { ...petData }
      delete updateData.is_editing
      delete updateData.slug // Não atualizar o slug se já existir

      const { error: updateError } = await supabase
        .from("pets")
        .update(updateData)
        .eq("id", petData.id)
        .eq("user_id", user.id)

      if (updateError) {
        console.error("Erro ao atualizar pet:", updateError)
        return { error: `Erro ao atualizar pet: ${updateError.message}` }
      }

      // Revalidar as páginas relacionadas
      revalidatePath("/adocao")
      revalidatePath(`/adocao/${petData.id}`)
      revalidatePath("/dashboard/pets")

      return { success: true }
    }

    // Caso contrário, criar um novo pet
    // Preparar dados apenas com campos que existem na tabela
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
      main_image_url: petData.image_url, // Usar main_image_url em vez de image_url
      is_vaccinated: petData.is_vaccinated || false,
      is_neutered: petData.is_neutered || false,
      is_special_needs: petData.special_needs ? true : false,
      special_needs_description: petData.special_needs || null,
      temperament: petData.temperament,
      energy_level: petData.energy_level,
      // Campos que podem existir na tabela pets
      good_with_kids: petData.good_with_kids || false,
      good_with_cats: petData.good_with_cats || false,
      good_with_dogs: petData.good_with_dogs || false,
      city: petData.city,
      state: petData.state,
      contact: petData.contact,
      user_id: user.id,
      ong_id: petData.ong_id,
      status: "pending",
      category: "adoption",
      created_at: new Date().toISOString(),
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

      // Gerar slug base
      const baseSlug = await generatePetSlug(
        petData.name || "pet",
        petType,
        petData.city || "",
        petData.state || "",
        insertedPet.id,
        "pets",
      )

      // Garantir que o slug seja único
      const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", insertedPet.id)

      // Atualizar o registro com o slug
      const { error: updateError } = await supabase.from("pets").update({ slug: uniqueSlug }).eq("id", insertedPet.id)

      if (updateError) {
        console.error("Erro ao atualizar slug do pet para adoção:", updateError)
      }
    }

    // Revalidar as páginas relacionadas
    revalidatePath("/adocao")
    revalidatePath("/dashboard/pets")

    return { success: true, data: insertedPet }
  } catch (error) {
    console.error("Erro ao cadastrar pet:", error)
    return { error: `Erro ao cadastrar pet: ${error instanceof Error ? error.message : String(error)}` }
  }
}
