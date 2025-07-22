"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { petSchema } from "@/lib/validators/pet"
import { generateSlug } from "@/lib/slug-utils"
import { getCurrentUser } from "@/lib/auth"
import { uploadPetImage } from "@/lib/storage-manager"
import { deleteImage, uploadImage, generateEntitySlug, generateUniqueSlug } from "@/lib/image-utils"

export async function createLostPetAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: "Usuário não autenticado." }
    }

    // Extract data from FormData
    const data = {
      name: formData.get("name") as string,
      species: formData.get("species") as string,
      otherSpecies: (formData.get("otherSpecies") as string) || undefined,
      breed: formData.get("breed") as string,
      otherBreed: (formData.get("otherBreed") as string) || undefined,
      color: formData.get("color") as string,
      size: formData.get("size") as "small" | "medium" | "large",
      gender: formData.get("gender") as "male" | "female" | "unknown",
      status: "lost" as const,
      description: formData.get("description") as string,
      whatsappContact: formData.get("whatsappContact") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      images: formData.getAll("images") as File[],
    }

    // Validate data
    const validation = petSchema.safeParse(data)
    if (!validation.success) {
      const errorMessage = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return { success: false, message: errorMessage }
    }

    const validatedData = validation.data
    const supabase = createServerActionClient({ cookies })

    // Upload images
    const imageUrls: string[] = []
    try {
      for (const imageFile of validatedData.images) {
        const result = await uploadPetImage(imageFile, user.id)
        if (!result.success || !result.url) {
          throw new Error(result.error || "Erro no upload da imagem")
        }
        imageUrls.push(result.url)
      }
    } catch (uploadError: any) {
      console.error("Error uploading images:", uploadError)
      return { success: false, message: `Erro ao fazer upload das imagens: ${uploadError.message}` }
    }

    // Generate slug
    const slug = generateSlug(validatedData.name, validatedData.city, validatedData.state)

    // Insert pet into database
    const { data: newPet, error: insertError } = await supabase
      .from("pets")
      .insert({
        user_id: user.id,
        name: validatedData.name,
        species: validatedData.species === "other" ? validatedData.otherSpecies : validatedData.species,
        breed: validatedData.breed === "other" ? validatedData.otherBreed : validatedData.breed,
        color: validatedData.color,
        size: validatedData.size,
        gender: validatedData.gender,
        category: "lost",
        status: "approved", // Auto-approve for now
        description: validatedData.description,
        contact_whatsapp: validatedData.whatsappContact,
        city: validatedData.city,
        state: validatedData.state,
        image_urls: imageUrls,
        main_image_url: imageUrls[0] || null,
        slug: slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single()

    if (insertError) {
      console.error("Error inserting pet:", insertError)
      return { success: false, message: `Erro ao cadastrar pet: ${insertError.message}` }
    }

    // Revalidate relevant paths
    revalidatePath("/perdidos")
    revalidatePath("/dashboard")
    revalidatePath(`/perdidos/${newPet.slug}`)

    return {
      success: true,
      message: "Pet perdido cadastrado com sucesso!",
      slug: newPet.slug,
      petId: newPet.id,
    }
  } catch (error: any) {
    console.error("Error in createLostPetAction:", error)
    return { success: false, message: `Erro interno do servidor: ${error.message}` }
  }
}

