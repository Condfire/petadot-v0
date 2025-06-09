import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { RegularUserDashboard } from "./regular-user-dashboard"
import type { User } from "@/app/auth-provider"
import { getStatsForUser } from "@/lib/stats"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  let userProfile
  let profileError

  try {
    const { data, error } = await supabase.from("users").select("id, type, name").eq("id", session.user.id).single()

    userProfile = data
    profileError = error

    if (profileError) {
      // Log the detailed error from Supabase
      console.error("Supabase profile fetch error:", JSON.stringify(profileError, null, 2))

      // Check for specific error messages that might indicate non-JSON responses
      if (profileError.message?.includes("JSONParseError") || profileError.message?.includes("FetchError")) {
        // This could be due to rate limiting or other network issues returning non-JSON
        console.error("Detailed error message suggests non-JSON response:", profileError.message)
        redirect("/login?message=Erro ao carregar perfil. O servidor pode estar ocupado. Tente novamente mais tarde.")
        return // Important to return after redirect
      }
    }
  } catch (e: any) {
    // Catching potential JSON parsing errors directly if Supabase client fails to parse
    console.error("Critical error fetching user profile (possibly non-JSON response):", e.message)
    if (e instanceof SyntaxError && e.message.toLowerCase().includes("json")) {
      redirect("/login?message=Erro de comunicação com o servidor ao carregar perfil. Tente novamente mais tarde.")
      return // Important to return after redirect
    }
    // For other unexpected errors during the try block
    profileError = e
  }

  if (profileError || !userProfile) {
    console.error("Final check: Error fetching user profile or profile is null:", profileError)
    redirect("/login?message=Perfil não encontrado ou erro ao carregar. Por favor, tente novamente.")
    return // Important to return after redirect
  }

  // Check user type and redirect if it's an NGO
  if (userProfile.type === "ngo_admin" || userProfile.type === "ong") {
    redirect("/ongs/dashboard")
    return // Important to return after redirect
  }

  // Fetch stats for the regular user
  const stats = await getStatsForUser(session.user.id)

  // If it's a regular user, render the regular dashboard
  return <RegularUserDashboard user={userProfile as User} stats={stats} />
}
