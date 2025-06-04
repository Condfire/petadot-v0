"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HistoriaDetalhesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Algo deu errado</h1>
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro ao carregar esta história. Por favor, tente novamente mais tarde.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>Tentar novamente</Button>
          <Button variant="outline" asChild>
            <Link href="/historias">Voltar para histórias</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