export async function createFoundPetAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: "Usuário não autenticado." }
    }

    const data = {
      name: formData.get("name") as string,
      species: formData.get("species") as string,
      otherSpecies: (formData.get("otherSpecies") as string) || undefined,
      breed: formData.get("breed") as string,
      otherBreed: (formData.get("otherBreed") as string) || undefined,
      color: formData.get("color") as string,
      size: formData.get("size") as "small" | "medium" | "large",
      gender: formData.get("gender") as "male" | "female" | "unknown",
      status: "found" as const,
      description: formData.get("description") as string,
      whatsappContact: formData.get("whatsappContact") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      images: formData.getAll("images") as File[],
    }

    const validation = petSchema.safeParse(data)
    if (!validation.success) {
      const errorMessage = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return { success: false, message: errorMessage }
    }

    const validatedData = validation.data
    const supabase = createServerActionClient({ cookies })

    const imageUrls: string[] = []
    try {
      for (const imageFile of validatedData.images) {
        const result = await uploadPetImage(imageFile, user.id)
        if (!result.success || !result.url) {
          throw new Error(result.error || "Erro no upload da imagem")
        }
        imageUrls.push(result.url)
      }
    } catch (uploadError: any) {
      console.error("Error uploading images:", uploadError)
      return { success: false, message: `Erro ao fazer upload das imagens: ${uploadError.message}` }
    }

    const slug = generateSlug(validatedData.name, validatedData.city, validatedData.state)

    const { data: newPet, error: insertError } = await supabase
      .from("pets")
      .insert({
        user_id: user.id,
        name: validatedData.name,
        species: validatedData.species === "other" ? validatedData.otherSpecies : validatedData.species,
        breed: validatedData.breed === "other" ? validatedData.otherBreed : validatedData.breed,
        color: validatedData.color,
        size: validatedData.size,
        gender: validatedData.gender,
        category: "found",
        status: "approved",
        description: validatedData.description,
        contact_whatsapp: validatedData.whatsappContact,
        city: validatedData.city,
        state: validatedData.state,
        image_urls: imageUrls,
        main_image_url: imageUrls[0] || null,
        slug: slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single()

    if (insertError) {
      console.error("Error inserting found pet:", insertError)
      return { success: false, message: `Erro ao cadastrar pet encontrado: ${insertError.message}` }
    }

    revalidatePath("/encontrados")
    revalidatePath("/dashboard")
    revalidatePath(`/encontrados/${newPet.slug}`)

    return {
      success: true,
      message: "Pet encontrado cadastrado com sucesso!",
      slug: newPet.slug,
      petId: newPet.id,
    }
  } catch (error: any) {
    console.error("Error in createFoundPetAction:", error)
    return { success: false, message: `Erro interno do servidor: ${error.message}` }
  }
}

export async function createAdoptionPetAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: "Usuário não autenticado." }
    }

    const data = {
      name: formData.get("name") as string,
      species: formData.get("species") as string,
      otherSpecies: (formData.get("otherSpecies") as string) || undefined,
      breed: formData.get("breed") as string,
      otherBreed: (formData.get("otherBreed") as string) || undefined,
      color: formData.get("color") as string,
      size: formData.get("size") as "small" | "medium" | "large",
      gender: formData.get("gender") as "male" | "female" | "unknown",
      status: "for_adoption" as const,
      description: formData.get("description") as string,
      whatsappContact: formData.get("whatsappContact") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      images: formData.getAll("images") as File[],
    }

    const validation = petSchema.safeParse(data)
    if (!validation.success) {
      const errorMessage = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return { success: false, message: errorMessage }
    }

    const validatedData = validation.data
    const supabase = createServerActionClient({ cookies })

    const imageUrls: string[] = []
    try {
      for (const imageFile of validatedData.images) {
        const result = await uploadPetImage(imageFile, user.id)
        if (!result.success || !result.url) {
          throw new Error(result.error || "Erro no upload da imagem")
        }
        imageUrls.push(result.url)
      }
    } catch (uploadError: any) {
      console.error("Error uploading images:", uploadError)
      return { success: false, message: `Erro ao fazer upload das imagens: ${uploadError.message}` }
    }

    const slug = generateSlug(validatedData.name, validatedData.city, validatedData.state)

    const { data: newPet, error: insertError } = await supabase
      .from("pets")
      .insert({
        user_id: user.id,
        name: validatedData.name,
        species: validatedData.species === "other" ? validatedData.otherSpecies : validatedData.species,
        breed: validatedData.breed === "other" ? validatedData.otherBreed : validatedData.breed,
        color: validatedData.color,
        size: validatedData.size,
        gender: validatedData.gender,
        category: "adoption",
        status: "available",
        description: validatedData.description,
        contact_whatsapp: validatedData.whatsappContact,
        city: validatedData.city,
        state: validatedData.state,
        image_urls: imageUrls,
        main_image_url: imageUrls[0] || null,
        slug: slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single()

    if (insertError) {
      console.error("Error inserting adoption pet:", insertError)
      return { success: false, message: `Erro ao cadastrar pet para adoção: ${insertError.message}` }
    }

    revalidatePath("/adocao")
    revalidatePath("/dashboard")
    revalidatePath(`/adocao/${newPet.slug}`)

    return {
      success: true,
      message: "Pet para adoção cadastrado com sucesso!",
      slug: newPet.slug,
      petId: newPet.id,
    }
  } catch (error: any) {
    console.error("Error in createAdoptionPetAction:", error)
    return { success: false, message: `Erro interno do servidor: ${error.message}` }
  }
}

