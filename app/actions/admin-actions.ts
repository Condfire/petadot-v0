"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Função para verificar se um usuário existe na autenticação
export async function checkUserExists(email: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar se o usuário que está fazendo a requisição é um administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser?.is_admin) {
      return { success: false, error: "Usuário não autorizado" }
    }

    // Verificar se o usuário já existe na tabela users
    const { data: existingUser, error: searchError } = await supabase
      .from("users")
      .select("id, email, is_admin")
      .eq("email", email)
      .maybeSingle()

    if (searchError && searchError.code !== "PGRST116") {
      console.error("Erro ao verificar usuário existente:", searchError)
      return { success: false, error: "Erro ao verificar usuário existente" }
    }

    // Se o usuário já existe na tabela users
    if (existingUser) {
      return {
        success: true,
        exists: true,
        isAdmin: existingUser.is_admin,
        userId: existingUser.id,
      }
    }

    // Se o usuário não existe na tabela users, verificar na autenticação
    // Isso é mais complexo e geralmente requer acesso admin ao Supabase
    // que não está disponível via API pública

    return { success: true, exists: false }
  } catch (error) {
    console.error("Erro ao verificar usuário:", error)
    return { success: false, error: "Erro ao verificar usuário" }
  }
}

// Função para promover um usuário existente para administrador
export async function promoteToAdmin(userId: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar se o usuário que está fazendo a requisição é um administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser?.is_admin) {
      return { success: false, error: "Usuário não autorizado" }
    }

    // Promover usuário para administrador
    const { error: updateError } = await supabase.from("users").update({ is_admin: true }).eq("id", userId)

    if (updateError) {
      console.error("Erro ao promover usuário para administrador:", updateError)
      return { success: false, error: "Erro ao promover usuário para administrador" }
    }

    // Revalidar página de usuários
    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Erro ao promover usuário:", error)
    return { success: false, error: "Erro ao promover usuário" }
  }
}

// Função para criar um novo usuário administrador
export async function createAdminUser(email: string, password: string, name: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar se o usuário que está fazendo a requisição é um administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (adminError || !adminUser?.is_admin) {
      return { success: false, error: "Usuário não autorizado" }
    }

    // Verificar se o usuário já existe
    const { data: existingUser, error: searchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (searchError && searchError.code !== "PGRST116") {
      console.error("Erro ao verificar usuário existente:", searchError)
      return { success: false, error: "Erro ao verificar usuário existente" }
    }

    if (existingUser) {
      return { success: false, error: "Usuário já existe" }
    }

    // Criar novo usuário na autenticação
    // Nota: Isso geralmente requer acesso admin ao Supabase que não está disponível via API pública
    // Em um ambiente real, você pode precisar usar uma função serverless ou API personalizada

    // Para fins de demonstração, vamos usar o método signUp normal
    // Isso criará um usuário não confirmado que precisará verificar o email
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email,
        },
      },
    })

    if (signUpError) {
      console.error("Erro ao criar conta:", signUpError)
      return { success: false, error: `Erro ao criar conta: ${signUpError.message}` }
    }

    if (!authData.user) {
      return { success: false, error: "Erro ao criar usuário" }
    }

    // Criar registro na tabela users
    const { error: insertError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      name: name || email,
      is_admin: true,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Erro ao criar registro de usuário:", insertError)
      return { success: false, error: `Erro ao criar registro de usuário: ${insertError.message}` }
    }

    // Revalidar página de usuários
    revalidatePath("/admin/users")

    return { success: true, userId: authData.user.id }
  } catch (error) {
    console.error("Erro ao criar administrador:", error)
    return { success: false, error: "Erro ao criar administrador" }
  }
}
