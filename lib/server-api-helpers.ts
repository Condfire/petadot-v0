import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Criar cliente Supabase com service role key para operações de servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Verifica se o usuário está autenticado
 * @param request Requisição
 * @returns Resposta com erro se não autenticado, ou objeto com usuário se autenticado
 */
export async function checkAuth(request: Request) {
  try {
    // Obter token de autorização do cabeçalho
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
      }
    }

    const token = authHeader.split(" ")[1]

    // Verificar token
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return {
        error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
      }
    }

    return { user: data.user }
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return {
      error: NextResponse.json({ error: "Erro ao verificar autenticação" }, { status: 500 }),
    }
  }
}

/**
 * Verifica se o usuário é administrador
 * @param userId ID do usuário
 * @returns Verdadeiro se o usuário for administrador, falso caso contrário
 */
export async function isAdmin(userId: string) {
  try {
    const { data, error } = await supabase.from("users").select("user_type").eq("id", userId).single()

    if (error || !data) {
      return false
    }

    return data.user_type === "admin"
  } catch (error) {
    console.error("Erro ao verificar se o usuário é administrador:", error)
    return false
  }
}

/**
 * Verifica se o usuário é dono de uma ONG
 * @param userId ID do usuário
 * @param ongId ID da ONG
 * @returns Verdadeiro se o usuário for dono da ONG, falso caso contrário
 */
export async function isOngOwner(userId: string, ongId: string) {
  try {
    const { data, error } = await supabase.from("ongs").select("user_id").eq("id", ongId).single()

    if (error || !data) {
      return false
    }

    return data.user_id === userId
  } catch (error) {
    console.error("Erro ao verificar se o usuário é dono da ONG:", error)
    return false
  }
}

/**
 * Verifica se o usuário é dono de um pet
 * @param userId ID do usuário
 * @param petId ID do pet
 * @param petType Tipo do pet (adoption, lost, found)
 * @returns Verdadeiro se o usuário for dono do pet, falso caso contrário
 */
export async function isPetOwner(userId: string, petId: string, petType: "adoption" | "lost" | "found") {
  try {
    // All pets are now in the 'pets' table, differentiated by 'category'
    const { data, error } = await supabase.from("pets").select("user_id, category").eq("id", petId).single()

    if (error || !data) {
      return false
    }

    // Check if the user_id matches and the category is correct
    return data.user_id === userId && data.category === petType
  } catch (error) {
    console.error("Erro ao verificar se o usuário é dono do pet:", error)
    return false
  }
}

/**
 * Verifica se o usuário é dono de uma história
 * @param userId ID do usuário
 * @param storyId ID da história
 * @returns Verdadeiro se o usuário for dono da história, falso caso contrário
 */
export async function isStoryOwner(userId: string, storyId: string) {
  try {
    const { data, error } = await supabase.from("pet_stories").select("user_id").eq("id", storyId).single()

    if (error || !data) {
      return false
    }

    return data.user_id === userId
  } catch (error) {
    console.error("Erro ao verificar se o usuário é dono da história:", error)
    return false
  }
}

/**
 * Verifica se o usuário é dono de um evento
 * @param userId ID do usuário
 * @param eventId ID do evento
 * @returns Verdadeiro se o usuário for dono do evento, falso caso contrário
 */
export async function isEventOwner(userId: string, eventId: string) {
  try {
    const { data, error } = await supabase.from("events").select("user_id").eq("id", eventId).single()

    if (error || !data) {
      return false
    }

    return data.user_id === userId
  } catch (error) {
    console.error("Erro ao verificar se o usuário é dono do evento:", error)
    return false
  }
}
