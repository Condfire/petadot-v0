"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Flag } from "lucide-react"

interface ReportPetModalProps {
  isOpen: boolean
  onClose: () => void
  petId: string
  petName: string
  onReportSubmitted?: () => void
}

const REPORT_REASONS = [
  {
    id: "inappropriate_content",
    label: "Conteúdo Inapropriado",
    description: "Imagens ou descrições inadequadas",
  },
  {
    id: "false_information",
    label: "Informações Falsas",
    description: "Dados incorretos ou enganosos sobre o pet",
  },
  {
    id: "spam_duplicate",
    label: "Spam ou Duplicata",
    description: "Anúncio repetido ou spam",
  },
  {
    id: "pet_not_available",
    label: "Pet Não Disponível",
    description: "Pet já foi adotado/encontrado mas anúncio continua ativo",
  },
  {
    id: "suspicious_activity",
    label: "Atividade Suspeita",
    description: "Comportamento suspeito ou possível golpe",
  },
  {
    id: "other",
    label: "Outro",
    description: "Outro motivo não listado acima",
  },
]

export function ReportPetModal({ isOpen, onClose, petId, petName, onReportSubmitted }: ReportPetModalProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError("Por favor, selecione um motivo para a denúncia")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch("/api/pets/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId,
          reason: selectedReason,
          additionalDetails: additionalDetails.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar denúncia")
      }

      setSuccess(true)
      onReportSubmitted?.()

      setTimeout(() => {
        onClose()
        setSuccess(false)
        setSelectedReason("")
        setAdditionalDetails("")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar denúncia")
      console.error("Erro ao enviar denúncia:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setSelectedReason("")
      setAdditionalDetails("")
      setError(null)
      setSuccess(false)
    }
  }

  const selectedReasonData = REPORT_REASONS.find((r) => r.id === selectedReason)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Denunciar {petName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert>
              <AlertDescription>Denúncia enviada com sucesso! Nossa equipe irá analisar.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Motivo da denúncia*</Label>
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                  {REPORT_REASONS.map((reason) => (
                    <div key={reason.id} className="flex items-start space-x-2">
                      <RadioGroupItem value={reason.id} id={reason.id} className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={reason.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {reason.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{reason.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {selectedReason && (
                <div className="space-y-2">
                  <Label htmlFor="details" className="text-sm font-medium">
                    Detalhes adicionais {selectedReason === "other" ? "*" : "(opcional)"}
                  </Label>
                  <Textarea
                    id="details"
                    placeholder={
                      selectedReason === "other"
                        ? "Por favor, descreva o motivo da denúncia..."
                        : "Forneça mais detalhes sobre o problema (opcional)..."
                    }
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  {selectedReasonData && (
                    <p className="text-xs text-muted-foreground">Motivo selecionado: {selectedReasonData.label}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || !selectedReason || (selectedReason === "other" && !additionalDetails.trim())
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Denúncia"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
