"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateEntitySlug, generateUniqueSlug } from "@/lib/slug-utils"

// Verificar se o usuário é administrador
async function isAdmin() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return false
  }

  const { data: user, error } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

  if (error || !user?.is_admin) {
    return false
  }

  return true
}

// Criar um novo parceiro
export async function createPartner(formData: FormData) {
  if (!(await isAdmin())) {
    return { success: false, error: "Não autorizado" }
  }

  const supabase = createServerComponentClient({ cookies })

  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const image_url = formData.get("image_url") as string
    const website_url = formData.get("website_url") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string

    // Validar campos obrigatórios
    if (!name || !description || !image_url) {
      return { success: false, error: "Campos obrigatórios não preenchidos" }
    }

    // Inserir parceiro para obter o ID
    const { data, error } = await supabase
      .from("partners")
      .insert({
        name,
        description,
        image_url,
        website_url: website_url || null,
        city: city || null,
        state: state || null,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Erro ao criar parceiro:", error)
      return { success: false, error: "Erro ao criar parceiro" }
    }

    // Gerar slug com o ID obtido
    if (data && data.length > 0) {
      const partner = data[0]

      // Gerar slug base
      const baseSlug = await generateEntitySlug(name || "parceiro", "parceiro", city || "", partner.id)

      // Garantir que o slug seja único
      const uniqueSlug = await generateUniqueSlug(baseSlug, "partners", partner.id)

      // Atualizar o registro com o slug
      const { error: updateError } = await supabase.from("partners").update({ slug: uniqueSlug }).eq("id", partner.id)

      if (updateError) {
        console.error("Erro ao atualizar slug do parceiro:", updateError)
      }
    }

    // Revalidar páginas
    revalidatePath("/parceiros")
    revalidatePath("/admin/partners")

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao criar parceiro:", error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}

// Atualizar um parceiro existente
export async function updatePartner(id: string, formData: FormData) {
  if (!(await isAdmin())) {
    return { success: false, error: "Não autorizado" }
  }

  const supabase = createServerComponentClient({ cookies })

  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const image_url = formData.get("image_url") as string
    const website_url = formData.get("website_url") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string

    // Validar campos obrigatórios
    if (!name || !description || !image_url) {
      return { success: false, error: "Campos obrigatórios não preenchidos" }
    }

    // Buscar parceiro atual
    const { data: currentPartner, error: fetchError } = await supabase
      .from("partners")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Erro ao buscar parceiro:", fetchError)
      return { success: false, error: "Erro ao buscar parceiro" }
    }

    // Verificar se precisa atualizar o slug
    let slug = currentPartner.slug
    if (name !== currentPartner.name || city !== currentPartner.city) {
      // Gerar slug base
      const baseSlug = await generateEntitySlug(name || "parceiro", "parceiro", city || "", id)

      // Garantir que o slug seja único
      slug = await generateUniqueSlug(baseSlug, "partners", id)
    }

    // Atualizar parceiro
    const { data, error } = await supabase
      .from("partners")
      .update({
        name,
        description,
        image_url,
        website_url: website_url || null,
        city: city || null,
        state: state || null,
        slug,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Erro ao atualizar parceiro:", error)
      return { success: false, error: "Erro ao atualizar parceiro" }
    }

    // Revalidar páginas
    revalidatePath("/parceiros")
    revalidatePath("/admin/partners")
    revalidatePath(`/admin/partners/${id}/edit`)

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao atualizar parceiro:", error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}

// Excluir um parceiro
export async function deletePartner(id: string) {
  if (!(await isAdmin())) {
    return { success: false, error: "Não autorizado" }
  }

  const supabase = createServerComponentClient({ cookies })

  try {
    // Excluir parceiro
    const { error } = await supabase.from("partners").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir parceiro:", error)
      return { success: false, error: "Erro ao excluir parceiro" }
    }

    // Revalidar páginas
    revalidatePath("/parceiros")
    revalidatePath("/admin/partners")

    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir parceiro:", error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}
