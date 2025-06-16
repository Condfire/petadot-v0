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
import { Loader2 } from "lucide-react"

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
    description: "Pet não existe ou informações falsas",
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
    description: "Dados do pet estão errados",
  },
  {
    value: "already_adopted",
    label: "Já foi adotado",
    description: "Pet já encontrou um lar",
  },
  {
    value: "other",
    label: "Outro motivo",
    description: "Outro problema não listado",
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
        description: "Sua denúncia foi enviada com sucesso. Nossa equipe irá analisá-la.",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Denunciar Pet</DialogTitle>
          <DialogDescription>
            Você está denunciando {petName}. Por favor, selecione o motivo da denúncia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Motivo da denúncia</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
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

          <div>
            <Label htmlFor="details" className="text-base font-medium">
              Detalhes adicionais (opcional)
            </Label>
            <Textarea
              id="details"
              placeholder="Forneça mais informações sobre o problema..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Denúncia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
