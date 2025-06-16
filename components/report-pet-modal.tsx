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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ReportPetModalProps {
  isOpen: boolean
  onClose: () => void
  petId: string
  petName: string
}

const REPORT_REASONS = [
  {
    value: "inappropriate_content",
    label: "Conteúdo Inapropriado",
    description: "Imagens ou descrições inadequadas",
  },
  {
    value: "fake_listing",
    label: "Anúncio Falso",
    description: "Suspeita de anúncio fraudulento",
  },
  {
    value: "spam",
    label: "Spam",
    description: "Anúncio repetitivo ou promocional",
  },
  {
    value: "animal_abuse",
    label: "Maus-tratos",
    description: "Suspeita de maus-tratos ao animal",
  },
  {
    value: "incorrect_information",
    label: "Informações Incorretas",
    description: "Dados falsos sobre o pet ou localização",
  },
  {
    value: "already_adopted",
    label: "Já Adotado",
    description: "Pet já foi adotado mas anúncio continua ativo",
  },
  {
    value: "other",
    label: "Outro",
    description: "Outro motivo não listado acima",
  },
]

export function ReportPetModal({ isOpen, onClose, petId, petName }: ReportPetModalProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReason) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um motivo para a denúncia.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/pets/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId,
          reason: selectedReason,
          details: details.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar denúncia")
      }

      toast({
        title: "Denúncia enviada",
        description: "Sua denúncia foi recebida e será analisada pela nossa equipe.",
      })

      // Reset form and close modal
      setSelectedReason("")
      setDetails("")
      onClose()
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar denúncia. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason("")
      setDetails("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Denunciar Pet
          </DialogTitle>
          <DialogDescription>
            Você está denunciando <strong>{petName}</strong>. Por favor, selecione o motivo da denúncia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="reason">Motivo da denúncia *</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={reason.value} className="font-medium cursor-pointer">
                      {reason.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Detalhes adicionais (opcional)</Label>
            <Textarea
              id="details"
              placeholder="Forneça mais informações sobre sua denúncia..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{details.length}/500 caracteres</p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedReason} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Denúncia"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
