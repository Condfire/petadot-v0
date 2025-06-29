import { createClientComponentClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { generateSlug } from "@/lib/slug-utils"

export interface PetFormUI {
  name: string
  species: string
  species_other?: string | null
  breed: string
  age: string
  size: string
  size_other?: string | null
  gender: string
  gender_other?: string | null
  color: string
  color_other?: string | null
  description: string
  main_image_url: string
  is_vaccinated: boolean
  is_castrated: boolean
  is_special_needs: boolean
  special_needs_description?: string | null
  temperament?: string | null
  energy_level?: string | null
  good_with_kids: boolean
  good_with_cats: boolean
  good_with_dogs: boolean
  city: string
  state: string
  whatsapp_contact: string
  ong_id?: string
}

export interface PetFormData {
  name: string
  species: string
  breed: string
  color: string
  size: string
  gender: string
  age?: string
  description: string
  city: string
  state: string
  contact_whatsapp: string
  contact_email?: string
  special_needs?: string
  good_with_kids?: boolean
  good_with_dogs?: boolean
  good_with_cats?: boolean
  vaccinated?: boolean
  neutered?: boolean
  images?: File[]
}

export async function createAdoptionPetClient(petData: PetFormUI, userId: string) {
  const supabase = createClientComponentClient()

  try {
    console.log("Creating adoption pet with data:", petData)

    // Generate slug
    const slug = generateSlug(`${petData.name} ${petData.species} ${petData.city} ${petData.state}`)

    // Prepare data for database
    const dbData = {
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
      main_image_url: petData.main_image_url,
      is_vaccinated: petData.is_vaccinated,
      is_castrated: petData.is_castrated,
      is_special_needs: petData.is_special_needs,
      special_needs_description: petData.special_needs_description,
      temperament: petData.temperament,
      energy_level: petData.energy_level,
      good_with_kids: petData.good_with_kids,
      good_with_cats: petData.good_with_cats,
      good_with_dogs: petData.good_with_dogs,
      city: petData.city,
      state: petData.state,
      whatsapp_contact: petData.whatsapp_contact,
      user_id: userId,
      ong_id: petData.ong_id || null,
      category: "adoption",
      status: "approved",
      slug: slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Inserting pet data:", dbData)

    const { data, error } = await supabase.from("pets").insert(dbData).select().single()

    if (error) {
      console.error("Database error:", error)
      return { error: `Erro ao cadastrar pet: ${error.message}` }
    }

    console.log("Pet created successfully:", data)
    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      error: `Erro inesperado: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    }
  }
}

export async function createLostPetClient(petData: PetFormUI, userId: string) {
  const supabase = createClientComponentClient()

  try {
    console.log("Creating lost pet with data:", petData)

    const slug = generateSlug(`${petData.name} ${petData.species} ${petData.city} ${petData.state}`)

    const dbData = {
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
      main_image_url: petData.main_image_url,
      city: petData.city,
      state: petData.state,
      whatsapp_contact: petData.whatsapp_contact,
      user_id: userId,
      category: "lost",
      status: "approved",
      slug: slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("pets").insert(dbData).select().single()

    if (error) {
      console.error("Database error:", error)
      return { error: `Erro ao cadastrar pet: ${error.message}` }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      error: `Erro inesperado: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    }
  }
}

export async function createFoundPetClient(petData: PetFormUI, userId: string) {
  const supabase = createClientComponentClient()

  try {
    console.log("Creating found pet with data:", petData)

    const slug = generateSlug(`${petData.name || "pet-encontrado"} ${petData.species} ${petData.city} ${petData.state}`)

    const dbData = {
      name: petData.name || "Pet Encontrado",
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
      main_image_url: petData.main_image_url,
      city: petData.city,
      state: petData.state,
      whatsapp_contact: petData.whatsapp_contact,
      user_id: userId,
      category: "found",
      status: "approved",
      slug: slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("pets").insert(dbData).select().single()

    if (error) {
      console.error("Database error:", error)
      return { error: `Erro ao cadastrar pet: ${error.message}` }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      error: `Erro inesperado: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    }
  }
}

export async function createAdoptionPet(formData: PetFormData) {
  const supabase = createClientComponentClient()

  try {
    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      throw new Error("Usuário não autenticado")
    }

    // Upload images if provided
    let mainImageUrl = null
    const imageUrls: string[] = []

    if (formData.images && formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `pets/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pet-images")
          .upload(filePath, file)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("pet-images").getPublicUrl(filePath)

        imageUrls.push(publicUrl)

        if (i === 0) {
          mainImageUrl = publicUrl
        }
      }
    }

    // Generate slug
    const slug = `${formData.name.toLowerCase().replace(/\s+/g, "-")}-${formData.city.toLowerCase().replace(/\s+/g, "-")}-${formData.state.toLowerCase()}-${Date.now().toString(36)}`

    // Insert pet data
    const petData = {
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      color: formData.color,
      size: formData.size,
      gender: formData.gender,
      age: formData.age || null,
      description: formData.description,
      city: formData.city,
      state: formData.state,
      whatsapp_contact: formData.contact_whatsapp,
      contact_email: formData.contact_email || null,
      special_needs: formData.special_needs || null,
      good_with_kids: formData.good_with_kids || false,
      good_with_dogs: formData.good_with_dogs || false,
      good_with_cats: formData.good_with_cats || false,
      vaccinated: formData.vaccinated || false,
      neutered: formData.neutered || false,
      main_image_url: mainImageUrl,
      image_url: imageUrls.length > 1 ? imageUrls[1] : null, // Assuming image_url is for a secondary image
      status: "available",
      user_id: session.user.id,
      slug: slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("pets").insert(petData).select().single()

    if (error) {
      console.error("Database error:", error)
      throw new Error("Erro ao salvar pet no banco de dados")
    }

    toast.success("Pet cadastrado com sucesso!")
    return { success: true, data }
  } catch (error) {
    console.error("Error creating adoption pet:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    toast.error(`Erro ao cadastrar pet: ${errorMessage}`)
    return { success: false, error: errorMessage }
  }
}
