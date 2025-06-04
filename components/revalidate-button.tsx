"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface RevalidateButtonProps {
  path?: string
  label?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function RevalidateButton({
  path = "/",
  label = "Atualizar Página",
  className = "",
  variant = "outline",
}: RevalidateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const handleRevalidate = async () => {
    try {
      setIsLoading(true)
      setStatus("idle")

      const response = await fetch(`/api/revalidate?path=${path}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Falha ao revalidar: ${response.statusText}`)
      }

      setStatus("success")

      // Recarregar a página após um breve atraso
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Erro ao revalidar:", error)
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleRevalidate} disabled={isLoading} variant={variant} className={className}>
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⟳</span>
          Atualizando...
        </>
      ) : status === "success" ? (
        <>✓ Atualizado</>
      ) : status === "error" ? (
        <>❌ Erro</>
      ) : (
        label
      )}
    </Button>
  )
}
