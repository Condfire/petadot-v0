"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

type PetType = "adoption" | "lost" | "found"
type ResolutionStatus = "adopted" | "resolved" | "reunited"

export async function updatePetStatus(
  petId: string,
  petType: PetType,
  status: ResolutionStatus,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerComponentClient({ cookies })

  try {
    console.log("updatePetStatus chamada com:", { petId, petType, status, notes })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Verificar se o pet pertence ao usuário
    const { data: pet, error: fetchError } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .eq("user_id", userId)
      .single()

    if (fetchError) {
      console.error("Erro ao verificar pet:", fetchError)
      return { success: false, error: fetchError.message }
    }

    let isAdmin = false

    if (!pet) {
      // Verificar se o usuário é administrador
      const { data: userData } = await supabase.from("users").select("is_admin").eq("id", userId).single()
      isAdmin = userData?.is_admin === true

      if (!isAdmin) {
        return { success: false, error: "Pet não encontrado ou você não tem permissão para atualizá-lo" }
      }

      console.log("Usuário é admin, permitindo atualização")
    } else {
      console.log("Pet encontrado:", pet)
    }

    // Preparar dados de atualização baseados no status
    const updateData: Record<string, any> = {
      status: status,
      updated_at: new Date().toISOString(),
    }

    // Adicionar campos específicos baseados no tipo de resolução
    switch (status) {
      case "adopted":
        updateData.adopted = true
        updateData.adopted_at = new Date().toISOString()
        if (notes) updateData.adoption_notes = notes
        break
      case "resolved":
        updateData.resolved = true
        updateData.resolved_at = new Date().toISOString()
        if (notes) updateData.resolution_notes = notes
        break
      case "reunited":
        updateData.reunited = true
        updateData.reunited_at = new Date().toISOString()
        if (notes) updateData.reunion_notes = notes
        break
    }

    console.log("Dados para atualização:", updateData)

    // Atualizar o pet
    const { error: updateError } = await supabase.from("pets").update(updateData).eq("id", petId)

    if (updateError) {
      console.error("Erro ao atualizar status do pet:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log("Pet atualizado com sucesso")

    // Revalidar páginas relevantes
    revalidatePath("/dashboard/pets")
    revalidatePath("/admin/pets")
    revalidatePath("/")

    // Revalidar páginas específicas baseadas na categoria do pet
    if (pet?.category) {
      switch (pet.category) {
        case "adoption":
          revalidatePath("/adocao")
          revalidatePath(`/adocao/${petId}`)
          break
        case "lost":
          revalidatePath("/perdidos")
          revalidatePath(`/perdidos/${petId}`)
          break
        case "found":
          revalidatePath("/encontrados")
          revalidatePath(`/encontrados/${petId}`)
          break
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar status do pet:", error)
    return { success: false, error: "Ocorreu um erro ao atualizar o status do pet." }
  }
}
