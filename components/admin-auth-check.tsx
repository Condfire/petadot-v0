"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/app/auth-provider"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface AdminAuthCheckProps {
  children: React.ReactNode
}

export default function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const { user, isLoading } = useAuth()
  const [showContent, setShowContent] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Verificar se o usuário é admin quando não estamos carregando
    async function checkAdminStatus() {
      if (!isLoading && user) {
        try {
          // Verificar diretamente na tabela users se o usuário é admin
          const { data, error } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

          if (error) {
            console.error("Erro ao verificar status de admin:", error)
            setIsAdmin(false)
          } else {
            // Definir isAdmin com base no valor do banco de dados
            setIsAdmin(data?.is_admin === true)
            console.log("Status de admin:", data?.is_admin)
          }
        } catch (error) {
          console.error("Erro ao verificar status de admin:", error)
          setIsAdmin(false)
        } finally {
          setCheckingAdmin(false)
          setShowContent(true)
        }
      } else if (!isLoading) {
        // Se não estamos carregando e não há usuário, não é admin
        setIsAdmin(false)
        setCheckingAdmin(false)
        setShowContent(true)
      }
    }

    checkAdminStatus()
  }, [isLoading, user, supabase])

  // Enquanto estamos carregando ou verificando status de admin, mostramos um indicador
  if (isLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  // Se decidimos mostrar o conteúdo e o usuário é admin, fazemos isso
  if (showContent && isAdmin) {
    return <>{children}</>
  }

  // Se não estamos carregando e o usuário não é admin, mostramos uma mensagem
  if (showContent && !isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Acesso negado</AlertTitle>
        <AlertDescription>
          Você não tem permissão para acessar esta página. Esta área é restrita a administradores.
        </AlertDescription>
      </Alert>
    )
  }

  // Fallback - não deveria chegar aqui, mas por segurança
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}
