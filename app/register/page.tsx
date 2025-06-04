"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import LocationSelectorSimple from "@/components/location-selector-simple"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const supabase = createClientComponentClient()

  // Verificar se o usuário já está autenticado e redirecionar se necessário
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Register page: Checking authentication...")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Register page: Error checking session:", error)
          setIsCheckingAuth(false)
          return
        }

        if (data.session) {
          console.log("Register page: User already authenticated, redirecting...")
          router.push(redirectTo)
        } else {
          console.log("Register page: No active session")
          setIsCheckingAuth(false)
        }
      } catch (err) {
        console.error("Register page: Error during auth check:", err)
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [supabase.auth, router, redirectTo])

  const handleStateChange = (selectedState: string) => {
    setState(selectedState)
  }

  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsSubmitting(false)
      return
    }

    // Validar campos obrigatórios
    if (!state) {
      setError("Por favor, selecione um estado")
      setIsSubmitting(false)
      return
    }

    if (!city) {
      setError("Por favor, selecione uma cidade")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Register page: Attempting to sign up...")
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            state,
            city,
          },
        },
      })

      if (error) {
        console.error("Register page: Sign up error:", error)
        throw new Error(error.message)
      }

      // Atualizar tabela users com estado e cidade
      const { error: updateError } = await supabase
        .from("users")
        .update({
          state,
          city,
        })
        .eq("id", data.user?.id)

      if (updateError) {
        console.warn("Aviso: Não foi possível atualizar estado e cidade:", updateError)
        // Não vamos interromper o fluxo por causa desse erro
      }

      console.log("Register page: Sign up successful, redirecting...")
      router.push("/login?message=Conta criada com sucesso! Faça login para continuar.")
    } catch (err) {
      console.error("Register page: Error during sign up:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao criar a conta")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (isCheckingAuth) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta para acessar todas as funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <LocationSelectorSimple onStateChange={handleStateChange} onCityChange={handleCityChange} required={true} />

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
