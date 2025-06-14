"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useMemo } from "react"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Adicionando o hook useSupabaseClient
export function useSupabaseClient() {
  return useMemo(() => createClient(), [])
}
