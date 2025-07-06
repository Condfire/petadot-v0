"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { AdoptionPetForm } from "@/components/AdoptionPetForm"
import { createAdoptionPet } from "@/app/actions/pet-actions"
import { useAuth } from "@/app/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdoptionPetFormWrapper() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user, isLoading } = useAuth()
  const [ongId, setOngId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [state, formAction] = useActionState(createAdoptionPet, null)

  useEffect(() => {
    const fetchOng = async () => {
      if (isLoading) return
      if (!user) {
        router.push("/ongs/login?message=Faça login para cadastrar pets")
        return
      }

      const { data, error } = await supabase
        .from("ongs")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        setLoadError(
          "ONG não encontrada. Verifique se sua conta está corretamente configurada.",
        )
        return
      }

      setOngId(data.id)
    }

    fetchOng()
  }, [isLoading, user, supabase, router])

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Sucesso!",
        description: state.message,
        variant: "default",
      })
      setTimeout(() => router.push("/ongs/dashboard"), 2000)
    } else if (state?.error) {
      toast({
        title: "Erro ao cadastrar pet",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, router])

  if (isLoading || (!ongId && !loadError)) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <button
          onClick={() => router.push("/ongs/dashboard")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Voltar
        </button>
      </div>
    )
  }

  return <AdoptionPetForm action={formAction} ongId={ongId as string} />
}
