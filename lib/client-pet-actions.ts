"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { PetFormUI } from "@/lib/types"

export async function createAdoptionPetClient(petData: PetFormUI, userId: string) {
  console.log("createAdoptionPetClient chamado com:", petData, "userId:", userId)

  try {
    const supabase = createClientComponentClient()
    console.log("Cliente Supabase criado")

    // Verificar se é uma edição ou criação
    const isEditing = petData.is_editing === true

    // Se for edição, atualizar o pet existente
    if (isEditing && petData.id) {
      const updateData = { ...petData }
      delete updateData.is_editing
      delete updateData.slug

      const { error: updateError } = await supabase
        .from("pets")
        .update(updateData)
        .eq("id", petData.id)
        .eq("user_id", userId)

      if (updateError) {
        console.error("Erro ao atualizar pet:", updateError)
        return { error: `Erro ao atualizar pet: ${updateError.message}` }
      }

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
      // CORREÇÃO: Usar main_image_url e remover image_urls (plural)
      main_image_url: petData.main_image_url || null, // Agora usa main_image_url do PetFormUI
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
    }

    console.log("Inserindo novo pet:", newPet)

    const { data: insertedPet, error: insertError } = await supabase.from("pets").insert(newPet).select().single()

    console.log("Resultado da inserção:", insertedPet ? "Sucesso" : "Falha", insertError || "")

    if (insertError) {
      console.error("Erro ao cadastrar pet:", insertError)
      return { error: `Erro ao cadastrar pet: ${insertError.message}` }
    }

    // Gerar slug simples (sem as funções server-side)
    if (insertedPet) {
      const slug = `${petData.name?.toLowerCase().replace(/\s+/g, "-")}-${petData.city?.toLowerCase().replace(/\s+/g, "-")}-${insertedPet.id}`

      const { error: updateError } = await supabase.from("pets").update({ slug }).eq("id", insertedPet.id)

      if (updateError) {
        console.error("Erro ao atualizar slug do pet para adoção:", updateError)
      }
    }

    return { success: true, data: insertedPet }
  } catch (error) {
    console.error("Erro ao cadastrar pet:", error)
    return { error: `Erro ao cadastrar pet: ${error instanceof Error ? error.message : String(error)}` }
  }
}
