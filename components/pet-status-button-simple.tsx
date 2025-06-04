"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updatePetStatus } from "@/app/actions/pet-status"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PetStatusButtonSimpleProps {
  petId: string
  petType: "adoption" | "lost" | "found"
  onSuccess?: () => void
}

export function PetStatusButtonSimple({ petId, petType, onSuccess }: PetStatusButtonSimpleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Mapear o tipo de pet para o status correspondente
  const statusMap = {
    adoption: "adopted",
    lost: "resolved",
    found: "reunited",
  }

  const buttonTextMap = {
    adoption: "Marcar como adotado",
    lost: "Marcar como encontrado",
    found: "Marcar como reunido",
  }

  const handleClick = async () => {
    setIsLoading(true)

    try {
      console.log("Atualizando status do pet:", {
        petId,
        petType,
        status: statusMap[petType],
      })

      const result = await updatePetStatus(petId, petType, statusMap[petType] as any, "Atualizado via botão rápido")

      if (result.success) {
        toast({
          title: "Status atualizado",
          description: "O status do pet foi atualizado com sucesso.",
        })

        if (onSuccess) {
          onSuccess()
        }
      } else {
        throw new Error(result.error || "Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do pet. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} variant="outline" size="sm">
      {isLoading ? (
        <span className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Atualizando...
        </span>
      ) : (
        <span className="flex items-center">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {buttonTextMap[petType]}
        </span>
      )}
    </Button>
  )
}
