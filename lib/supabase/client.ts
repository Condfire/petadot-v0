import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types" // Corrected import path for Database type

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create a singleton client instance
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function createClientComponentClient() {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
      global: {
        headers: {
          "X-Client-Info": "petadot-web",
        },
      },
    })
  }
  return supabaseClient
}

// Export the client instance
export const supabase = createClientComponentClient()

// Default export
export default supabase
