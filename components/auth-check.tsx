"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/app/auth-provider"
import { Loader2 } from "lucide-react"

interface AuthCheckProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthCheck({ children, fallback }: AuthCheckProps) {
  const { user, isLoading } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Só mostramos o conteúdo quando temos certeza que há um usuário autenticado
    if (!isLoading && user) {
      setShowContent(true)
    }
  }, [isLoading, user])

  // Enquanto estamos carregando, mostramos um indicador
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  // Se decidimos mostrar o conteúdo, fazemos isso
  if (showContent) {
    return <>{children}</>
  }

  // Se não estamos carregando e não decidimos mostrar o conteúdo,
  // mostramos o fallback
  return <>{fallback || null}</>
}
