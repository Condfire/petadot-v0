"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClientComponentClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { UserProfile } from "@/lib/types" // Import UserProfile

interface AuthContextType {
  user: UserProfile | null // Use UserProfile here
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }> // Added signIn method
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }> // Updated return type
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  isInitialized: boolean // Added isInitialized
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export useSession for backward compatibility
export function useSession() {
  const { user, session, loading } = useAuth()
  return { user, session, loading }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null) // Change type here
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false) // Add isInitialized state
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Sync user profile with database
  const syncUserProfile = async (supabaseUser: User): Promise<UserProfile | null> => {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id, email, name, avatar_url, provider, email_verified, user_type, created_at, updated_at")
        .eq("id", supabaseUser.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 means no rows found
        console.error("Error fetching user profile:", fetchError)
        return null // Indicate failure
      }

      let userProfileDataFromDB: {
        id: string
        email: string
        name: string | null
        avatar_url: string | null
        provider: string
        email_verified: boolean
        user_type: "regular" | "admin" | "ngo_admin" | null
        created_at: string
        updated_at: string
      }

      if (!existingUser) {
        // Create new user profile
        const newUserProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || "",
          avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || "",
          provider: supabaseUser.app_metadata?.provider || "email",
          email_verified: supabaseUser.email_confirmed_at ? true : false,
          user_type: "regular" as const, // Default type
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        const { data: insertedUser, error: insertError } = await supabase
          .from("users")
          .insert(newUserProfile)
          .select()
          .single()

        if (insertError) {
          console.error("Error creating user profile:", insertError)
          return null
        }
        userProfileDataFromDB = insertedUser
      } else {
        // Update existing user profile
        const updatedFields = {
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || existingUser.name,
          avatar_url:
            supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || existingUser.avatar_url,
          email_verified: supabaseUser.email_confirmed_at ? true : false,
          updated_at: new Date().toISOString(),
        }
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update(updatedFields)
          .eq("id", supabaseUser.id)
          .select()
          .single()

        if (updateError) {
          console.error("Error updating user profile:", updateError)
          return null
        }
        userProfileDataFromDB = updatedUser
      }

      // Merge Supabase User object with our custom user profile data
      return {
        ...supabaseUser,
        ...userProfileDataFromDB, // This will overwrite common fields like id, email, name, avatar_url
        user_type: userProfileDataFromDB.user_type,
      }
    } catch (error) {
      console.error("Error syncing user profile:", error)
      return null
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error("Email/password sign in error:", error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        const profile = await syncUserProfile(data.user)
        if (profile) {
          setUser(profile)
          setSession(data.session)
          toast.success("Login realizado com sucesso!")
          router.push("/dashboard") // Redirect after successful login
          return { success: true }
        } else {
          return { success: false, error: "Erro ao carregar perfil do usuário." }
        }
      }
      return { success: false, error: "Nenhum usuário retornado." }
    } catch (error: any) {
      console.error("Email/password sign in error:", error)
      return { success: false, error: error.message || "Ocorreu um erro inesperado." }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
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
        console.error("Google sign in error:", error)
        toast.error("Erro ao fazer login com Google")
        return { success: false, error: error.message }
      }
      return { success: true } // OAuth redirect handles the rest
    } catch (error: any) {
      console.error("Google sign in error:", error)
      toast.error("Erro ao fazer login com Google")
      return { success: false, error: error.message || "Ocorreu um erro inesperado." }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
        toast.error("Erro ao fazer logout")
      } else {
        setUser(null)
        setSession(null)
        toast.success("Logout realizado com sucesso")
        router.push("/")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Erro ao fazer logout")
    } finally {
      setLoading(false)
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Session refresh error:", error)
        return
      }

      if (data.session) {
        setSession(data.session)
        const profile = await syncUserProfile(data.session.user)
        setUser(profile)
      }
    } catch (error) {
      console.error("Session refresh error:", error)
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        if (mounted) {
          setSession(session)
          if (session?.user) {
            const profile = await syncUserProfile(session.user)
            setUser(profile)
          } else {
            setUser(null)
          }
          setLoading(false)
          setIsInitialized(true) // Mark as initialized
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          setLoading(false)
          setIsInitialized(true) // Mark as initialized even on error
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.email)

      setSession(session)
      setLoading(false) // Set loading to false on any auth state change

      if (session?.user) {
        const profile = await syncUserProfile(session.user)
        setUser(profile)
        if (event === "SIGNED_IN") {
          toast.success("Login realizado com sucesso!")
        }
      } else {
        setUser(null)
      }

      if (event === "SIGNED_OUT") {
        // No need to set user/session to null here, it's handled by the else block above
      }
    })

    // Auto-refresh token before expiry
    const refreshInterval = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()

        // Refresh if expires in less than 1 minute
        if (timeUntilExpiry < 60000) {
          await refreshSession()
        }
      }
    }, 30000) // Check every 30 seconds

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    signIn, // Add signIn
    signInWithGoogle,
    signOut,
    refreshSession,
    isInitialized, // Add isInitialized
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
