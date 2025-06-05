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
  type?: string // 'regular', 'ngo_admin', 'admin'
  state?: string
  city?: string
  // role?: string; // 'type' is more specific for this project
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    name: string,
    userType?: string,
    state?: string,
    city?: string,
  ) => Promise<{ success: boolean; error?: string; userId?: string }> // Modified for more data
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

// Criando o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Criar cliente Supabase uma única vez
const supabase = createClientComponentClient()

// Provider de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const initCalled = useRef(false)
  const authListenerSetup = useRef(false)

  // Função para sincronizar o usuário com o banco de dados
  const syncUserWithDatabase = async (supabaseUser: SupabaseUser) => {
    try {
      const userMetadata = supabaseUser.user_metadata
      const userDataToInsertOrUpdate = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: userMetadata?.name || supabaseUser.email?.split("@")[0],
        type: userMetadata?.type || "regular",
        state: userMetadata?.state,
        city: userMetadata?.city,
        avatar_url: userMetadata?.avatar_url, // Sync avatar_url from metadata if present
        updated_at: new Date().toISOString(),
      }

      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", supabaseUser.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116: no rows found
        console.error("Erro ao verificar usuário existente:", checkError)
        return
      }

      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from("users")
          .update(userDataToInsertOrUpdate)
          .eq("id", supabaseUser.id)
        if (updateError) console.error("Erro ao atualizar usuário:", updateError)
      } else {
        // Insert new user
        const { error: insertError } = await supabase
          .from("users")
          .insert({ ...userDataToInsertOrUpdate, created_at: new Date().toISOString() })
        if (insertError) console.error("Erro ao criar usuário:", insertError)
      }
    } catch (error) {
      console.error("Erro ao sincronizar usuário com banco de dados:", error)
    }
  }

  // Função para atualizar o estado do usuário a partir da sessão
  const updateUserFromSession = async (currentSession: Session | null) => {
    if (currentSession?.user) {
      const supabaseUser = currentSession.user
      await syncUserWithDatabase(supabaseUser) // Ensure DB is synced first

      try {
        const { data: userDataFromDb, error: userDbError } = await supabase
          .from("users")
          .select("id, email, name, avatar_url, type, state, city") // Fetch all relevant fields
          .eq("id", supabaseUser.id)
          .single()

        if (userDbError && userDbError.code !== "PGRST116") {
          console.error("Erro ao buscar dados do usuário no DB:", userDbError)
        }

        const finalUserData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: userDataFromDb?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0],
          avatar_url: userDataFromDb?.avatar_url || supabaseUser.user_metadata?.avatar_url,
          type: userDataFromDb?.type || supabaseUser.user_metadata?.type || "regular",
          state: userDataFromDb?.state || supabaseUser.user_metadata?.state,
          city: userDataFromDb?.city || supabaseUser.user_metadata?.city,
        }
        setUser(finalUserData)
      } catch (error) {
        console.error("Erro ao atualizar usuário a partir da sessão:", error)
        // Fallback to auth metadata if DB fetch fails
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0],
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          type: supabaseUser.user_metadata?.type || "regular",
          state: supabaseUser.user_metadata?.state,
          city: supabaseUser.user_metadata?.city,
        })
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
    } catch (e) {
      console.error("Erro ao inicializar autenticação:", e)
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
      setSession(newSession)
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        if (newSession) await updateUserFromSession(newSession)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Função de login
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        return { success: false, error: signInError.message }
      }
      // onAuthStateChange will handle setting user and session
      return { success: true }
    } catch (e: any) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Função de cadastro
  const signUp = async (
    email: string,
    password: string,
    name: string,
    userType = "regular",
    state?: string,
    city?: string,
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const metadata: any = { name, type: userType }
      if (state) metadata.state = state
      if (city) metadata.city = city

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })
      if (signUpError) {
        setError(signUpError.message)
        return { success: false, error: signUpError.message }
      }
      // User will be created in auth.users, onAuthStateChange and syncUserWithDatabase will handle public.users
      return { success: true, userId: data.user?.id }
    } catch (e: any) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const signOut = async () => {
    setIsLoading(true)
    try {
      // Clear local storage items related to Supabase
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            localStorage.removeItem(key)
          }
        })
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            sessionStorage.removeItem(key)
          }
        })
      }

      const { error: signOutError } = await supabase.auth.signOut({ scope: "global" }) // Ensure global sign out
      if (signOutError) throw signOutError

      setUser(null) // Explicitly set user to null
      setSession(null) // Explicitly set session to null
      router.push("/") // Redirect to home
      router.refresh() // Force refresh to clear any cached user data on client
    } catch (e: any) {
      console.error("Erro ao fazer logout:", e)
      setError(e.message)
      // Still attempt to clear client state and redirect
      setUser(null)
      setSession(null)
      router.push("/")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  // Função de recuperação de senha
  const resetPassword = async (email: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/reset-password`, // Updated redirectTo
      })
      if (resetError) {
        setError(resetError.message)
        return { success: false, error: resetError.message }
      }
      return { success: true }
    } catch (e: any) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Valor do contexto
  const value = { user, session, isLoading, error, signIn, signUp, signOut, resetPassword }

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
