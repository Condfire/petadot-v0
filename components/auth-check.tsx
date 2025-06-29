"use client"

import { useAuth } from "@/app/auth-provider"
import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface AuthCheckProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
  loadingComponent?: ReactNode
}

export function AuthCheck({ children, fallback = null, requireAuth = false, loadingComponent }: AuthCheckProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    )
  }

  if (requireAuth && !user) {
    return <>{fallback}</>
  }

  if (!requireAuth && !user) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default AuthCheck
