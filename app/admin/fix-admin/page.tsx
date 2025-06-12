"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react"

export default function FixAdminPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [fixing, setFixing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  const checkAdminStatus = async () => {
    setFixing(true)

    try {
      // Verificar se o usuário está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para verificar o status de administrador.",
          variant: "destructive",
        })
        return
      }

      // Verificar se o usuário é admin
      const { data, error } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

      if (error) {
        console.error("Erro ao verificar status de admin:", error)
        toast({
          title: "Erro",
          description: `Erro ao verificar status de administrador: ${error.message}`,
          variant: "destructive",
        })
        setIsAdmin(false)
      } else {
        setIsAdmin(data?.is_admin === true)

        if (data?.is_admin === true) {
          toast({
            title: "Sucesso",
            description: "Você já é um administrador.",
          })
        } else {
          toast({
            title: "Aviso",
            description: "Você não é um administrador. Clique em 'Corrigir Status' para se tornar um administrador.",
            variant: "default",
          })
        }
      }
    } catch (error: any) {
      console.error("Erro ao verificar autenticação:", error)
      toast({
        title: "Erro",
        description: `Erro ao verificar autenticação: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setFixing(false)
    }
  }

  const fixAdminStatus = async () => {
    setFixing(true)

    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para corrigir o status de administrador.",
          variant: "destructive",
        })
        return
      }

      // Atualizar o status de admin diretamente
      const { error } = await supabase.from("users").update({ is_admin: true }).eq("id", user.id)

      if (error) {
        console.error("Erro ao atualizar status de admin:", error)
        toast({
          title: "Erro",
          description: `Erro ao atualizar status de administrador: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setIsAdmin(true)
        toast({
          title: "Sucesso",
          description: "Você agora é um administrador.",
        })

        // Recarregar a página após 2 segundos
        setTimeout(() => {
          window.location.href = "/admin/users"
        }, 2000)
      }
    } catch (error: any) {
      console.error("Erro ao atualizar status de admin:", error)
      toast({
        title: "Erro",
        description: `Erro ao atualizar status de administrador: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a página inicial
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Verificar e Corrigir Status de Administrador
          </CardTitle>
          <CardDescription>Use esta página para verificar e corrigir seu status de administrador.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Se você está tendo problemas para acessar o painel de administração, esta ferramenta pode ajudar a
              verificar e corrigir seu status de administrador.
            </p>

            {isAdmin === true && (
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <p className="text-green-800 font-medium">Você é um administrador.</p>
                <p className="text-green-600 text-sm mt-1">Você deve ter acesso completo ao painel de administração.</p>
              </div>
            )}

            {isAdmin === false && (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-yellow-800 font-medium">Você não é um administrador.</p>
                <p className="text-yellow-600 text-sm mt-1">
                  Clique em "Corrigir Status" para se tornar um administrador.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={checkAdminStatus} disabled={fixing} className="w-full sm:w-auto">
            {fixing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Status"
            )}
          </Button>

          {isAdmin === false && (
            <Button variant="default" onClick={fixAdminStatus} disabled={fixing} className="w-full sm:w-auto">
              {fixing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Corrigindo...
                </>
              ) : (
                "Corrigir Status"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
