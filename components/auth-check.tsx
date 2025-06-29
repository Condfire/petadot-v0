"use client"

import type React from "react"
import { useAuth } from "@/app/auth-provider"
import { Loader2 } from "lucide-react"

interface AuthCheckProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  loadingComponent?: React.ReactNode
  allowedUserTypes?: string[]
}

export function AuthCheck({
  children,
  fallback,
  requireAuth = false,
  loadingComponent,
  allowedUserTypes,
}: AuthCheckProps) {
  const { user, isLoading, isInitialized } = useAuth()

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    )
  }

  // Check user type requirements
  const hasValidUserType = !allowedUserTypes || (user?.type && allowedUserTypes.includes(user.type))

  // If auth is required and user is not authenticated or doesn't have valid type
  if (requireAuth && (!user || !hasValidUserType)) {
    return fallback || null
  }

  // If auth is not required or user is authenticated with valid type
  return <>{children}</>
}

export default AuthCheck
