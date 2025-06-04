import { createClient } from "@supabase/supabase-js"
import { LRUCache } from "lru-cache"

// Configuração do cache
const cache = new LRUCache<string, any>({
  max: 500, // Máximo de 500 itens no cache
  ttl: 1000 * 60 * 5, // 5 minutos de TTL
})

// Função para criar um cliente Supabase com cache
export function createCachedSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Sobrescrever o método select para adicionar cache
  const originalSelect = supabase.from("").select

  // @ts-ignore - Sobrescrever o método select
  supabase.from = function (table: string) {
    const result = Object.create(this)

    // Sobrescrever o método select
    result.select = function (columns: string) {
      const selectResult = originalSelect.call(this, columns)

      // Sobrescrever o método get para adicionar cache
      const originalGet = selectResult.then

      selectResult.then = async function (onFulfilled: any, onRejected: any) {
        // Gerar uma chave de cache baseada na query
        const cacheKey = `${table}:${columns}:${JSON.stringify(this.query)}`

        // Verificar se o resultado está em cache
        const cachedResult = cache.get(cacheKey)

        if (cachedResult) {
          console.log(`[Cache] Hit: ${cacheKey}`)
          return Promise.resolve(cachedResult).then(onFulfilled, onRejected)
        }

        // Se não estiver em cache, fazer a requisição
        console.log(`[Cache] Miss: ${cacheKey}`)
        const result = await originalGet.call(this, onFulfilled, onRejected)

        // Armazenar o resultado em cache se for bem-sucedido
        if (result && !result.error) {
          cache.set(cacheKey, result)
        }

        return result
      }

      return selectResult
    }

    return result
  }

  return supabase
}

// Função para limpar o cache
export function clearCache() {
  cache.clear()
}

// Função para invalidar uma chave específica do cache
export function invalidateCache(key: string) {
  const keys = Array.from(cache.keys() as Iterable<string>)

  keys.forEach((cacheKey) => {
    if (cacheKey.includes(key)) {
      cache.delete(cacheKey)
    }
  })
}
