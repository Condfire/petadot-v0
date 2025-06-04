"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PetRecognitionModalProps {
  isOpen: boolean
  onClose: () => void
  petId: string
  petName: string
}

export function PetRecognitionModal({ isOpen, onClose, petId, petName }: PetRecognitionModalProps) {
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Por favor, forneça uma descrição do reconhecimento")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Simular envio - em uma implementação real, isso seria uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Reconhecimento enviado:", {
        petId,
        description,
      })

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setDescription("")
      }, 2000)
    } catch (err) {
      setError("Ocorreu um erro ao enviar o reconhecimento. Tente novamente.")
      console.error("Erro ao enviar reconhecimento:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reconhecer {petName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert>
              <AlertDescription>Reconhecimento enviado com sucesso!</AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Descreva onde e quando você viu este pet. Forneça o máximo de detalhes possível para ajudar o dono a
                encontrá-lo.
              </p>

              <Textarea
                placeholder="Ex: Vi este pet no Parque Municipal por volta das 15h. Estava próximo ao playground e parecia bem, mas assustado."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="resize-none"
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
