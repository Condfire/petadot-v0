import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/types"

// Singleton pattern to ensure we only create one client instance
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    })
  }
  return supabaseInstance
}

// Create and export a default client instance
export const supabase = createClient()

// Export default
export default supabase