// Alias exports for compatibility
export const createLostPet = createLostPetAction
export const createAdoptionPet = createAdoptionPetAction

// Client-side compatible version for adoption pets
export async function createAdoptionPetClientSide(petData: any) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: "Usuário não autenticado." }
    }

    const validation = petSchema.safeParse(petData)
    if (!validation.success) {
      const errorMessage = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return { success: false, message: errorMessage }
    }

    const validatedData = validation.data
    const supabase = createServerActionClient({ cookies })

    // Handle image uploads if present
    const imageUrls: string[] = []
    if (validatedData.images && validatedData.images.length > 0) {
      try {
        for (const imageFile of validatedData.images) {
          const result = await uploadPetImage(imageFile, user.id)
          if (!result.success || !result.url) {
            throw new Error(result.error || "Erro no upload da imagem")
          }
          imageUrls.push(result.url)
        }
      } catch (uploadError: any) {
        console.error("Error uploading images:", uploadError)
        return { success: false, message: `Erro ao fazer upload das imagens: ${uploadError.message}` }
      }
    }

    const slug = generateSlug(validatedData.name, validatedData.city, validatedData.state)

    const { data: newPet, error: insertError } = await supabase
      .from("pets")
      .insert({
        user_id: user.id,
        name: validatedData.name,
        species: validatedData.species === "other" ? validatedData.otherSpecies : validatedData.species,
        breed: validatedData.breed === "other" ? validatedData.otherBreed : validatedData.breed,
        color: validatedData.color,
        size: validatedData.size,
        gender: validatedData.gender,
        category: "adoption",
        status: "available",
        description: validatedData.description,
        contact_whatsapp: validatedData.whatsappContact,
        city: validatedData.city,
        state: validatedData.state,
        image_urls: imageUrls,
        main_image_url: imageUrls[0] || null,
        slug: slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single()

    if (insertError) {
      console.error("Error inserting adoption pet:", insertError)
      return { success: false, message: `Erro ao cadastrar pet para adoção: ${insertError.message}` }
    }

    revalidatePath("/adocao")
    revalidatePath("/dashboard")
    revalidatePath(`/adocao/${newPet.slug}`)

    return {
      success: true,
      message: "Pet para adoção cadastrado com sucesso!",
      slug: newPet.slug,
      petId: newPet.id,
    }
  } catch (error: any) {
    console.error("Error in createAdoptionPetClientSide:", error)
    return { success: false, message: `Erro interno do servidor: ${error.message}` }
  }
}

