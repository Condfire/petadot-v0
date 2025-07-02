"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Erro na página de administração:", error)
  }, [error])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erro ao carregar a página de administração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Ocorreu um erro ao carregar a página de administração. Por favor, tente novamente.</p>
          <div className="bg-muted p-4 rounded-md overflow-auto">
            <pre className="text-sm">{error.message}</pre>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="outline">
            Tentar novamente
          </Button>
          <Button asChild>
            <Link href="/dashboard">Voltar para o Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
