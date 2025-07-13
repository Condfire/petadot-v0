"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

// Enhanced User type with additional fields
export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  type?: string // 'regular', 'ngo_admin', 'admin'
  state?: string
  city?: string
  provider?: string // 'email', 'google', etc.
  email_verified?: boolean
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
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
  refreshSession: () => Promise<void>
  clearError: () => void
  isAuthenticated: boolean
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Singleton for the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }
  return supabaseInstance
}

// Enhanced AuthProvider with Google authentication and better session management
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Refs to prevent multiple initializations and cleanup
  const initCalled = useRef(false)
  const authListenerRef = useRef<{ subscription: { unsubscribe: () => void } } | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear any existing error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Enhanced session refresh with retry logic
  const refreshSession = useCallback(async () => {
    try {
      console.log("Refreshing session...")
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.warn("Session refresh failed:", error.message)
        // Try to get current session as fallback
        const { data: currentSession } = await supabase.auth.getSession()
        if (currentSession.session) {
          setSession(currentSession.session)
          return currentSession.session
        }
        return null
      }

      if (data.session) {
        setSession(data.session)
        console.log("Session refreshed successfully")
        return data.session
      }

      return null
    } catch (error) {
      console.error("Session refresh error:", error)
      return null
    }
  }, [supabase])

  // Sync user with database with retry logic
  const syncUserWithDatabase = useCallback(
    async (supabaseUser: SupabaseUser, retries = 3): Promise<void> => {
      try {
        const userMetadata = supabaseUser.user_metadata
        const appMetadata = supabaseUser.app_metadata

        // Extract provider information
        const provider = appMetadata?.provider || supabaseUser.app_metadata?.providers?.[0] || "email"

        const userDataToSync = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: userMetadata?.full_name || userMetadata?.name || supabaseUser.email?.split("@")[0],
          type: userMetadata?.type || "regular",
          state: userMetadata?.state,
          city: userMetadata?.city,
          avatar_url: userMetadata?.avatar_url || userMetadata?.picture,
          provider: provider,
          email_verified: supabaseUser.email_confirmed_at ? true : false,
          updated_at: new Date().toISOString(),
        }

        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id, type")
          .eq("id", supabaseUser.id)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError
        }

        if (existingUser) {
          // Update existing user, but preserve existing type if not set in metadata
          const updateData = { ...userDataToSync }
          if (!userMetadata?.type && existingUser.type) {
            updateData.type = existingUser.type
          }

          const { error: updateError } = await supabase.from("users").update(updateData).eq("id", supabaseUser.id)

          if (updateError) throw updateError
        } else {
          // Insert new user
          const { error: insertError } = await supabase
            .from("users")
            .insert({ ...userDataToSync, created_at: new Date().toISOString() })

          if (insertError) throw insertError
        }
      } catch (error) {
        console.error("Error syncing user with database:", error)

        // Retry logic
        if (retries > 0) {
          console.log(`Retrying user sync... (${retries} attempts left)`)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return syncUserWithDatabase(supabaseUser, retries - 1)
        }

        console.error("Failed to sync user after all retries")
      }
    },
    [supabase],
  )

  // Update user state from session
  const updateUserFromSession = useCallback(
    async (currentSession: Session | null) => {
      if (currentSession?.user) {
        const supabaseUser = currentSession.user

        // Sync with database first
        await syncUserWithDatabase(supabaseUser)

        try {
          // Fetch user data from database
          const { data: userDataFromDb, error: userDbError } = await supabase
            .from("users")
            .select("id, email, name, avatar_url, type, state, city, provider")
            .eq("id", supabaseUser.id)
            .single()

          if (userDbError && userDbError.code !== "PGRST116") {
            console.warn("Error fetching user from database:", userDbError)
          }

          // Extract provider info
          const provider = supabaseUser.app_metadata?.provider || supabaseUser.app_metadata?.providers?.[0] || "email"

          // Create final user object
          const finalUserData: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name:
              userDataFromDb?.name ||
              supabaseUser.user_metadata?.full_name ||
              supabaseUser.user_metadata?.name ||
              supabaseUser.email?.split("@")[0],
            avatar_url:
              userDataFromDb?.avatar_url ||
              supabaseUser.user_metadata?.avatar_url ||
              supabaseUser.user_metadata?.picture,
            type: userDataFromDb?.type || supabaseUser.user_metadata?.type || "regular",
            state: userDataFromDb?.state || supabaseUser.user_metadata?.state,
            city: userDataFromDb?.city || supabaseUser.user_metadata?.city,
            provider: provider,
            email_verified: supabaseUser.email_confirmed_at ? true : false,
          }

          setUser(finalUserData)
        } catch (error) {
          console.error("Error updating user from session:", error)

          // Fallback to auth metadata if DB fetch fails
          const provider = supabaseUser.app_metadata?.provider || supabaseUser.app_metadata?.providers?.[0] || "email"

          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name:
              supabaseUser.user_metadata?.full_name ||
              supabaseUser.user_metadata?.name ||
              supabaseUser.email?.split("@")[0],
            avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
            type: supabaseUser.user_metadata?.type || "regular",
            state: supabaseUser.user_metadata?.state,
            city: supabaseUser.user_metadata?.city,
            provider: provider,
            email_verified: supabaseUser.email_confirmed_at ? true : false,
          })
        }
      } else {
        setUser(null)
      }
    },
    [supabase, syncUserWithDatabase],
  )

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback(
    (session: Session) => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      if (session.expires_at) {
        const expiresAt = session.expires_at * 1000
        const now = Date.now()
        const refreshTime = expiresAt - now - 60000 // Refresh 1 minute before expiry

        if (refreshTime > 0) {
          refreshTimeoutRef.current = setTimeout(async () => {
            console.log("Auto-refreshing token...")
            await refreshSession()
          }, refreshTime)
        }
      }
    },
    [refreshSession],
  )

  // Initialize authentication - CORRIGIDO PARA EVITAR LOOP
  const initializeAuth = useCallback(async () => {
    if (initCalled.current) return
    initCalled.current = true

    try {
      setIsLoading(true)
      console.log("Initializing authentication...")

      // Get current session
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        setError(error.message)
      } else {
        setSession(data.session)
        if (data.session) {
          await updateUserFromSession(data.session)
          scheduleTokenRefresh(data.session)
        }
      }
    } catch (e) {
      console.error("Error initializing authentication:", e)
      setError("Failed to initialize authentication")
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [supabase, updateUserFromSession, scheduleTokenRefresh])

  // Setup auth state listener - CORRIGIDO PARA EVITAR LOOP
  const setupAuthListener = useCallback(() => {
    if (authListenerRef.current) return

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email)

      setSession(newSession)

      switch (event) {
        case "SIGNED_IN":
          if (newSession) {
            await updateUserFromSession(newSession)
            scheduleTokenRefresh(newSession)
            clearError()

            toast({
              title: "Login realizado com sucesso!",
              description: `Bem-vindo${newSession.user?.user_metadata?.name ? `, ${newSession.user.user_metadata.name}` : ""}!`,
            })
          }
          break

        case "SIGNED_OUT":
          setUser(null)
          clearError()
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current)
          }

          toast({
            title: "Logout realizado",
            description: "Você foi desconectado com sucesso.",
          })
          break

        case "TOKEN_REFRESHED":
          if (newSession) {
            await updateUserFromSession(newSession)
            scheduleTokenRefresh(newSession)
            console.log("Token refreshed successfully")
          }
          break

        case "USER_UPDATED":
          if (newSession) {
            await updateUserFromSession(newSession)
            console.log("User updated")
          }
          break

        case "PASSWORD_RECOVERY":
          toast({
            title: "Email de recuperação enviado",
            description: "Verifique sua caixa de entrada para redefinir sua senha.",
          })
          break
      }
    })

    authListenerRef.current = authListener
    return authListener
  }, [supabase, updateUserFromSession, scheduleTokenRefresh, clearError])

  // Initialize auth on mount - CORRIGIDO PARA EVITAR LOOP
  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (mounted) {
        await initializeAuth()
        setupAuthListener()
      }
    }

    init()

    // Cleanup function
    return () => {
      mounted = false
      if (authListenerRef.current) {
        authListenerRef.current.subscription.unsubscribe()
        authListenerRef.current = null
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }
      // Reset init flag when component unmounts
      initCalled.current = false
    }
  }, []) // Dependências vazias para evitar loop

  // Email/password sign in
  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          return { success: false, error: signInError.message }
        }

        return { success: true }
      } catch (e: any) {
        const errorMessage = e.message || "An unknown error occurred"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  // Google sign in
  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Sign up function
  const signUp = useCallback(
    async (email: string, password: string, name: string, userType = "regular", state?: string, city?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const metadata: any = { name, type: userType }
        if (state) metadata.state = state
        if (city) metadata.city = city

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          return { success: false, error: signUpError.message }
        }

        return { success: true, userId: data.user?.id }
      } catch (e: any) {
        const errorMessage = e.message || "An unknown error occurred"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  // Enhanced sign out function
  const signOut = useCallback(async () => {
    setIsLoading(true)

    try {
      // Clear all timers
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }

      // Clear local storage
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase") || key.includes("petadot")) {
            localStorage.removeItem(key)
          }
        })
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase") || key.includes("petadot")) {
            sessionStorage.removeItem(key)
          }
        })
      }

      // Sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut({ scope: "global" })
      if (signOutError) {
        console.error("Sign out error:", signOutError)
      }

      // Clear state
      setUser(null)
      setSession(null)
      clearError()

      // Redirect to home
      router.push("/")
      router.refresh()
    } catch (e: any) {
      console.error("Error during sign out:", e)
      // Still clear state and redirect even if there's an error
      setUser(null)
      setSession(null)
      router.push("/")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router, clearError])

  // Reset password function
  const resetPassword = useCallback(
    async (email: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/reset-password`,
        })

        if (resetError) {
          setError(resetError.message)
          return { success: false, error: resetError.message }
        }

        return { success: true }
      } catch (e: any) {
        const errorMessage = e.message || "An unknown error occurred"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  // Context value
  const value = {
    user,
    session,
    isLoading,
    error,
    isInitialized,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
    clearError,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use the authentication context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export session hook for backward compatibility - REQUIRED EXPORT
export const useSession = () => useContext(AuthContext)?.session

// Export Supabase client for direct access
export const supabaseClient = getSupabaseClient()
