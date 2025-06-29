"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RequireAuthProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
  showError?: boolean
  allowedUserTypes?: string[]
}

function RequireAuth({
  children,
  redirectTo = "/login",
  fallback,
  showError = true,
  allowedUserTypes,
}: RequireAuthProps) {
  const { user, isLoading, session, error, isInitialized, refreshSession, clearError } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Only make decisions after auth is initialized
    if (!isInitialized) return

    // Check if user meets type requirements
    const hasValidUserType = !allowedUserTypes || (user?.type && allowedUserTypes.includes(user.type))

    // If we have a user, session, and valid user type, show content
    if (user && session && hasValidUserType) {
      setShowContent(true)
      setShouldRedirect(false)
      return
    }

    // If user doesn't meet type requirements
    if (user && session && !hasValidUserType) {
      setShowContent(false)
      setShouldRedirect(false) // Don't redirect, show access denied
      return
    }

    // If no user/session and not loading, prepare to redirect
    if (!isLoading && !user && !session) {
      setShouldRedirect(true)
      setShowContent(false)
    }
  }, [user, session, isLoading, isInitialized, allowedUserTypes])

  useEffect(() => {
    if (shouldRedirect) {
      const returnUrl = encodeURIComponent(pathname)
      const redirectUrl = `${redirectTo}?redirectTo=${returnUrl}`
      console.log(`Redirecting to ${redirectUrl}`)
      router.push(redirectUrl)
    }
  }, [shouldRedirect, redirectTo, router, pathname])

  // Handle session refresh retry
  const handleRetry = async () => {
    if (retryCount < 3) {
      setIsRetrying(true)
      setRetryCount((prev) => prev + 1)
      clearError()

      try {
        await refreshSession()
      } catch (error) {
        console.error("Retry failed:", error)
      } finally {
        setIsRetrying(false)
      }
    } else {
      setShouldRedirect(true)
    }
  }

  // Show loading state while initializing or loading
  if (!isInitialized || isLoading || isRetrying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-center text-muted-foreground">
              {!isInitialized
                ? "Inicializando..."
                : isRetrying
                  ? "Verificando sessão..."
                  : "Verificando autenticação..."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show access denied for wrong user type
  if (user && session && allowedUserTypes && !allowedUserTypes.includes(user.type || "")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Acesso Negado
            </CardTitle>
            <CardDescription>Você não tem permissão para acessar esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Esta página requer privilégios especiais que sua conta não possui.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state with retry option
  if (error && showError && retryCount < 3) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Erro de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={handleRetry} variant="outline" className="flex-1 bg-transparent">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
              <Button onClick={() => setShouldRedirect(true)} className="flex-1">
                Fazer login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show content if authenticated
  if (showContent) {
    return <>{children}</>
  }

  // Show fallback or loading while redirecting
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-center text-muted-foreground">Redirecionando...</p>
        </CardContent>
      </Card>
    </div>
  )
}

// REQUIRED DEFAULT EXPORT
export default RequireAuth
