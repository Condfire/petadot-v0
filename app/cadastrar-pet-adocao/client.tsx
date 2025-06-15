"use client"

import { useState } from "react"
import { AdoptionPetForm } from "@/components/AdoptionPetForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, CheckCircle } from "lucide-react"

export default function AdoptionPetFormWrapper() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSuccess = () => {
    setSuccessMessage("Pet cadastrado com sucesso! Redirecionando...")
    setErrorMessage(null) // Clear any previous errors
  }

  const handleError = (message: string) => {
    setErrorMessage(message)
    setSuccessMessage(null) // Clear any previous success messages
  }

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erro no Cadastro</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-700 mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sucesso!</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <AdoptionPetForm
        onSuccess={handleSuccess}
        onError={handleError}
        // ongId e ongName não são passados aqui, pois esta é a página de cadastro geral
        // A lógica dentro do AdoptionPetForm já lida com eles como opcionais.
      />
    </>
  )
}
