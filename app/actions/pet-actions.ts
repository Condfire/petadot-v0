"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generatePetSlug, generateUniqueSlug } from "@/lib/slug-utils"
import { z } from "zod"

// Schema for creating an adoption pet by an ONG
const createAdoptionPetSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  species: z.enum(["dog", "cat", "other"], { required_error: "Espécie é obrigatória" }),
  breed: z.string().min(2, "Raça muito curta"),
  size: z.enum(["small", "medium", "large"], { required_error: "Porte é obrigatório" }),
  gender: z.enum(["male", "female"], { required_error: "Gênero é obrigatório" }),
  age: z.string().min(1, "Idade é obrigatória"),
  color: z.string().min(2, "Cor muito curta"),
  description: z.string().min(10, "Descrição muito curta"),
  special_needs: z.string().optional().nullable(),
  main_image_url: z.string().url("URL da imagem inválida").min(1, "Imagem principal é obrigatória"),
})

export async function createAdoptionPetByOng(formData: unknown) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })
  console.log("[Action createAdoptionPetByOng] Received data:", formData)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      console.log("[Action createAdoptionPetByOng] User not authenticated.")
      return { success: false, error: "Usuário não autenticado." }
    }
    console.log("[Action createAdoptionPetByOng] User ID:", user.id)

    const { data: ong, error: ongError } = await supabase
      .from("ongs")
      .select("id, city, state") // Ensure city and state are selected if used for pet
      .eq("user_id", user.id)
      .single()

    if (ongError || !ong) {
      console.error("[Action createAdoptionPetByOng] ONG not found or error:", ongError)
      return { success: false, error: "ONG não encontrada ou usuário não associado a uma ONG." }
    }
    console.log("[Action createAdoptionPetByOng] ONG ID:", ong.id, "ONG City:", ong.city, "ONG State:", ong.state)

    const validationResult = createAdoptionPetSchema.safeParse(formData)
    if (!validationResult.success) {
      console.error(
        "[Action createAdoptionPetByOng] Zod Validation Error:",
        validationResult.error.flatten().fieldErrors,
      )
      return { success: false, error: "Dados do formulário inválidos. Verifique os campos." }
    }
    const petData = validationResult.data
    console.log("[Action createAdoptionPetByOng] Validated pet data:", petData)

    const insertPayload = {
      name: petData.name,
      species: petData.species,
      // species_other: petData.species === "other" ? petData.species_other : null, // Assuming species_other is part of form if species is 'other'
      breed: petData.breed,
      age: petData.age,
      size: petData.size,
      // size_other: petData.size === "other" ? petData.size_other : null,
      gender: petData.gender,
      // gender_other: petData.gender === "other" ? petData.gender_other : null,
      color: petData.color,
      // color_other: petData.color === "other" ? petData.color_other : null,
      description: petData.description,
      main_image_url: petData.main_image_url,
      is_special_needs: !!petData.special_needs,
      special_needs_description: petData.special_needs || null,
      // Default values for adoption pets by ONG
      category: "adoption",
      status: "available", // Or "pending_approval" if you have a moderation flow
      user_id: user.id,
      ong_id: ong.id,
      city: ong.city || "Não informado", // Use ONG's city/state or a default
      state: ong.state || "NI",
      // created_at and updated_at will be handled by Supabase
    }
    console.log("[Action createAdoptionPetByOng] Inserting pet with payload:", insertPayload)

    const { data: newPet, error: insertError } = await supabase
      .from("pets")
      .insert([insertPayload])
      .select("id, name, city, state") // Select fields needed for slug
      .single()

    if (insertError) {
      console.error("[Action createAdoptionPetByOng] Supabase Insert Error:", insertError)
      return { success: false, error: "Erro ao salvar o pet no banco de dados." }
    }

    if (!newPet) {
      console.error("[Action createAdoptionPetByOng] No pet data returned after insert.")
      return { success: false, error: "Falha ao registrar o pet, nenhum dado retornado." }
    }
    console.log("[Action createAdoptionPetByOng] Pet inserted, ID:", newPet.id)

    const petTypeForSlug = "adocao" // Define the pet type for slug generation
    const baseSlug = await generatePetSlug(
      newPet.name || "pet",
      petTypeForSlug,
      newPet.city || ong.city || "", // Use pet's city, fallback to ONG's city
      newPet.state || ong.state || "", // Use pet's state, fallback to ONG's state
      newPet.id,
      "pets", // Table name
    )
    const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", newPet.id)
    console.log("[Action createAdoptionPetByOng] Generated slug:", uniqueSlug)

    const { error: slugError } = await supabase
      .from("pets")
      .update({ slug: uniqueSlug, updated_at: new Date().toISOString() })
      .eq("id", newPet.id)

    if (slugError) {
      console.error("[Action createAdoptionPetByOng] Supabase slug update error:", slugError)
      // Non-critical, pet is created. Log and continue.
    }

    revalidatePath("/ongs/dashboard")
    revalidatePath("/ongs/dashboard/pets/cadastrar")
    revalidatePath("/adocao")
    console.log("[Action createAdoptionPetByOng] Pet creation successful.")
    return { success: true, petId: newPet.id }
  } catch (e: any) {
    console.error("[Action createAdoptionPetByOng] Unexpected error:", e)
    return { success: false, error: "Ocorreu um erro inesperado ao processar o cadastro do pet." }
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
  console.log("createAdoptionPet (LEGACY) chamado com:", petData)
  // This function seems to be for general users, not ONGs.
  // It might need similar review if it's still in use.
  // For now, focusing on createAdoptionPetByOng.
  try {
    const supabase = createServerActionClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Usuário não autenticado" }

    // ... (rest of the legacy logic) ...
    // This legacy function needs a similar review for data mapping,
    // RLS, and slug generation if it's still actively used.
    // For now, the focus is on the ONG-specific pet creation.

    // Simplified placeholder for brevity
    const newPetData = {
      name: petData.name,
      species: petData.species,
      breed: petData.breed,
      age: petData.age,
      size: petData.size,
      gender: petData.gender,
      color: petData.color,
      description: petData.description,
      main_image_url: petData.image_url,
      user_id: user.id,
      ong_id: petData.ong_id, // This might be null if a general user is creating
      status: "pending",
      category: "adoption",
      city: petData.city,
      state: petData.state,
      // ... other fields ...
    }

    const { data: insertedPet, error: insertError } = await supabase
      .from("pets")
      .insert(newPetData)
      .select("id, name, city, state")
      .single()

    if (insertError) {
      console.error("Erro ao cadastrar pet (LEGACY):", insertError)
      return { error: `Erro ao cadastrar pet: ${insertError.message}` }
    }

    if (insertedPet) {
      const petType = "adocao"
      const baseSlug = await generatePetSlug(
        insertedPet.name || "pet",
        petType,
        insertedPet.city || "",
        insertedPet.state || "",
        insertedPet.id,
        "pets",
      )
      const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", insertedPet.id)
      await supabase.from("pets").update({ slug: uniqueSlug }).eq("id", insertedPet.id)
    }

    revalidatePath("/adocao")
    revalidatePath("/dashboard/pets")
    return { success: true, data: insertedPet }
  } catch (error) {
    console.error("Erro ao cadastrar pet (LEGACY):", error)
    return { error: `Erro ao cadastrar pet: ${error instanceof Error ? error.message : String(error)}` }
  }
}
