/**
 * Utilitário para lidar com limitações de taxa (rate limiting) e erros de rede
 */

// Configurações para retry
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  factor: 2, // Fator de backoff exponencial
}

/**
 * Função para calcular o tempo de espera com backoff exponencial
 */
export function calculateBackoff(attempt: number): number {
  const delay = Math.min(RETRY_CONFIG.maxDelay, RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.factor, attempt))
  // Adicionar um pouco de aleatoriedade (jitter) para evitar thundering herd
  return delay * (0.8 + Math.random() * 0.4)
}

/**
 * Verifica se um erro é devido a limitação de taxa (429 Too Many Requests)
 */
export function isRateLimitError(error: any): boolean {
  // Verificar mensagem de erro
  if (typeof error?.message === "string") {
    return error.message.includes("Too Many R") || error.message.includes("429") || error.message.includes("rate limit")
  }

  // Verificar código de status
  if (error?.status === 429 || error?.statusCode === 429) {
    return true
  }

  return false
}

/**
 * Função para executar uma operação com retry em caso de erro de limitação de taxa
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    onRetry?: (attempt: number, error: any, delay: number) => void
    maxRetries?: number
  } = {},
): Promise<T> {
  const maxRetries = options.maxRetries || RETRY_CONFIG.maxRetries

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Se não for um erro de limitação de taxa ou se for a última tentativa, lançar o erro
      if (!isRateLimitError(error) || attempt === maxRetries) {
        throw error
      }

      // Calcular tempo de espera
      const delay = calculateBackoff(attempt)

      // Notificar sobre a tentativa de retry
      if (options.onRetry) {
        options.onRetry(attempt + 1, error, delay)
      } else {
        console.warn(
          `Erro de limitação de taxa. Tentando novamente em ${delay}ms (tentativa ${attempt + 1}/${maxRetries})`,
          error,
        )
      }

      // Esperar antes de tentar novamente
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // Este ponto não deveria ser alcançado, mas para satisfazer o TypeScript
  throw lastError
}

// Funções de autenticação e verificação
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Criar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const { data, error } = await supabase.from("users").select("is_admin").eq("id", userId).single()

    if (error || !data) {
      return false
    }

    return !!data.is_admin
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
    let table = ""
    switch (petType) {
      case "adoption":
        table = "pets"
        break
      case "lost":
        table = "pets_lost"
        break
      case "found":
        table = "pets_found"
        break
      default:
        return false
    }

    const { data, error } = await supabase.from(table).select("user_id").eq("id", petId).single()

    if (error || !data) {
      return false
    }

    return data.user_id === userId
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
