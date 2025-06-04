"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

// Adicione esta função para extrair mais informações do erro
function getErrorDetails(error: Error) {
  return {
    message: error.message,
    stack: error.stack,
    name: error.name,
    digest: (error as any).digest,
  }
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  // Modifique o useEffect para usar esta função
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Erro detalhado:", getErrorDetails(error))
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex items-center mb-4 text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <h2 className="text-2xl font-bold">Algo deu errado!</h2>
      </div>
      <p className="mb-6 text-muted-foreground text-center max-w-md">
        Ocorreu um erro ao carregar a página de cadastro de pet perdido. Por favor, tente novamente mais tarde.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} variant="outline">
          Tentar novamente
        </Button>
        <Button onClick={() => router.push("/")}>Voltar para a página inicial</Button>
      </div>
      <div className="mt-6 p-4 bg-gray-100 rounded-md max-w-md">
        <p className="text-sm text-gray-600">
          Se o problema persistir, por favor, entre em contato com o suporte técnico e forneça o seguinte código de
          erro: <code className="bg-gray-200 px-1 py-0.5 rounded">{error.digest || "Erro não identificado"}</code>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Mensagem de erro: <code className="bg-gray-200 px-1 py-0.5 rounded">{error.message || "Sem mensagem"}</code>
        </p>
      </div>
    </div>
  )
}
