import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Re-export createClient para resolver o erro de exportação
export { createClient }

export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export const createAnonClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
