"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { Suspense } from "react"
import { EnhancedAuthForms } from "@/components/enhanced-auth-forms"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginPageClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const errorParam = searchParams.get("error")
  const { user: authUser, isInitialized, signIn, signInWithGoogle } = useAuth()

  // Check if user is already authenticated
  useEffect(() => {
    if (isInitialized) {
      if (authUser) {
        console.log("User already authenticated, redirecting...")
        router.push(redirectTo)
      } else {
        setIsCheckingAuth(false)
      }
    }
  }, [authUser, isInitialized, router, redirectTo])

  // Handle error from URL params (e.g., from OAuth callback)
  useEffect(() => {
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [errorParam])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(data.email, data.password)

      if (!result.success) {
        setError(result.error || "Erro ao fazer login")
        return
      }

      // Redirect will be handled by the auth state change
    } catch (err) {
      console.error("Login error:", err)
      setError("Ocorreu um erro inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const result = await signInWithGoogle()

      if (!result.success) {
        setError(result.error || "Erro ao fazer login com Google")
      }
      // For OAuth, the redirect happens automatically
    } catch (err) {
      console.error("Google login error:", err)
      setError("Erro ao fazer login com Google")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<AuthFormsSkeleton />}>
          <EnhancedAuthForms />
        </Suspense>
      </div>
    </div>
  )
}

function AuthFormsSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
