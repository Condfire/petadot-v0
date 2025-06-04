"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

// Supabase client for auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)

// Export auth instance for direct access
export const auth = supabaseAuth.auth

// Types
export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export type AuthState = {
  user: User | null
  isLoading: boolean
  error: string | null
}

// Auth context
export const AuthContext = createContext<{
  user: User | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}>({
  user: null,
  isLoading: true,
  error: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  resetPassword: async () => ({ success: false }),
})

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState({
          user: {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata.name,
            avatar_url: session.user.user_metadata.avatar_url,
          },
          isLoading: false,
          error: null,
        })
      } else {
        setState({
          user: null,
          isLoading: false,
          error: null,
        })
      }
    })

    // Listen for auth changes
    const { data: authListener } = supabaseAuth.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setState({
          user: {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata.name,
            avatar_url: session.user.user_metadata.avatar_url,
          },
          isLoading: false,
          error: null,
        })
      } else {
        setState({
          user: null,
          isLoading: false,
          error: null,
        })
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setState({ ...state, error: error.message })
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setState({ ...state, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        setState({ ...state, error: error.message })
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setState({ ...state, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    await supabaseAuth.auth.signOut()
    router.push("/")
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        error: state.error,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
