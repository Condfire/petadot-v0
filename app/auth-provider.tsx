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

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (mounted) {
          setSession(currentSession)
          if (currentSession?.user) {
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || "",
              name: currentSession.user.user_metadata?.name || currentSession.user.email?.split("@")[0],
              avatar_url: currentSession.user.user_metadata?.avatar_url,
              type: currentSession.user.user_metadata?.type || "regular",
              state: currentSession.user.user_metadata?.state,
              city: currentSession.user.user_metadata?.city,
            })
          }
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
        if (newSession?.user) {
          setUser({
            id: newSession.user.id,
            email: newSession.user.email || "",
            name: newSession.user.user_metadata?.name || newSession.user.email?.split("@")[0],
            avatar_url: newSession.user.user_metadata?.avatar_url,
            type: newSession.user.user_metadata?.type || "regular",
            state: newSession.user.user_metadata?.state,
            city: newSession.user.user_metadata?.city,
          })
        } else {
          setUser(null)
        }
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
