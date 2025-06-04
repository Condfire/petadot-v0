import { createClient } from "@supabase/supabase-js"
import { isUuid } from "./slug-utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

/**
 * Busca um registro pelo slug ou ID
 * @param table Nome da tabela
 * @param slugOrId Slug ou ID do registro
 * @returns O registro encontrado ou null
 */
export async function getBySlugOrId(table: string, slugOrId: string) {
  try {
    if (!slugOrId) {
      console.error("Slug ou ID não fornecido")
      return null
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const isUuidValue = isUuid(slugOrId)
    const field = isUuidValue ? "id" : "slug"

    console.log(`Buscando ${table} por ${field}:`, slugOrId)

    const { data, error } = await supabase.from(table).select("*").eq(field, slugOrId).maybeSingle()

    if (error) {
      console.error(`Erro ao buscar ${table} por ${field}:`, error)
      return null
    }

    if (!data) {
      console.log(`${table} não encontrado com ${field}:`, slugOrId)
      return null
    }

    return data
  } catch (error) {
    console.error(`Erro ao buscar ${table} por slug ou ID:`, error)
    return null
  }
}
