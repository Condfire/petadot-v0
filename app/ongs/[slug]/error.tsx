"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function OngError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container py-12 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Não foi possível carregar os dados da ONG</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Ocorreu um erro ao tentar carregar as informações desta ONG. Por favor, tente novamente mais tarde.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} variant="default">
          Tentar novamente
        </Button>
        <Button variant="outline" asChild>
          <Link href="/ongs">Ver todas as ONGs</Link>
        </Button>
      </div>
    </div>
  )
}
