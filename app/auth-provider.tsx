"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log("🔐 Inicializando AuthProvider...")

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Erro ao obter sessão inicial:", error)
        } else {
          console.log("✅ Sessão inicial obtida:", session?.user?.id || "sem usuário")
        }

        if (isMounted) {
          setUser(session?.user ?? null)
          setIsLoading(false)
          setIsInitialized(true)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("🔄 Auth state changed:", event, session?.user?.id || "sem usuário")

          if (isMounted) {
            setUser(session?.user ?? null)
            setIsLoading(false)
          }
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("❌ Erro na inicialização do auth:", error)
        if (isMounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array to run only once

  const signOut = async () => {
    try {
      console.log("🚪 Fazendo logout...")
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error)
    }
  }

  const value = {
    user,
    isLoading,
    isInitialized,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
