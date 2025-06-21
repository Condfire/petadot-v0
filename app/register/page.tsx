"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import LocationSelectorSimple from "@/components/location-selector-simple"
import { registerUserAndNgoAction, type RegisterUserAndNgoInput } from "@/app/actions/auth-actions"
import { useAuth } from "@/app/auth-provider" // To check existing session

export default function RegisterPage() {
  const [personalName, setPersonalName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userState, setUserState] = useState("") // For regular user's location
  const [userCity, setUserCity] = useState("") // For regular user's location


  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const { session, isLoading: isAuthLoading } = useAuth()

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.push(redirectTo)
    }
  }, [session, isAuthLoading, router, redirectTo])

  const handleUserLocationStateChange = (selectedState: string) => {
    setUserState(selectedState)
    setUserCity("") // Reset city when state changes
  }

  const handleUserLocationCityChange = (selectedCity: string) => {
    setUserCity(selectedCity)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      setIsSubmitting(false)
      return
    }

    const formData: RegisterUserAndNgoInput = {
      isNgo: false,
      personalName,
      email,
      password,
      userState: userState || undefined,
      userCity: userCity || undefined,
    }

    const result = await registerUserAndNgoAction(formData)

    if (result.success) {
      setSuccessMessage(result.message + " Você será redirecionado para o login.")
      setTimeout(() => {
        router.push("/login?message=Conta criada com sucesso! Faça login para continuar.")
      }, 3000)
    } else {
      setError(result.message)
    }

    setIsSubmitting(false)
  }

  if (isAuthLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta para acessar todas as funcionalidades.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="default" className="bg-green-100 border-green-500 text-green-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Common User Fields */}
            <div className="space-y-2">
              <Label htmlFor="personalName">Seu Nome Completo</Label>
              <Input
                id="personalName"
                value={personalName}
                onChange={(e) => setPersonalName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Seu Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Sua Localização (Opcional para usuários, usado se não for ONG)</Label>
              <LocationSelectorSimple
                onStateChange={handleUserLocationStateChange}
                onCityChange={handleUserLocationCityChange}
                initialState={userState}
                initialCity={userCity}
                required={false}
              />
            </div>
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


            <Button type="submit" className="w-full" disabled={isSubmitting || isAuthLoading}>
              {(isSubmitting || isAuthLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            É uma ONG?{" "}
            <Link href="/ongs/register" className="text-primary hover:underline">
              Cadastre sua organização
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
