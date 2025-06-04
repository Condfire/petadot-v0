"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ShareSuccessStoryModal } from "@/components/share-success-story-modal"

type PetType = "adoption" | "lost" | "found"
type ResolutionStatus = "adopted" | "resolved" | "reunited"

interface PetStatusButtonProps {
  petId: string
  petType: PetType
  petName?: string
  onSuccess?: () => void
  className?: string
}

// Exportando como named export para resolver o erro
export function PetStatusButton({ petId, petType, petName = "", onSuccess, className }: PetStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessStoryModal, setShowSuccessStoryModal] = useState(false)
  const router = useRouter()

  // Determinar texto e status baseado no tipo de pet
  let buttonText: string
  let dialogTitle: string
  let dialogDescription: string
  let status: ResolutionStatus

  switch (petType) {
    case "adoption":
      buttonText = "Marcar como Adotado"
      dialogTitle = "Confirmar Adoção"
      dialogDescription = "Que ótima notícia! Por favor, confirme que este pet foi adotado."
      status = "adopted"
      break
    case "lost":
      buttonText = "Marcar como Encontrado"
      dialogTitle = "Confirmar Encontro"
      dialogDescription = "Que ótima notícia! Por favor, confirme que este pet foi encontrado."
      status = "resolved"
      break
    case "found":
      buttonText = "Marcar como Reunido"
      dialogTitle = "Confirmar Reunião"
      dialogDescription = "Que ótima notícia! Por favor, confirme que este pet foi reunido com seu tutor."
      status = "reunited"
      break
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      console.log("Enviando dados:", { petId, petType, status, notes })

      const response = await fetch("/api/pets/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId,
          petType,
          status,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Falha ao resolver o pet")
      }

      // Fechar o diálogo
      setIsOpen(false)

      // Chamar o callback de sucesso, se fornecido
      if (onSuccess) {
        onSuccess()
      }

      // Recarregar a página para mostrar as mudanças
      router.refresh()

      // Mostrar modal para compartilhar história
      setShowSuccessStoryModal(true)
    } catch (err) {
      console.error("Erro ao resolver pet:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao processar sua solicitação")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShareStory = (e: React.MouseEvent) => {
    e.preventDefault() // Impede qualquer navegação padrão
    e.stopPropagation() // Impede propagação do evento
    setShowSuccessStoryModal(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="success" className={className}>
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Adicione detalhes sobre como o pet foi encontrado/adotado/reunido (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Botão para compartilhar história diretamente */}
      <Button type="button" variant="outline" className="w-full mt-2" onClick={handleShareStory}>
        Compartilhar minha história
      </Button>

      {showSuccessStoryModal && (
        <ShareSuccessStoryModal
          petId={petId}
          petType={petType}
          petName={petName}
          open={showSuccessStoryModal}
          onOpenChange={setShowSuccessStoryModal}
        />
      )}
    </>
  )
}
