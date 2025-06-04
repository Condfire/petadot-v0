"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function CadastrarPetAdocaoError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Erro ao carregar página de cadastro de pet:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Ocorreu um erro</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Não foi possível carregar o formulário de cadastro de pet. Por favor, tente novamente.
        </p>
        <Button onClick={() => reset()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
