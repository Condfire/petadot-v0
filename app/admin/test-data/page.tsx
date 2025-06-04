"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function TestDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const createTestData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-data", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Dados de teste criados com sucesso!",
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Erro ao criar dados de teste.",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao criar dados de teste. Verifique o console para mais detalhes.",
      })
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Criar Dados de Teste</CardTitle>
          <CardDescription>
            Use esta ferramenta para criar dados de teste para o sistema. Isso irá adicionar pets para adoção, perdidos
            e encontrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert className={result.success ? "bg-green-50" : "bg-red-50"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{result.success ? "Sucesso!" : "Erro!"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={createTestData} disabled={loading} className="w-full">
            {loading ? "Criando dados..." : "Criar Dados de Teste"}
          </Button>
          <div className="flex justify-between w-full">
            <Button variant="outline" asChild>
              <Link href="/adocao">Ver Pets para Adoção</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/perdidos">Ver Pets Perdidos</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
