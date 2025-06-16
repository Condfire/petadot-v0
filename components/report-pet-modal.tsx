"use client"

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
    label: "Conteúdo inapropriado",
    description: "Imagens ou descrições inadequadas",
  },
  {
    value: "fake_listing",
    label: "Anúncio falso",
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
    label: "Informações incorretas",
    description: "Dados falsos sobre o animal",
  },
  {
    value: "already_adopted",
    label: "Já foi adotado",
    description: "Animal já encontrou um lar",
  },
  {
    value: "other",
    label: "Outro motivo",
    description: "Especifique nos detalhes",
  },
]

export function ReportPetModal({ isOpen, onClose, petId, petName }: ReportPetModalProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
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
        description: "Sua denúncia foi registrada e será analisada pela nossa equipe.",
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

        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Motivo da denúncia</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
              {REPORT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={reason.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {reason.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{reason.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="details" className="text-base font-medium">
              Detalhes adicionais (opcional)
            </Label>
            <Textarea
              id="details"
              placeholder="Forneça mais informações sobre sua denúncia..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-2"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{details.length}/500 caracteres</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="bg-red-600 hover:bg-red-700"
          >
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
      </DialogContent>
    </Dialog>
  )
}
