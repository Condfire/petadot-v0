"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"
import CadastrarPetClient from "./client"

export default function CadastrarPetPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [ongData, setOngData] = useState<{ id: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingOng, setIsLoadingOng] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadOngData() {
      if (isLoading) return // Aguarda o carregamento da autenticação

      if (!user) {
        console.log("CadastrarPetPage: Usuário não autenticado")
        router.push("/ongs/login?message=Faça login para cadastrar pets")
        return
      }

      try {
        console.log("CadastrarPetPage: Carregando dados da ONG para usuário:", user.id)

        const { data: ongData, error: ongError } = await supabase
          .from("ongs")
          .select("id, name")
          .eq("user_id", user.id)
          .single()

        if (ongError) {
          console.error("CadastrarPetPage: Erro ao buscar ONG:", ongError)
          setError("Erro ao carregar dados da ONG")
          return
        }

        if (!ongData) {
          console.log("CadastrarPetPage: ONG não encontrada para o usuário:", user.id)
          setError("ONG não encontrada. Verifique se sua conta está corretamente configurada.")
          return
        }

        console.log("CadastrarPetPage: ONG encontrada:", ongData.id, ongData.name)
        setOngData(ongData)
      } catch (error) {
        console.error("CadastrarPetPage: Erro inesperado:", error)
        setError("Erro inesperado ao carregar dados")
      } finally {
        setIsLoadingOng(false)
      }
    }

    loadOngData()
  }, [user, isLoading, router, supabase])

  // Mostra loading enquanto carrega autenticação ou dados da ONG
  if (isLoading || isLoadingOng) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // Mostra erro se houver
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-destructive mb-4">Erro: {error}</p>
        <button onClick={() => router.push("/ongs/dashboard")} className="px-4 py-2 bg-primary text-white rounded-md">
          Voltar ao Dashboard
        </button>
      </div>
    )
  }

  // Renderiza o componente se tudo estiver OK
  if (ongData) {
    return <CadastrarPetClient ongId={ongData.id} ongName={ongData.name} />
  }

  // Fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <p className="text-muted-foreground">Carregando dados da ONG...</p>
    </div>
  )
}
