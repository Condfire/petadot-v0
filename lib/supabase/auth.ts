// Arquivo para centralizar funções de autenticação relacionadas ao Supabase
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"

// Cliente Supabase para autenticação
const supabase = createClientComponentClient()

// Função para verificar se o usuário é admin
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("users").select("is_admin, type").eq("id", userId).single()

    if (error) {
      console.error("Erro ao verificar status de admin:", error)
      return false
    }

    // Verificar se é admin através do campo is_admin ou type
    return data?.is_admin === true || data?.type === "admin" || data?.type === "ngo_admin"
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error)
    return false
  }
}

// Função para obter dados do usuário do banco
export async function getUserData(userId: string) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Erro ao buscar dados do usuário:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error)
    return null
  }
}

// Função para atualizar dados do usuário
export async function updateUserData(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

    if (error) {
      console.error("Erro ao atualizar dados do usuário:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Erro ao atualizar dados do usuário:", error)
    return { success: false, error: error.message }
  }
}
