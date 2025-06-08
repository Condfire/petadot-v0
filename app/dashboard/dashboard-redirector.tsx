"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider" // Ensure this path is correct

export default function DashboardRedirector() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Check if the user is an NGO admin and not on the NGO dashboard
      if ((user.type === "ngo_admin" || user.type === "ong") && window.location.pathname === "/dashboard") {
        router.replace("/ongs/dashboard")
      }
    }
  }, [user, isLoading, router])

  return null // This component does not render anything
}
