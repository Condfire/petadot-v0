"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PromoteUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const userId = params.id

  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPromoting, setIsPromoting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, email, name, is_admin")
          .eq("id", userId)
          .single()

        if (error) {
          throw new Error("Usuário não encontrado")
        }

        if (data.is_admin) {
          setError("Este usuário já é um administrador")
        }

        setUser(data)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar usuário")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId, supabase])

  const handlePromote = async () => {
    setIsPromoting(true)
    setError(null)

    try {
      // Verificar se o usuário atual é um administrador
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Você precisa estar logado para realizar esta ação")
      }

      const { data: currentUser, error: currentUserError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", session.user.id)
        .single()

      if (currentUserError || !currentUser?.is_admin) {
        throw new Error("Você não tem permissão para realizar esta ação")
      }

      // Promover o usuário para administrador
      const { error: updateError } = await supabase.from("users").update({ is_admin: true }).eq("id", userId)

      if (updateError) {
        throw new Error("Erro ao promover usuário para administrador")
      }

      setSuccess("Usuário promovido para administrador com sucesso!")
      setTimeout(() => {
        router.push("/admin/users")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao promover o usuário")
    } finally {
      setIsPromoting(false)
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
            <Shield className="mr-2 h-5 w-5" /> Promover Usuário
          </CardTitle>
          <CardDescription>Promover usuário para administrador do sistema</CardDescription>
        </CardHeader>
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

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Nome</h3>
                <p>{user.name || "Sem nome"}</p>
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p>{user.email}</p>
              </div>
              <Alert>
                <AlertTitle>Confirmação</AlertTitle>
                <AlertDescription>
                  Você está prestes a promover este usuário para administrador. Administradores têm acesso completo ao
                  painel administrativo e podem gerenciar todos os aspectos do sistema.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <p>Usuário não encontrado</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handlePromote} disabled={isPromoting || isLoading || !!error || !user} className="w-full">
            {isPromoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPromoting ? "Promovendo..." : "Promover para Administrador"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
