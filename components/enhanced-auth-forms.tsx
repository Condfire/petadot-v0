"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, MapPin, Loader2 } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { toast } from "@/hooks/use-toast"

interface EnhancedAuthFormsProps {
  mode: "login" | "register"
  message?: string
  error?: string
}

export function EnhancedAuthForms({ mode, message, error }: EnhancedAuthFormsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    userType: "regular",
    state: "",
    city: "",
  })
  const [formError, setFormError] = useState<string | null>(error || null)
  const [isPending, startTransition] = useTransition()

  const { signIn, signUp, signInWithGoogle, isLoading } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError(null)
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setFormError("Email e senha são obrigatórios")
      return false
    }

    if (mode === "register") {
      if (!formData.name) {
        setFormError("Nome é obrigatório")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError("As senhas não coincidem")
        return false
      }
      if (formData.password.length < 6) {
        setFormError("A senha deve ter pelo menos 6 caracteres")
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError("Email inválido")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    startTransition(async () => {
      try {
        if (mode === "login") {
          const result = await signIn(formData.email, formData.password)
          if (result.success) {
            toast({
              title: "Login realizado com sucesso!",
              description: "Redirecionando para o dashboard...",
            })
            router.push("/dashboard")
          } else {
            setFormError(result.error || "Erro ao fazer login")
          }
        } else {
          const result = await signUp(
            formData.email,
            formData.password,
            formData.name,
            formData.userType,
            formData.state,
            formData.city,
          )
          if (result.success) {
            toast({
              title: "Conta criada com sucesso!",
              description: "Verifique seu email para confirmar a conta.",
            })
            router.push("/login?message=Verifique seu email para confirmar a conta")
          } else {
            setFormError(result.error || "Erro ao criar conta")
          }
        }
      } catch (error) {
        console.error("Auth error:", error)
        setFormError("Erro inesperado. Tente novamente.")
      }
    })
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      if (!result.success) {
        setFormError(result.error || "Erro ao fazer login com Google")
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      setFormError("Erro ao fazer login com Google")
    }
  }

  const isFormLoading = isPending || isLoading

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10"
                disabled={isFormLoading}
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10"
              disabled={isFormLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 pr-10"
              disabled={isFormLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isFormLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mode === "register" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={isFormLoading}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">Estado (opcional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="SP"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isFormLoading}
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade (opcional)</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="São Paulo"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isFormLoading}
                />
              </div>
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isFormLoading}>
          {isFormLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "login" ? "Entrando..." : "Criando conta..."}
            </>
          ) : mode === "login" ? (
            "Entrar"
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        className="w-full bg-transparent"
        disabled={isFormLoading}
      >
        {isFormLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continuar com Google
      </Button>

      {mode === "login" && (
        <div className="text-center">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Esqueceu sua senha?
          </a>
        </div>
      )}
    </div>
  )
}
