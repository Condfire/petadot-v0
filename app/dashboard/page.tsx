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

  // Fetch user profile from your 'users' table
  const { data: userProfile, error } = await supabase
    .from("users")
    .select("id, type, name")
    .eq("id", session.user.id)
    .single()

  if (error || !userProfile) {
    console.error("Error fetching user profile:", error)
    redirect("/login?message=Perfil não encontrado. Por favor, tente novamente.")
  }

  // Check user type and redirect if it's an NGO
  if (userProfile.type === "ngo_admin" || userProfile.type === "ong") {
    redirect("/ongs/dashboard")
  }

  // Fetch stats for the regular user
  const stats = await getStatsForUser(session.user.id)

  // If it's a regular user, render the regular dashboard
  return <RegularUserDashboard user={userProfile as User} stats={stats} />
}
