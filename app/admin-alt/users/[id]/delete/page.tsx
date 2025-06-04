"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react"
import AdminAuthCheck from "@/components/admin-auth-check"

export default function DeleteUserPage({ params }: { params: { id: string } }) {
  return (
    <AdminAuthCheck>
      <DeleteUserForm userId={params.id} />
    </AdminAuthCheck>
  )
}

function DeleteUserForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    try {
      // Verificar se o usuário existe
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

      if (userError) {
        throw new Error("Usuário não encontrado")
      }

      // Verificar se o usuário atual é o mesmo que está sendo excluído
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.id === userId) {
        throw new Error("Você não pode excluir sua própria conta")
      }

      // Excluir o usuário
      const { error: deleteError } = await supabase.from("users").delete().eq("id", userId)

      if (deleteError) {
        throw deleteError
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
      })

      router.push("/admin-alt/users")
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o usuário.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Excluir Usuário
          </CardTitle>
          <CardDescription>
            Você está prestes a excluir permanentemente este usuário. Esta ação não pode ser desfeita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A exclusão deste usuário removerá todos os seus dados do sistema, incluindo informações pessoais e
            preferências. Os pets cadastrados por este usuário permanecerão no sistema, mas ficarão sem um proprietário
            associado.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir Permanentemente"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
