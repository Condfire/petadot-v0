"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import LocationSelectorSimple from "@/components/location-selector-simple"
import { ImageUpload } from "@/components/image-upload" // Assuming this is a generic image uploader
import { registerUserAndNgoAction, type RegisterUserAndNgoInput } from "@/app/actions/auth-actions"
import { useAuth } from "@/app/auth-provider" // To check existing session

export default function RegisterPage() {
  const [personalName, setPersonalName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userState, setUserState] = useState("") // For regular user's location
  const [userCity, setUserCity] = useState("") // For regular user's location

  const [isNgo, setIsNgo] = useState(false)
  const [ngoName, setNgoName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [mission, setMission] = useState("")
  const [ngoContactEmail, setNgoContactEmail] = useState("")
  const [ngoContactPhone, setNgoContactPhone] = useState("")
  const [ngoWebsite, setNgoWebsite] = useState("")
  const [ngoAddress, setNgoAddress] = useState("")
  const [ngoState, setNgoState] = useState("")
  const [ngoCity, setNgoCity] = useState("")
  const [ngoPostalCode, setNgoPostalCode] = useState("")
  const [verificationDocumentUrl, setVerificationDocumentUrl] = useState("")

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

  const handleNgoLocationStateChange = (selectedState: string) => {
    setNgoState(selectedState)
    setNgoCity("") // Reset city when state changes
  }

  const handleNgoLocationCityChange = (selectedCity: string) => {
    setNgoCity(selectedCity)
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
      isNgo,
      personalName,
      email,
      password,
      userState: userState || undefined,
      userCity: userCity || undefined,
      ...(isNgo && {
        ngoName,
        cnpj: cnpj || undefined,
        mission: mission || undefined,
        ngoContactEmail: ngoContactEmail || email, // Default to user email
        ngoContactPhone: ngoContactPhone || undefined,
        ngoWebsite: ngoWebsite || undefined,
        ngoAddress: ngoAddress || undefined,
        ngoCity, // Required for NGO
        ngoState, // Required for NGO
        ngoPostalCode: ngoPostalCode || undefined,
        verificationDocumentUrl: verificationDocumentUrl || undefined,
      }),
    }

    if (isNgo && (!ngoCity || !ngoState)) {
      setError("Cidade e Estado são obrigatórios para ONGs.")
      setIsSubmitting(false)
      return
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

            {/* NGO Toggle */}
            <div className="flex items-center space-x-2 py-2">
              <Checkbox id="isNgo" checked={isNgo} onCheckedChange={(checked) => setIsNgo(checked as boolean)} />
              <Label
                htmlFor="isNgo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Quero me cadastrar como uma ONG
              </Label>
            </div>

            {/* NGO Specific Fields */}
            {isNgo && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Informações da ONG</h3>
                <div className="space-y-2">
                  <Label htmlFor="ngoName">Nome da ONG</Label>
                  <Input id="ngoName" value={ngoName} onChange={(e) => setNgoName(e.target.value)} required={isNgo} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ (XX.XXX.XXX/XXXX-XX)</Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="XX.XXX.XXX/XXXX-XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localização da ONG (Obrigatório)</Label>
                  <LocationSelectorSimple
                    onStateChange={handleNgoLocationStateChange}
                    onCityChange={handleNgoLocationCityChange}
                    initialState={ngoState}
                    initialCity={ngoCity}
                    required={isNgo}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ngoAddress">Endereço da ONG</Label>
                  <Input id="ngoAddress" value={ngoAddress} onChange={(e) => setNgoAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ngoPostalCode">CEP da ONG</Label>
                  <Input id="ngoPostalCode" value={ngoPostalCode} onChange={(e) => setNgoPostalCode(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission">Missão da ONG</Label>
                  <Textarea id="mission" value={mission} onChange={(e) => setMission(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ngoContactEmail">Email de Contato da ONG</Label>
                  <Input
                    id="ngoContactEmail"
                    type="email"
                    value={ngoContactEmail}
                    onChange={(e) => setNgoContactEmail(e.target.value)}
                    placeholder="Default: seu email pessoal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ngoContactPhone">Telefone de Contato da ONG</Label>
                  <Input
                    id="ngoContactPhone"
                    value={ngoContactPhone}
                    onChange={(e) => setNgoContactPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ngoWebsite">Website da ONG</Label>
                  <Input
                    id="ngoWebsite"
                    type="url"
                    value={ngoWebsite}
                    onChange={(e) => setNgoWebsite(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verificationDocumentUrl">Documento de Verificação (URL)</Label>
                  <ImageUpload
                    value={verificationDocumentUrl}
                    onChange={(url) => setVerificationDocumentUrl(url)}
                    folder="ngo_verifications"
                  />
                  <p className="text-xs text-muted-foreground">
                    Faça upload de um documento que comprove a legitimidade da ONG (ex: estatuto, CNPJ).
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || isAuthLoading}>
              {(isSubmitting || isAuthLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
