import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Cliente Supabase singleton para componentes client-side
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}

// Exportar cliente para uso direto
export const supabase = getSupabaseClient()
