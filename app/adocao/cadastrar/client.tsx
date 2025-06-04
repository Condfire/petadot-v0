"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdoptionPetForm } from "@/components/AdoptionPetForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface AdoptionPetFormClientProps {
  ongId: string
  ongName: string
}

export default function AdoptionPetFormClient({ ongId, ongName }: AdoptionPetFormClientProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSuccess = () => {
    console.log("Pet cadastrado com sucesso!")
    setSuccess(true)
    setError(null)
    window.scrollTo(0, 0)

    // Redirecionar após 3 segundos
    setTimeout(() => {
      router.push("/ongs/dashboard")
      router.refresh()
    }, 3000)
  }

  const handleError = (message: string) => {
    console.error("Erro ao cadastrar pet:", message)
    setError(message)
    setSuccess(false)
    window.scrollTo(0, 0)
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

      <AdoptionPetForm ongId={ongId} ongName={ongName} onSuccess={handleSuccess} onError={handleError} />
    </div>
  )
}
