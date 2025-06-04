"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

// Tipos
export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role?: string
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

// Criando o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Singleton para o cliente Supabase
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }
  return supabaseInstance
}

// Provider de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()
  const initCalled = useRef(false)
  const authListenerSetup = useRef(false)

  // Função para sincronizar o usuário com o banco de dados
  const syncUserWithDatabase = async (supabaseUser: SupabaseUser) => {
    try {
      // Verificar se o usuário existe no banco de dados
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseUser.id)
        .single()

      if (userError && userError.code !== "PGRST116") {
        console.error("Erro ao buscar usuário:", userError)
        return
      }

      // Se o usuário não existir, criá-lo
      if (!userData) {
        const { error: insertError } = await supabase.from("users").insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0],
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Erro ao criar usuário:", insertError)
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar usuário:", error)
    }
  }

  // Função para atualizar o estado do usuário a partir da sessão
  const updateUserFromSession = async (currentSession: Session | null) => {
    if (currentSession?.user) {
      const supabaseUser = currentSession.user

      // Buscar dados adicionais do usuário no banco de dados
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", supabaseUser.id)
          .single()

        if (userError && userError.code !== "PGRST116") {
          console.error("Erro ao buscar dados adicionais do usuário:", userError)
        }

        // Atualizar o estado do usuário com dados do Supabase Auth e do banco de dados
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: supabaseUser.user_metadata?.name || userData?.name || supabaseUser.email?.split("@")[0],
          avatar_url: supabaseUser.user_metadata?.avatar_url || userData?.avatar_url,
          role: userData?.role || "user",
        })

        // Sincronizar usuário com o banco de dados
        await syncUserWithDatabase(supabaseUser)
      } catch (error) {
        console.error("Erro ao atualizar usuário a partir da sessão:", error)
      }
    } else {
      setUser(null)
    }
  }

  // Inicialização da autenticação
  const initializeAuth = async () => {
    if (initCalled.current) return
    initCalled.current = true

    try {
      setIsLoading(true)
      console.log("Inicializando autenticação...")

      // Obter sessão atual
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      // Atualizar estado da sessão
      setSession(data.session)

      // Atualizar estado do usuário a partir da sessão
      if (data.session) {
        await updateUserFromSession(data.session)
      }
    } catch (error) {
      console.error("Erro ao inicializar autenticação:", error)
      setError("Falha ao inicializar autenticação")
    } finally {
      setIsLoading(false)
    }
  }

  // Configurar listener de mudanças de autenticação
  const setupAuthListener = () => {
    if (authListenerSetup.current) return
    authListenerSetup.current = true

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`Evento de autenticação: ${event}`)

      // Atualizar estado da sessão
      setSession(newSession)

      // Atualizar estado do usuário com base no evento
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        if (newSession) {
          await updateUserFromSession(newSession)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    // Retornar função de limpeza
    return () => {
      authListener.subscription.unsubscribe()
    }
  }

  // Efeito para inicializar autenticação e configurar listener
  useEffect(() => {
    // Inicializar autenticação
    initializeAuth()

    // Configurar listener de mudanças de autenticação
    const cleanup = setupAuthListener()

    // Definir um timeout para garantir que isLoading não fique preso
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Timeout de inicialização de autenticação")
        setIsLoading(false)
      }
    }, 5000)

    // Limpar listener e timeout
    return () => {
      if (cleanup) cleanup()
      clearTimeout(timeoutId)
    }
  }, [])

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // A sessão e o usuário serão atualizados pelo listener onAuthStateChange
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao fazer login"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Função de cadastro
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar conta"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const signOut = async () => {
    try {
      setIsLoading(true)

      // Limpar cookies e localStorage relacionados à autenticação
      if (typeof window !== "undefined") {
        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.trim().split("=")
          if (name.includes("supabase") || name.includes("sb-")) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          }
        })

        Object.keys(localStorage).forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            localStorage.removeItem(key)
          }
        })

        Object.keys(sessionStorage).forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            sessionStorage.removeItem(key)
          }
        })
      }

      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut({ scope: "global" })

      if (error) {
        throw error
      }

      // Atualizar estado
      setUser(null)
      setSession(null)

      // Redirecionar para a página inicial
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)

      // Mesmo com erro, limpar o estado
      setUser(null)
      setSession(null)

      // Redirecionar para a página inicial
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  // Função de recuperação de senha
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao recuperar senha"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Valor do contexto
  const value = {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

// Exportar cliente Supabase para acesso direto
export const supabaseClient = getSupabaseClient()
