"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

type TableConfig = {
  title: string
  description: string
  table: string
  endpoint: string
}

const tableConfigs: TableConfig[] = [
  {
    title: "Pets para Adoção",
    description: "Gerar slugs para todos os pets disponíveis para adoção",
    table: "pets",
    endpoint: "/api/admin/generate-slugs?table=pets",
  },
  {
    title: "Pets Perdidos",
    description: "Gerar slugs para todos os pets perdidos",
    table: "pets_lost",
    endpoint: "/api/admin/generate-slugs?table=pets_lost",
  },
  {
    title: "Pets Encontrados",
    description: "Gerar slugs para todos os pets encontrados",
    table: "pets_found",
    endpoint: "/api/admin/generate-slugs?table=pets_found",
  },
  {
    title: "ONGs",
    description: "Gerar slugs para todas as ONGs",
    table: "ongs",
    endpoint: "/api/admin/generate-slugs?table=ongs",
  },
  {
    title: "Eventos",
    description: "Gerar slugs para todos os eventos",
    table: "events",
    endpoint: "/api/admin/generate-slugs?table=events",
  },
  {
    title: "Parceiros",
    description: "Gerar slugs para todos os parceiros",
    table: "partners",
    endpoint: "/api/admin/generate-slugs?table=partners",
  },
]

export default function SlugGeneratorClient() {
  const [results, setResults] = useState<
    Record<string, { status: "idle" | "loading" | "success" | "error"; message?: string }>
  >({})

  const generateSlugs = async (table: string, endpoint: string) => {
    try {
      setResults((prev) => ({
        ...prev,
        [table]: { status: "loading" },
      }))

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar slugs")
      }

      setResults((prev) => ({
        ...prev,
        [table]: { status: "success", message: data.message },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [table]: { status: "error", message: error instanceof Error ? error.message : "Erro desconhecido" },
      }))
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tableConfigs.map((config) => (
        <Card key={config.table}>
          <CardHeader>
            <CardTitle>{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => generateSlugs(config.table, config.endpoint)}
                disabled={results[config.table]?.status === "loading"}
              >
                {results[config.table]?.status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
                  </>
                ) : (
                  "Gerar Slugs"
                )}
              </Button>

              {results[config.table]?.status === "success" && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
                  <AlertDescription className="text-green-700">{results[config.table].message}</AlertDescription>
                </Alert>
              )}

              {results[config.table]?.status === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{results[config.table].message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
