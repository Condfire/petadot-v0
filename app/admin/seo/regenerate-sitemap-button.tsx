"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function RegenerateSitemapButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  const regenerateSitemap = async () => {
    try {
      setStatus("loading")

      const response = await fetch("/api/admin/regenerate-sitemap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao regenerar sitemap")
      }

      setStatus("success")
      setMessage(data.message || "Sitemap regenerado com sucesso!")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Erro desconhecido")
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={regenerateSitemap} disabled={status === "loading"} variant="secondary">
        {status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerando...
          </>
        ) : (
          "Regenerar Sitemap"
        )}
      </Button>

      {status === "success" && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
