"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AdminAltAuthCheckProps {
  children: React.ReactNode
}

export default function AdminAltAuthCheck({ children }: AdminAltAuthCheckProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Verificar se o usuário está autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setUser(user)

        if (!user) {
          setIsAdmin(false)
          setIsLoading(false)
          return
        }

        // Verificar se o usuário é admin
        const { data, error } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

        if (error) {
          console.error("Erro ao verificar status de admin:", error)
          setIsAdmin(false)
        } else {
          setIsAdmin(data?.is_admin === true)
          console.log("Status de admin no AdminAltAuthCheck:", data?.is_admin)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()

    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null)

        if (session?.user) {
          // Verificar se o usuário é admin
          const { data, error } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

          if (!error && data) {
            setIsAdmin(data.is_admin === true)
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAdmin(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  // Enquanto estamos carregando, mostramos um indicador
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  // Se o usuário é admin, mostramos o conteúdo
  if (isAdmin) {
    return <>{children}</>
  }

  // Se o usuário não é admin, mostramos uma mensagem
  return (
    <div className="container mx-auto py-10">
      <Alert variant="destructive">
        <AlertTitle>Acesso negado</AlertTitle>
        <AlertDescription>
          Você não tem permissão para acessar esta página. Esta área é restrita a administradores.
        </AlertDescription>
      </Alert>
    </div>
  )
}
