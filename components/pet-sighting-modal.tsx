"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PetSightingModalProps {
  isOpen: boolean
  onClose: () => void
  petId: string
  petName: string
}

export function PetSightingModal({ isOpen, onClose, petId, petName }: PetSightingModalProps) {
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim() || !location.trim()) {
      setError("Por favor, preencha a descrição e localização")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Simular envio - em uma implementação real, isso seria uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Avistamento enviado:", {
        petId,
        description,
        location,
        contactInfo,
      })

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setDescription("")
        setLocation("")
        setContactInfo("")
      }, 2000)
    } catch (err) {
      setError("Ocorreu um erro ao enviar o avistamento. Tente novamente.")
      console.error("Erro ao enviar avistamento:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar Avistamento de {petName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert>
              <AlertDescription>Avistamento reportado com sucesso!</AlertDescription>
            </Alert>
          ) : (
            <>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Localização do Avistamento*
                </label>
                <Textarea
                  id="location"
                  placeholder="Ex: Rua das Flores, próximo ao número 123, Bairro Centro"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição do Avistamento*
                </label>
                <Textarea
                  id="description"
                  placeholder="Ex: Vi o animal por volta das 15h. Estava sozinho e parecia perdido."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                  Informações de Contato (opcional)
                </label>
                <Textarea
                  id="contact"
                  placeholder="Ex: Meu nome é João, pode me contatar pelo telefone (11) 98765-4321"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

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
