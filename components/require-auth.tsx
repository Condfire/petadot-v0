"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { Loader2 } from "lucide-react"

interface RequireAuthProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function RequireAuth({ children, redirectTo = "/login" }: RequireAuthProps) {
  const { user, isLoading, session } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Só decidimos redirecionar quando temos certeza que não estamos carregando
    // e que não há usuário ou sessão
    if (!isLoading && !user && !session) {
      setShouldRedirect(true)
    }

    // Só mostramos o conteúdo quando temos certeza que há um usuário autenticado
    if (!isLoading && user) {
      setShowContent(true)
    }

    // Se decidimos redirecionar, fazemos isso
    if (shouldRedirect) {
      const currentPath = window.location.pathname
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
      console.log(`Redirecionando para ${redirectUrl}`)
      router.push(redirectUrl)
    }
  }, [isLoading, user, session, router, redirectTo, shouldRedirect])

  // Enquanto estamos carregando, mostramos um indicador
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-center text-muted-foreground">Verificando autenticação...</p>
      </div>
    )
  }

  // Se decidimos mostrar o conteúdo, fazemos isso
  if (showContent) {
    return <>{children}</>
  }

  // Se não estamos carregando, não decidimos mostrar o conteúdo,
  // e não decidimos redirecionar ainda, mostramos um indicador
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-center text-muted-foreground">Verificando autenticação...</p>
    </div>
  )
}
