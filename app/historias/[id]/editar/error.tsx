"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditarHistoriaError({
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
      <Card>
        <CardHeader>
          <CardTitle>Erro</CardTitle>
          <CardDescription>Ocorreu um erro ao carregar a página de edição da história.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Por favor, tente novamente mais tarde ou entre em contato com o suporte se o problema persistir.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={reset}>
            Tentar novamente
          </Button>
          <Button asChild>
            <Link href="/historias">Voltar para histórias</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
