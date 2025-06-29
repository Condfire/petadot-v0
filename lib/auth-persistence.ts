import { createClientComponentClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"

export class AuthPersistence {
  private static instance: AuthPersistence
  private supabase = createClientComponentClient()
  private refreshTimer: NodeJS.Timeout | null = null
  private validationTimer: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): AuthPersistence {
    if (!AuthPersistence.instance) {
      AuthPersistence.instance = new AuthPersistence()
    }
    return AuthPersistence.instance
  }

  async initializePersistence(): Promise<Session | null> {
    try {
      console.log("Initializing auth persistence...")

      // Get current session
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        return null
      }

      if (session) {
        console.log("Session found, setting up persistence...")
        this.scheduleTokenRefresh(session)
        this.startSessionValidation()
        return session
      }

      console.log("No session found")
      return null
    } catch (error) {
      console.error("Error initializing auth persistence:", error)
      return null
    }
  }

  private scheduleTokenRefresh(session: Session) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    if (session.expires_at) {
      const expiresAt = session.expires_at * 1000
      const now = Date.now()
      const refreshTime = expiresAt - now - 60000 // Refresh 1 minute before expiry

      if (refreshTime > 0) {
        console.log(`Scheduling token refresh in ${Math.round(refreshTime / 1000)} seconds`)

        this.refreshTimer = setTimeout(async () => {
          console.log("Auto-refreshing token...")
          const newSession = await this.refreshSession()
          if (newSession) {
            this.scheduleTokenRefresh(newSession)
          }
        }, refreshTime)
      }
    }
  }

  private startSessionValidation() {
    if (this.validationTimer) {
      clearInterval(this.validationTimer)
    }

    // Validate session every 5 minutes
    this.validationTimer = setInterval(
      async () => {
        try {
          const {
            data: { user },
            error,
          } = await this.supabase.auth.getUser()

          if (error || !user) {
            console.log("Session validation failed, user might be logged out")
            this.clearPersistence()
          } else {
            console.log("Session validation successful")
          }
        } catch (error) {
          console.error("Session validation error:", error)
        }
      },
      5 * 60 * 1000,
    )
  }

  async refreshSession(): Promise<Session | null> {
    try {
      console.log("Refreshing session...")
      const { data, error } = await this.supabase.auth.refreshSession()

      if (error) {
        console.error("Session refresh failed:", error)
        return null
      }

      if (data.session) {
        console.log("Session refreshed successfully")
        return data.session
      }

      return null
    } catch (error) {
      console.error("Session refresh error:", error)
      return null
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error) {
        console.error("Session validation error:", error)
        return false
      }

      return !!user
    } catch (error) {
      console.error("Session validation failed:", error)
      return false
    }
  }

  clearPersistence() {
    console.log("Clearing auth persistence...")

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    if (this.validationTimer) {
      clearInterval(this.validationTimer)
      this.validationTimer = null
    }

    // Clear storage
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
  }

  // Method to handle session recovery after network issues
  async recoverSession(): Promise<Session | null> {
    try {
      console.log("Attempting session recovery...")

      // First try to refresh the current session
      let session = await this.refreshSession()

      if (!session) {
        // If refresh fails, try to get the session again
        const {
          data: { session: currentSession },
          error,
        } = await this.supabase.auth.getSession()

        if (!error && currentSession) {
          session = currentSession
        }
      }

      if (session) {
        this.scheduleTokenRefresh(session)
        this.startSessionValidation()
        console.log("Session recovery successful")
      } else {
        console.log("Session recovery failed")
      }

      return session
    } catch (error) {
      console.error("Session recovery error:", error)
      return null
    }
  }
}

export const authPersistence = AuthPersistence.getInstance()
