"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createOrPromoteAdmin } from "@/app/actions/admin-user-actions"

export default function NewAdminPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await createOrPromoteAdmin(email, password, name)

      if (result.success) {
        setSuccess(result.message)
        setTimeout(() => {
          router.push("/admin/users")
        }, 2000)
      } else {
        setError(result.error || "Ocorreu um erro desconhecido")
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao criar o administrador")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-md">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" /> Adicionar Novo Administrador
          </CardTitle>
          <CardDescription>Crie um novo administrador ou promova um usuário existente</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
              <p className="text-sm text-muted-foreground">
                Se o email já existir, o usuário será promovido a administrador.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome (opcional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do administrador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha (apenas para novos usuários)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha segura"
              />
              <p className="text-sm text-muted-foreground">A senha só é necessária para criar novos usuários.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Processando..." : "Adicionar Administrador"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
