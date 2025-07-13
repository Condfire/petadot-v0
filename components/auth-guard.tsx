"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { Loader2 } from "lucide-react"

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [shouldRender, setShouldRender] = useState(false)
  const { user, isLoading, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Aguardar a inicialização completa
    if (!isInitialized) {
      return
    }

    // Se não está carregando e não há usuário, redirecionar
    if (!isLoading && !user) {
      const currentPath = window.location.pathname
      router.replace(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      return
    }

    // Se há usuário, permitir renderização
    if (user && !isLoading) {
      setShouldRender(true)
    }
  }, [user, isLoading, isInitialized, router])

  // Mostrar loading enquanto inicializa ou verifica autenticação
  if (!isInitialized || isLoading || (!user && !shouldRender)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    )
  }

  // Se não deve renderizar (usuário não autenticado), não mostrar nada
  // pois o redirecionamento já foi iniciado
  if (!shouldRender) {
    return null
  }

  // Renderizar o conteúdo protegido
  return <>{children}</>
}
