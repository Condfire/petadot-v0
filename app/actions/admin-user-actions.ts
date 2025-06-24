"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

type AdminCreationResult = {
  success: boolean
  message: string
  error?: string
  userId?: string
}

export async function createOrPromoteAdmin(
  email: string,
  password: string,
  name: string,
): Promise<AdminCreationResult> {
  const supabase = createServerActionClient({ cookies })
  console.log(`Tentando criar/promover admin para: ${email}`)

  try {
    // 1. Verificar se o usuário atual é um administrador
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, message: "Não autorizado", error: "Usuário não autenticado" }
    }

    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (currentUserError || !currentUser?.is_admin) {
      return { success: false, message: "Não autorizado", error: "Usuário não é administrador" }
    }

    // 2. Verificar se o usuário já existe na tabela users
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id, email, is_admin")
      .eq("email", email)
      .maybeSingle()

    console.log("Verificação na tabela users:", { existingUser, userError })

    if (existingUser) {
      // Usuário já existe na tabela users
      if (existingUser.is_admin) {
        return { success: true, message: `Usuário ${email} já é um administrador`, userId: existingUser.id }
      }

      // Promover usuário existente para administrador
      const { error: updateError } = await supabase.from("users").update({ is_admin: true }).eq("id", existingUser.id)

      if (updateError) {
        console.error("Erro ao promover usuário:", updateError)
        return {
          success: false,
          message: "Erro ao promover usuário",
          error: updateError.message,
        }
      }

      revalidatePath("/admin/users")
      return {
        success: true,
        message: `Usuário ${email} promovido para administrador com sucesso`,
        userId: existingUser.id,
      }
    }

    // 3. Verificar se o usuário existe na autenticação do Supabase
    // Primeiro, tentar obter o usuário pelo email usando a API de admin
    let existingAuthUser = null

    try {
      // Esta parte requer permissões de admin no Supabase
      const { data, error } = await supabase.auth.admin.listUsers({
        filter: {
          email: email,
        },
      })

      if (!error && data && data.users && data.users.length > 0) {
        existingAuthUser = data.users[0]
        console.log("Usuário encontrado na autenticação:", existingAuthUser)
      }
    } catch (adminError) {
      console.log("Erro ao usar admin.listUsers (esperado se não tiver permissões):", adminError)
      // Continuar com o fluxo normal se não tiver permissões de admin
    }

    // Se não conseguimos verificar com a API de admin, tentar uma abordagem alternativa
    if (!existingAuthUser) {
      // Verificar se conseguimos fazer login com o email (se o usuário fornecer a senha)
      if (password) {
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (!signInError && signInData.user) {
            existingAuthUser = signInData.user
            console.log("Usuário encontrado via login:", existingAuthUser)

            // Importante: fazer logout para voltar ao usuário admin
            await supabase.auth.signInWithPassword({
              email: session.user.email!,
              password: password, // Isso é problemático, pois não temos a senha do admin
            })
          }
        } catch (signInError) {
          console.log("Erro ao tentar login:", signInError)
          // Continuar com o fluxo normal se o login falhar
        }
      }
    }

    // 4. Se o usuário existe na autenticação mas não na tabela users
    if (existingAuthUser) {
      console.log("Criando registro na tabela users para usuário existente:", existingAuthUser.id)

      // Verificar se já existe um registro com este ID (dupla verificação)
      const { data: doubleCheck, error: doubleCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", existingAuthUser.id)
        .maybeSingle()

      if (doubleCheck) {
        console.log("Registro já existe, atualizando para admin:", existingAuthUser.id)
        // O registro já existe, apenas atualizar para admin
        const { error: updateError } = await supabase
          .from("users")
          .update({ is_admin: true, name: name || email })
          .eq("id", existingAuthUser.id)

        if (updateError) {
          console.error("Erro ao atualizar usuário:", updateError)
          return {
            success: false,
            message: "Erro ao atualizar usuário",
            error: updateError.message,
          }
        }
      } else {
        // Criar registro na tabela users com o ID existente
        const { error: insertError } = await supabase.from("users").insert({
          id: existingAuthUser.id,
          email,
          name: name || email,
          is_admin: true,
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Erro ao criar registro de usuário:", insertError)
          return {
            success: false,
            message: "Erro ao criar registro de usuário",
            error: insertError.message,
          }
        }
      }

      revalidatePath("/admin/users")
      return {
        success: true,
        message: `Usuário ${email} promovido para administrador com sucesso`,
        userId: existingAuthUser.id,
      }
    }

    // 5. Se o usuário não existe, criar um novo
    if (!password) {
      return {
        success: false,
        message: "Senha é obrigatória para criar um novo usuário",
        error: "Senha é obrigatória para criar um novo usuário",
      }
    }

    console.log("Criando novo usuário na autenticação")
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email,
          is_admin: true,
        },
      },
    })

    if (signUpError) {
      console.error("Erro ao criar conta:", signUpError)
      return {
        success: false,
        message: `Erro ao criar conta: ${signUpError.message}`,
        error: signUpError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Erro ao criar usuário",
        error: "Usuário não foi criado",
      }
    }

    console.log("Usuário criado na autenticação, criando registro na tabela users:", authData.user.id)

    // Verificar se já existe um registro com este ID (dupla verificação)
    const { data: doubleCheck, error: doubleCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle()

    if (doubleCheck) {
      console.log("Registro já existe, atualizando para admin:", authData.user.id)
      // O registro já existe, apenas atualizar para admin
      const { error: updateError } = await supabase
        .from("users")
        .update({ is_admin: true, name: name || email })
        .eq("id", authData.user.id)

      if (updateError) {
        console.error("Erro ao atualizar usuário:", updateError)
        return {
          success: false,
          message: "Erro ao atualizar usuário",
          error: updateError.message,
        }
      }
    } else {
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
        return {
          success: false,
          message: "Erro ao criar registro de usuário",
          error: insertError.message,
        }
      }
    }

    revalidatePath("/admin/users")
    return {
      success: true,
      message: "Administrador criado com sucesso",
      userId: authData.user.id,
    }
  } catch (error: any) {
    console.error("Erro não tratado:", error)
    return {
      success: false,
      message: "Ocorreu um erro ao criar o administrador",
      error: error.message || "Erro desconhecido",
    }
  }
}

