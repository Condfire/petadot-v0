"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

type ModerationActionsProps = {
  id: string
  type: "adoption" | "lost" | "found" | "event" | "pet_story"
  onModerated?: () => void
}

export function ModerationActions({ id, type, onModerated }: ModerationActionsProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const getTableName = () => {
    switch (type) {
      case "adoption":
      case "lost":
      case "found":
        return "pets" // All pet types use the unified pets table
      case "event":
        return "events"
      case "pet_story":
        return "pet_stories"
      default:
        return ""
    }
  }

  const handleApprove = async () => {
    setIsApproving(true)
    setError(null)

    try {
      const tableName = getTableName()

      if (!tableName) {
        throw new Error("Tipo de item inválido")
      }

      console.log(`Aprovando item do tipo ${type} com ID ${id} na tabela ${tableName}`)

      const { error } = await supabase.from(tableName).update({ status: "approved" }).eq("id", id)

      if (error) {
        console.error("Erro ao aprovar:", error)
        throw error
      }

      // Revalidar páginas
      try {
        await fetch("/api/revalidate?path=/")

        if (type === "adoption") {
          await fetch("/api/revalidate?path=/adocao")
        } else if (type === "lost") {
          await fetch("/api/revalidate?path=/perdidos")
        } else if (type === "found") {
          await fetch("/api/revalidate?path=/encontrados")
        } else if (type === "event") {
          await fetch("/api/revalidate?path=/eventos")
        } else if (type === "pet_story") {
          await fetch("/api/revalidate?path=/historias")
        }
      } catch (revalidateError) {
        console.error("Erro ao revalidar páginas:", revalidateError)
      }

      toast({
        title: "Item aprovado",
        description: "O item foi aprovado com sucesso.",
      })

      // Chamar o callback se fornecido
      if (onModerated) {
        onModerated()
      }
    } catch (err: any) {
      console.error("Erro ao aprovar item:", err)
      setError(err.message || "Erro ao aprovar item")
      toast({
        title: "Erro",
        description: err.message || "Erro ao aprovar item",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    setError(null)

    try {
      const tableName = getTableName()

      if (!tableName) {
        throw new Error("Tipo de item inválido")
      }

      console.log(`Rejeitando item do tipo ${type} com ID ${id} na tabela ${tableName}`)

      const { error } = await supabase.from(tableName).update({ status: "rejected" }).eq("id", id)

      if (error) {
        console.error("Erro ao rejeitar:", error)
        throw error
      }

      toast({
        title: "Item rejeitado",
        description: "O item foi rejeitado com sucesso.",
      })

      // Chamar o callback se fornecido
      if (onModerated) {
        onModerated()
      }
    } catch (err: any) {
      console.error("Erro ao rejeitar item:", err)
      setError(err.message || "Erro ao rejeitar item")
      toast({
        title: "Erro",
        description: err.message || "Erro ao rejeitar item",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-xs text-destructive mr-2">{error}</p>}

      <Button
        variant="outline"
        size="sm"
        onClick={handleReject}
        disabled={isRejecting || isApproving}
        className="text-destructive hover:text-destructive"
      >
        {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
        Rejeitar
      </Button>

      <Button
        size="sm"
        onClick={handleApprove}
        disabled={isRejecting || isApproving}
        className="bg-green-600 hover:bg-green-700"
      >
        {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
        Aprovar
      </Button>
    </div>
  )
}
