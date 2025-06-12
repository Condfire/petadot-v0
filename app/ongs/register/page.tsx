"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import LocationSelectorSimple from "@/components/location-selector-simple"

export default function OngRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    city: "",
    state: "",
    contact: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Função para formatar o CNPJ enquanto o usuário digita
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Remove caracteres não numéricos

    if (value.length > 14) {
      value = value.slice(0, 14) // Limita a 14 dígitos
    }

    // Formata o CNPJ: XX.XXX.XXX/XXXX-XX
    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, "$1.$2.$3/$4")
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d+)$/, "$1.$2.$3")
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d+)$/, "$1.$2")
    }

    setFormData((prev) => ({ ...prev, cnpj: value }))
  }

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({ ...prev, state }))
  }

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({ ...prev, city }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Validar senha
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsSubmitting(false)
      return
    }

    // Validar CNPJ (formato básico)
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    if (!cnpjRegex.test(formData.cnpj)) {
      setError("CNPJ inválido. Use o formato: XX.XXX.XXX/XXXX-XX")
      setIsSubmitting(false)
      return
    }

    // Validar campos obrigatórios
    if (!formData.state.trim()) {
      setError("O estado é obrigatório")
      setIsSubmitting(false)
      return
    }

    if (!formData.city.trim()) {
      setError("A cidade é obrigatória")
      setIsSubmitting(false)
      return
    }

    if (!formData.contact.trim()) {
      setError("O contato é obrigatório")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Iniciando processo de registro de ONG...")

      // Criar usuário no Supabase Auth
      console.log("Criando usuário na autenticação...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            is_ong: true,
            state: formData.state,
            city: formData.city,
          },
        },
      })

      if (authError) {
        console.error("Erro ao criar usuário na autenticação:", authError)
        setError(authError.message || "Falha ao criar conta")
        setIsSubmitting(false)
        return
      }

      if (!authData.user) {
        console.error("Usuário não criado na autenticação")
        setError("Erro ao criar usuário")
        setIsSubmitting(false)
        return
      }

      console.log("Usuário criado com sucesso na autenticação, ID:", authData.user.id)

      // Criar registro de ONG no banco de dados
      console.log("Criando registro de ONG...")

      // Preparar dados da ONG
      const ongData = {
        name: formData.name,
        email: formData.email,
        cnpj: formData.cnpj,
        user_id: authData.user.id,
        state: formData.state,
        city: formData.city,
        contact: formData.contact,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_verified: true,
      }

      console.log("Dados da ONG a serem inseridos:", ongData)

      const { data: ongResult, error: ongError } = await supabase.from("ongs").insert(ongData).select()

      if (ongError) {
        console.error("Erro ao criar ONG:", ongError)
        setError(`Erro ao criar perfil de ONG: ${ongError.message}`)

        // Não fazer logout automaticamente para permitir depuração
        setIsSubmitting(false)
        return
      }

      console.log("ONG criada com sucesso:", ongResult)

      // Atualizar a tabela users com o nome
      console.log("Atualizando tabela users com o nome...")
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          name: formData.name,
          state: formData.state,
          city: formData.city,
        })
        .eq("id", authData.user.id)

      if (userUpdateError) {
        console.warn("Aviso: Não foi possível atualizar o nome na tabela users:", userUpdateError)
        // Não vamos interromper o fluxo por causa desse erro
      }

      // Registro bem-sucedido
      setSuccess("Registro realizado com sucesso! Redirecionando para o login...")

      // Fazer logout para garantir um login limpo
      await supabase.auth.signOut()

      // Redirecionar para o login após um breve delay
      setTimeout(() => {
        router.push("/ongs/login?message=Cadastro realizado com sucesso! Faça login para acessar sua conta.")
      }, 2000)
    } catch (err) {
      console.error("Erro ao registrar:", err)
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido"
      setError(`Ocorreu um erro ao registrar: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Cadastro de ONG</CardTitle>
          <CardDescription className="text-center">
            Cadastre sua ONG para divulgar pets para adoção e eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome da ONG</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome da sua organização"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleCnpjChange}
                placeholder="XX.XXX.XXX/XXXX-XX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ong@exemplo.com"
                required
              />
            </div>

            <LocationSelectorSimple onStateChange={handleStateChange} onCityChange={handleCityChange} required={true} />

            <div className="space-y-2">
              <Label htmlFor="contact">Contato Principal</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Nome do contato principal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar ONG"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Já tem uma conta de ONG?{" "}
            <Link href="/ongs/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
          <div className="w-full border-t border-border pt-4">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Voltar para login de usuário
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
