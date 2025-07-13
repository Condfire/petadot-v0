"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const checkAuth = async () => {
      try {
        console.log("AuthGuard: Verificando autenticação...")

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted && isChecking) {
            console.error("AuthGuard: Timeout na verificação de autenticação")
            setError("Timeout na verificação de autenticação")
            router.replace(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}&error=timeout`)
          }
        }, 10000) // 10 seconds timeout

        const { data, error: sessionError } = await supabase.auth.getSession()

        // Clear the timeout since we got a response
        clearTimeout(timeoutId)

        if (sessionError) {
          console.error("AuthGuard: Erro ao verificar sessão:", sessionError)
          if (isMounted) {
            setError(sessionError.message)
            router.replace(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}&error=session`)
          }
          return
        }

        if (!data.session) {
          console.log("AuthGuard: Sem sessão, redirecionando para login")
          if (isMounted) {
            router.replace(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
          }
          return
        }

        console.log("AuthGuard: Usuário autenticado:", data.session.user.id)
        if (isMounted) {
          setIsAuthenticated(true)
          setIsChecking(false)
        }
      } catch (error) {
        clearTimeout(timeoutId)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        console.error("AuthGuard: Erro ao verificar autenticação:", errorMessage)

        if (isMounted) {
          setError(errorMessage)
          router.replace(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}&error=unknown`)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [router, supabase])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-destructive mb-4">Erro na autenticação: {error}</p>
        <button onClick={() => router.push("/login")} className="px-4 py-2 bg-primary text-white rounded-md">
          Ir para login
        </button>
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // O redirecionamento já foi iniciado, não renderizar nada
  }

  return <>{children}</>
}
