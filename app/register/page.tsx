"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, User, Building2 } from "lucide-react"
import LocationSelectorSimple from "@/components/location-selector-simple"
import { registerUserAndNgoAction, type RegisterUserAndNgoInput } from "@/app/actions/auth-actions"
import { useAuth } from "@/app/auth-provider"

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("user")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dados comuns
  const [personalName, setPersonalName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Dados do usuário comum
  const [userState, setUserState] = useState("")
  const [userCity, setUserCity] = useState("")

  // Dados da ONG (apenas campos essenciais)
  const [ngoName, setNgoName] = useState("")
  const [ngoState, setNgoState] = useState("")
  const [ngoCity, setNgoCity] = useState("")
  const [ngoContactPhone, setNgoContactPhone] = useState("")
  const [mission, setMission] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const { session, isLoading: isAuthLoading } = useAuth()

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.push(redirectTo)
    }
  }, [session, isAuthLoading, router, redirectTo])

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

    const isNgo = activeTab === "ong"

    if (isNgo && (!ngoCity || !ngoState)) {
      setError("Cidade e Estado são obrigatórios para ONGs.")
      setIsSubmitting(false)
      return
    }

    const formData: RegisterUserAndNgoInput = {
      isNgo,
      personalName,
      email,
      password,
      userState: userState || undefined,
      userCity: userCity || undefined,
      ...(isNgo && {
        ngoName,
        ngoCity,
        ngoState,
        ngoContactPhone: ngoContactPhone || undefined,
        mission: mission || undefined,
        ngoContactEmail: email, // Usar o email principal como contato
      }),
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">Escolha o tipo de conta que você deseja criar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Usuário
              </TabsTrigger>
              <TabsTrigger value="ong" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                ONG
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert variant="default" className="mb-4 bg-green-100 border-green-500 text-green-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Dados Pessoais - Comum para ambos */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              <TabsContent value="user" className="space-y-4">
                <h3 className="text-lg font-semibold">Localização (Opcional)</h3>
                <LocationSelectorSimple
                  onStateChange={setUserState}
                  onCityChange={setUserCity}
                  initialState={userState}
                  initialCity={userCity}
                  required={false}
                />
              </TabsContent>

              <TabsContent value="ong" className="space-y-4">
                <h3 className="text-lg font-semibold">Dados da ONG</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ngoName">Nome da ONG</Label>
                    <Input
                      id="ngoName"
                      value={ngoName}
                      onChange={(e) => setNgoName(e.target.value)}
                      required={activeTab === "ong"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Localização da ONG</Label>
                    <LocationSelectorSimple
                      onStateChange={setNgoState}
                      onCityChange={setNgoCity}
                      initialState={ngoState}
                      initialCity={ngoCity}
                      required={activeTab === "ong"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ngoContactPhone">Telefone de Contato</Label>
                    <Input
                      id="ngoContactPhone"
                      value={ngoContactPhone}
                      onChange={(e) => setNgoContactPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mission">Missão da ONG (Opcional)</Label>
                    <Textarea
                      id="mission"
                      value={mission}
                      onChange={(e) => setMission(e.target.value)}
                      placeholder="Descreva brevemente a missão da sua ONG..."
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <Button type="submit" className="w-full mt-6" disabled={isSubmitting || isAuthLoading}>
                {(isSubmitting || isAuthLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Criando conta..." : `Criar conta ${activeTab === "ong" ? "de ONG" : "pessoal"}`}
              </Button>
            </form>
          </Tabs>
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
