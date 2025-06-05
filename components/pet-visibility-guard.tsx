"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/app/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface PetVisibilityGuardProps {
  pet: any
  children: ReactNode
  fallback?: ReactNode
  showAlert?: boolean
}

export function PetVisibilityGuard({ pet, children, fallback, showAlert = true }: PetVisibilityGuardProps) {
  const { user } = useAuth()

  if (!pet) {
    return null
  }

  const status = pet.status?.toLowerCase() || ""
  const isApproved = status === "approved" || status === "aprovado"
  const isOwner = user && pet.user_id === user.id

  // Approved pets are visible to everyone
  if (isApproved) {
    return <>{children}</>
  }

  // Non-approved pets are only visible to their owners
  if (isOwner) {
    return (
      <>
        {showAlert && (
          <Alert variant="warning" className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {status === "rejected" || status === "rejeitado"
                ? "Este pet foi rejeitado e só é visível para você."
                : "Este pet está pendente de aprovação e só é visível para você."}
            </AlertDescription>
          </Alert>
        )}
        {children}
      </>
    )
  }

  // If not approved and not the owner, show fallback or nothing
  return fallback ? <>{fallback}</> : null
}
