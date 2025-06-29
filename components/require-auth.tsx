"use client"

import type React from "react"

import { useAuth } from "@/app/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface RequireAuthProps {
  children: React.ReactNode
  redirectTo?: string
}

export function RequireAuth({ children, redirectTo = "/login" }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname
      const returnUrl = encodeURIComponent(currentPath)
      router.push(`${redirectTo}?returnUrl=${returnUrl}`)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando autenticação...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Redirecionando...</span>
      </div>
    )
  }

  return <>{children}</>
}

export default RequireAuth
