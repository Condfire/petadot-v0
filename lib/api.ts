import { createClient } from "@supabase/supabase-js"
import type { Evento } from "@/app/eventos/types" // Importar o tipo Evento

// Certifique-se de que as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.",
  )
}

export const api = createClient(supabaseUrl, supabaseAnonKey)

export async function getEvents(): Promise<Evento[]> {
  const { data, error } = await api.from("eventos").select("*").order("data", { ascending: false })

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }
  return data || []
}
