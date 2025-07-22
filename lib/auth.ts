import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      // Don't log session missing errors as they're expected when not logged in
      if (!error.message.includes("session missing") && !error.message.includes("JWT")) {
        console.error("Error getting current user:", error)
      }
      return null
    }

    if (!user) {
      return null
    }

    // Try to get additional user data from the users table
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id, email, name, avatar_url, type, state, city, provider")
        .eq("id", user.id)
        .single()

      if (userData) {
        return {
          id: user.id,
          email: user.email || userData.email || "",
          name:
            userData.name ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Usuário",
          avatar_url: userData.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          type: userData.type || user.user_metadata?.type || "regular",
          state: userData.state || user.user_metadata?.state || null,
          city: userData.city || user.user_metadata?.city || null,
          provider: userData.provider || user.app_metadata?.provider || "email",
          email_verified: !!user.email_confirmed_at,
        }
      }
    } catch (dbError) {
      // If database query fails, return basic user info from auth
      console.warn("Could not fetch user data from database:", dbError)
    }

    // Return basic user info from auth metadata with null checks
    return {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      type: user.user_metadata?.type || "regular",
      state: user.user_metadata?.state || null,
      city: user.user_metadata?.city || null,
      provider: user.app_metadata?.provider || "email",
      email_verified: !!user.email_confirmed_at,
    }
  } catch (error) {
    // Don't log expected auth errors
    if (error instanceof Error && !error.message.includes("session missing") && !error.message.includes("JWT")) {
      console.error("Error in getCurrentUser:", error)
    }
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function getSupabaseServerClient() {
  return await createClient()
}
