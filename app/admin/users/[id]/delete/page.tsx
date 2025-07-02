"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AdminAuthCheck from "@/components/admin-auth-check"

export default function DeleteUserPage({ params }: { params: { id: string } }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      // Primeiro, vamos excluir os pets do usuário
      // 1. Pets para adoção
      const { error: adoptionError } = await supabase.from("pets").delete().eq("user_id", params.id)
      if (adoptionError) {
        console.error("Erro ao excluir pets para adoção:", adoptionError)
        setError(`Erro ao excluir pets para adoção: ${adoptionError.message}`)
        setIsDeleting(false)
        return
      }

      // 2. Pets perdidos
      const { error: lostError } = await supabase.from("pets_lost").delete().eq("user_id", params.id)
      if (lostError) {
        console.error("Erro ao excluir pets perdidos:", lostError)
        setError(`Erro ao excluir pets perdidos: ${lostError.message}`)
        setIsDeleting(false)
        return
      }

      // 3. Pets encontrados
      const { error: foundError } = await supabase.from("pets_found").delete().eq("user_id", params.id)
      if (foundError) {
        console.error("Erro ao excluir pets encontrados:", foundError)
        setError(`Erro ao excluir pets encontrados: ${foundError.message}`)
        setIsDeleting(false)
        return
      }

      // Agora, vamos excluir o usuário da tabela users
      const { error: userError } = await supabase.from("users").delete().eq("id", params.id)
      if (userError) {
        console.error("Erro ao excluir usuário:", userError)
        setError(`Erro ao excluir usuário: ${userError.message}`)
        setIsDeleting(false)
        return
      }

      // Revalidar as páginas que exibem pets
      await revalidatePages()

      setSuccess(true)
      setIsDeleting(false)

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/admin/users")
        router.refresh()
      }, 2000)
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error)
      setError(`Erro ao excluir usuário: ${error.message}`)
      setIsDeleting(false)
    }
  }

  // Função para revalidar as páginas
  const revalidatePages = async () => {
    try {
      // Lista de caminhos para revalidar
      const pathsToRevalidate = ["/", "/adocao", "/perdidos", "/encontrados", "/dashboard", "/admin/dashboard"]

      // Revalidar cada caminho
      for (const path of pathsToRevalidate) {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
        })
      }

      console.log("Páginas revalidadas com sucesso")
    } catch (error) {
      console.error("Erro ao revalidar páginas:", error)
    }
  }

  return (
    <AdminAuthCheck>
      <div className="container py-10">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <Trash2 className="mr-2 h-5 w-5" />
              Excluir Usuário
            </CardTitle>
            <CardDescription>
              Você está prestes a excluir o usuário com ID: <strong>{params.id}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção!</AlertTitle>
              <AlertDescription>
                Esta ação excluirá permanentemente o usuário e todos os seus pets cadastrados. Esta ação não pode ser
                desfeita.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 bg-green-100 text-green-800 border-green-200">
                <AlertTitle>Sucesso!</AlertTitle>
                <AlertDescription>
                  Usuário excluído com sucesso. Você será redirecionado em instantes...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()} disabled={isDeleting || success}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || success}>
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminAuthCheck>
  )
}