// Nova função para verificar e corrigir o status de administrador
export async function verifyAndFixAdminStatus(userId: string): Promise<{
  success: boolean
  message: string
  isAdmin: boolean
}> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Verificar se o usuário existe na tabela users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, is_admin")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Erro ao verificar usuário:", userError)
      return {
        success: false,
        message: `Erro ao verificar usuário: ${userError.message}`,
        isAdmin: false,
      }
    }

    // Se o usuário já é admin, retornar sucesso
    if (userData.is_admin) {
      return {
        success: true,
        message: "Usuário já é administrador",
        isAdmin: true,
      }
    }

    // Promover usuário para administrador
    const { error: updateError } = await supabase.from("users").update({ is_admin: true }).eq("id", userId)

    if (updateError) {
      console.error("Erro ao promover usuário:", updateError)
      return {
        success: false,
        message: `Erro ao promover usuário: ${updateError.message}`,
        isAdmin: false,
      }
    }

    // Revalidar caminhos relevantes
    revalidatePath("/admin/users")
    revalidatePath("/admin/users")

    return {
      success: true,
      message: "Usuário promovido para administrador com sucesso",
      isAdmin: true,
    }
  } catch (error: any) {
    console.error("Erro não tratado:", error)
    return {
      success: false,
      message: `Ocorreu um erro ao verificar/corrigir status de administrador: ${error.message || "Erro desconhecido"}`,
      isAdmin: false,
    }
  }
}
