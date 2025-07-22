"use client"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { EnhancedAuthForms } from "@/components/enhanced-auth-forms"

export default async function RegisterClientPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <EnhancedAuthForms />
      </div>
    </div>
  )
}
