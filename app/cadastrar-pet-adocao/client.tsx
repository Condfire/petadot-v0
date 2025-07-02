"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { AdoptionPetForm } from "@/components/AdoptionPetForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdoptionPetFormWrapper() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [ongData, setOngData] = useState<{ id: string; name: string } | null>(null)
  const [loadingOng, setLoadingOng] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadOng() {
      if (isLoading) return

      if (!user) {
        router.push("/login?redirectTo=/cadastrar-pet-adocao")
        return
      }

      const { data, error } = await supabase
        .from("ongs")
        .select("id, name")
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        setError("ONG não encontrada. Verifique se sua conta está configurada.")
      } else {
        setOngData(data)
      }

      setLoadingOng(false)
    }

    loadOng()
  }, [isLoading, user, router, supabase])

  const handleSuccess = () => {
    setSuccess(true)
    setError(null)
    window.scrollTo(0, 0)
    setTimeout(() => {
      router.push("/ongs/dashboard")
      router.refresh()
    }, 3000)
  }

  const handleError = (message: string) => {
    setError(message)
    setSuccess(false)
    window.scrollTo(0, 0)
  }

  if (isLoading || loadingOng) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && !ongData) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-6 w-6 text-destructive mb-2" />
        <p className="text-destructive text-center max-w-sm">{error}</p>
      </div>
    )
  }

  if (!ongData) {
    return null
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">
            Pet cadastrado com sucesso! Você será redirecionado para o dashboard.
          </AlertDescription>
        </Alert>
      )}

      <AdoptionPetForm
        ongId={ongData.id}
        ongName={ongData.name}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  )
}
