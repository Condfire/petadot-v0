"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

// Tipos
export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  type?: string
  state?: string
  city?: string
  is_admin?: boolean
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
  ) => Promise<{ success: boolean; error?: string; userId?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Criar cliente Supabase uma única vez
const supabase = createClientComponentClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Função para verificar se o usuário é admin
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("is_admin, type").eq("id", userId).single()

      if (error) {
        console.warn("Erro ao verificar status de admin:", error.message)
        return false
      }

      // Verificar se é admin através do campo is_admin ou type
      return data?.is_admin === true || data?.type === "admin" || data?.type === "ngo_admin"
    } catch (error) {
      console.warn("Erro ao verificar status de admin:", error)
      return false
    }
  }

  // Função para atualizar dados do usuário
  const updateUserFromSession = async (currentSession: Session | null) => {
    if (currentSession?.user) {
      const supabaseUser = currentSession.user

      // Verificar status de admin
      const isAdmin = await checkAdminStatus(supabaseUser.id)

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0],
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        type: supabaseUser.user_metadata?.type || "regular",
        state: supabaseUser.user_metadata?.state,
        city: supabaseUser.user_metadata?.city,
        is_admin: isAdmin,
      })
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (mounted) {
          setSession(currentSession)
          await updateUserFromSession(currentSession)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Erro ao inicializar autenticação:", err)
        if (mounted) {
          setError("Erro ao inicializar autenticação")
          setIsLoading(false)
        }
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (mounted) {
        setSession(newSession)
        await updateUserFromSession(newSession)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        return { success: false, error: signInError.message }
      }
      return { success: true }
    } catch (e: any) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setIsLoading(false)
    }
  }

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
      return { success: true, userId: data.user?.id }
    } catch (e: any) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      router.push("/")
      router.refresh()
    } catch (e: any) {
      console.error("Erro ao fazer logout:", e)
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
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

  const value = { user, session, isLoading, error, signIn, signUp, signOut, resetPassword }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
