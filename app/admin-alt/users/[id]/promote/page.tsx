"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react"
import AdminAuthCheck from "@/components/admin-auth-check"

export default function PromoteUserPage({ params }: { params: { id: string } }) {
  return (
    <AdminAuthCheck>
      <PromoteUserForm userId={params.id} />
    </AdminAuthCheck>
  )
}

function PromoteUserForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [promoting, setPromoting] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error("Usuário não encontrado")
        }

        setUser(data)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do usuário.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [userId, supabase])

  const handlePromote = async () => {
    setPromoting(true)

    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_admin: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Usuário promovido a administrador com sucesso.",
      })

      router.push("/admin-alt/users")
    } catch (error) {
      console.error("Erro ao promover usuário:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao promover o usuário.",
        variant: "destructive",
      })
    } finally {
      setPromoting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>Usuário não encontrado.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin-alt/users")}>Voltar para Usuários</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (user.is_admin) {
    return (
      <div className="container mx-auto py-10">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Usuário já é Administrador</CardTitle>
            <CardDescription>Este usuário já possui privilégios de administrador.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <p>
                <strong>{user.name || user.email}</strong> já é um administrador do sistema.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/admin-alt/users")}>Voltar para Usuários</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Promover Usuário a Administrador</CardTitle>
          <CardDescription>
            Você está prestes a conceder privilégios de administrador para este usuário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Ao promover <strong>{user.name || user.email}</strong> a administrador, você está concedendo acesso completo
            ao painel administrativo e todas as funcionalidades de gerenciamento do sistema.
          </p>
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Atenção:</strong> Administradores podem gerenciar todos os aspectos do sistema, incluindo outros
              usuários, pets, ONGs e configurações. Conceda este privilégio apenas a pessoas de confiança.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handlePromote} disabled={promoting}>
            {promoting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Promovendo...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Promover a Administrador
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
