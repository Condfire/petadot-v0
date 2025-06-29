"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClientComponentClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
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
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Sync user profile with database
  const syncUserProfile = async (user: User) => {
    try {
      const { data: existingUser } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (!existingUser) {
        // Create new user profile
        const { error } = await supabase.from("users").insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          provider: user.app_metadata?.provider || "email",
          email_verified: user.email_confirmed_at ? true : false,
          user_type: "regular",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error creating user profile:", error)
        }
      } else {
        // Update existing user profile
        const { error } = await supabase
          .from("users")
          .update({
            name: user.user_metadata?.full_name || user.user_metadata?.name || existingUser.name,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || existingUser.avatar_url,
            email_verified: user.email_confirmed_at ? true : false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) {
          console.error("Error updating user profile:", error)
        }
      }
    } catch (error) {
      console.error("Error syncing user profile:", error)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
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
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      toast.error("Erro ao fazer login com Google")
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
        setUser(data.session.user)
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
          setUser(session?.user ?? null)

          if (session?.user) {
            await syncUserProfile(session.user)
          }

          setLoading(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          setLoading(false)
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
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user && event === "SIGNED_IN") {
        await syncUserProfile(session.user)
        toast.success("Login realizado com sucesso!")
      }

      if (event === "SIGNED_OUT") {
        setUser(null)
        setSession(null)
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
    signInWithGoogle,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
