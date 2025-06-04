"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EditEventError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container py-12 max-w-md">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center">Erro ao Editar Evento</CardTitle>
          <CardDescription className="text-center">
            Ocorreu um erro ao tentar carregar ou editar o evento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4 text-sm text-muted-foreground">
            {error.message || "Não foi possível processar sua solicitação. Por favor, tente novamente."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/ongs/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <Button onClick={() => reset()}>Tentar Novamente</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
