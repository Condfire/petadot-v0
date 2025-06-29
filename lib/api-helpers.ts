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