export async function updatePetAction(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, message: "Usuário não autenticado." }
  }

  const data = {
    name: formData.get("name") as string,
    species: formData.get("species") as string,
    otherSpecies: formData.get("otherSpecies") as string | undefined,
    breed: formData.get("breed") as string,
    otherBreed: formData.get("otherBreed") as string | undefined,
    color: formData.get("color") as string,
    size: formData.get("size") as "small" | "medium" | "large",
    gender: formData.get("gender") as "male" | "female" | "unknown",
    status: formData.get("status") as "lost" | "found" | "for_adoption",
    description: formData.get("description") as string,
    whatsappContact: formData.get("whatsappContact") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    images: formData.getAll("images") as File[],
  }

  const validation = petSchema.safeParse(data)

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
    }
  }

  const validatedData = validation.data
  const supabase = createServerActionClient({ cookies })

  // Fetch existing pet to check ownership and current images
  const { data: existingPet, error: fetchError } = await supabase
    .from("pets")
    .select("user_id, images, slug")
    .eq("id", id)
    .single()

  if (fetchError || !existingPet) {
    return { success: false, message: "Pet não encontrado ou erro ao buscar." }
  }

  if (existingPet.user_id !== user.id) {
    return { success: false, message: "Você não tem permissão para editar este pet." }
  }

  let imageUrls: string[] = existingPet.images || []
  const newImageFiles = validatedData.images.filter((file) => file instanceof File)
  const existingImageUrls = validatedData.images.filter((file) => typeof file === "string") as string[]

  // Determine images to delete (those in existingPet.images but not in existingImageUrls)
  const imagesToDelete = imageUrls.filter((url) => !existingImageUrls.includes(url))

  try {
    // Delete removed images from storage
    await Promise.all(imagesToDelete.map((url) => deleteImage(url, "pet_images")))

    // Upload new images
    const uploadedNewImageUrls: string[] = []
    for (const imageFile of newImageFiles) {
      const { publicUrl, error } = await uploadImage(imageFile, "pet_images")
      if (error) {
        throw new Error(error.message)
      }
      uploadedNewImageUrls.push(publicUrl)
    }
    imageUrls = [...existingImageUrls, ...uploadedNewImageUrls]
  } catch (uploadError: any) {
    console.error("Error updating images:", uploadError)
    return { success: false, message: `Erro ao atualizar imagens: ${uploadError.message}` }
  }

  try {
    const baseSlug = await generateEntitySlug(
      "pet",
      { name: validatedData.name, city: validatedData.city, state: validatedData.state },
      id,
    )
    const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", id)

    const { error: updateError } = await supabase
      .from("pets")
      .update({
        name: validatedData.name,
        species: validatedData.species === "other" ? validatedData.otherSpecies : validatedData.species,
        breed: validatedData.breed === "other" ? validatedData.otherBreed : validatedData.breed,
        color: validatedData.color,
        size: validatedData.size,
        gender: validatedData.gender,
        status: validatedData.status,
        description: validatedData.description,
        whatsapp_contact: validatedData.whatsappContact,
        city: validatedData.city,
        state: validatedData.state,
        images: imageUrls,
        slug: uniqueSlug,
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating pet:", updateError)
      return { success: false, message: `Erro ao atualizar pet: ${updateError.message}` }
    }

    revalidatePath("/dashboard/my-pets")
    revalidatePath(`/perdidos/${existingPet.slug}`) // Revalidate old slug
    revalidatePath(`/perdidos/${uniqueSlug}`) // Revalidate new slug
    return { success: true, message: "Pet atualizado com sucesso!", slug: uniqueSlug }
  } catch (dbError: any) {
    console.error("Database operation error:", dbError)
    return { success: false, message: `Erro interno do servidor: ${dbError.message}` }
  }
}

export async function deletePetAction(id: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, message: "Usuário não autenticado." }
  }

  const supabase = createServerActionClient({ cookies })

  // Fetch pet to check ownership and get image URLs
  const { data: pet, error: fetchError } = await supabase
    .from("pets")
    .select("user_id, images, slug")
    .eq("id", id)
    .single()

  if (fetchError || !pet) {
    return { success: false, message: "Pet não encontrado ou erro ao buscar." }
  }

  if (pet.user_id !== user.id) {
    return { success: false, message: "Você não tem permissão para excluir este pet." }
  }

  try {
    // Delete images from storage first
    if (pet.images && pet.images.length > 0) {
      await Promise.all(pet.images.map((url) => deleteImage(url, "pet_images")))
    }

    // Then delete pet record from database
    const { error: deleteError } = await supabase.from("pets").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting pet:", deleteError)
      return { success: false, message: `Erro ao excluir pet: ${deleteError.message}` }
    }

    revalidatePath("/dashboard/my-pets")
    revalidatePath(`/perdidos/${pet.slug}`)
    return { success: true, message: "Pet excluído com sucesso!" }
  } catch (error: any) {
    console.error("Error during pet deletion:", error)
    return { success: false, message: `Erro interno do servidor: ${error.message}` }
  }
}
