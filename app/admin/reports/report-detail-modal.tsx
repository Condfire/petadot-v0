"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Report {
  id: string
  reason: string
  additional_details?: string
  status: string
  created_at: string
  pets: {
    id: string
    name: string
    slug?: string
    category: string
    main_image_url?: string
  }
  users: {
    id: string
    name: string
    email: string
  }
}

interface ReportDetailModalProps {
  report: Report
  isOpen: boolean
  onClose: () => void
}

const REASON_LABELS = {
  inappropriate_content: "Conteúdo Inapropriado",
  false_information: "Informações Falsas",
  spam_duplicate: "Spam/Duplicata",
  pet_not_available: "Pet Não Disponível",
  suspicious_activity: "Atividade Suspeita",
  other: "Outro",
}

export function ReportDetailModal({ report, isOpen, onClose }: ReportDetailModalProps) {
  const [status, setStatus] = useState(report.status)
  const [adminNotes, setAdminNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true)
      setError(null)

      const response = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar denúncia")
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        window.location.reload() // Refresh to show updated data
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar denúncia")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeletePet = async () => {
    if (!confirm(`Tem certeza que deseja excluir o pet "${report.pets.name}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      setIsUpdating(true)
      setError(null)

      const response = await fetch(`/api/admin/pets/${report.pets.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir pet")
      }

      // Update report status to resolved
      await handleUpdateStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir pet")
      setIsUpdating(false)
    }
  }

  const getPetUrl = () => {
    const baseUrl =
      report.pets.category === "adoption" ? "/adocao" : report.pets.category === "lost" ? "/perdidos" : "/encontrados"
    return `${baseUrl}/${report.pets.slug || report.pets.id}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Denúncia</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Denúncia atualizada com sucesso!</AlertDescription>
            </Alert>
          )}

          {/* Pet Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Pet Denunciado</h3>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              {report.pets.main_image_url && (
                <img
                  src={report.pets.main_image_url || "/placeholder.svg"}
                  alt={report.pets.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{report.pets.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {report.pets.category === "adoption"
                    ? "Para Adoção"
                    : report.pets.category === "lost"
                      ? "Perdido"
                      : "Encontrado"}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={getPetUrl()} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver Pet
                </Link>
              </Button>
            </div>
          </div>

          {/* Report Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Informações da Denúncia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Motivo</Label>
                <p className="text-sm">{REASON_LABELS[report.reason] || report.reason}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Data</Label>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(report.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {report.additional_details && (
              <div>
                <Label className="text-sm font-medium">Detalhes Adicionais</Label>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{report.additional_details}</p>
              </div>
            )}
          </div>

          {/* Reporter Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Denunciante</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm">{report.users.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm">{report.users.email}</p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Ações do Administrador</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status da Denúncia</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="reviewed">Em Análise</SelectItem>
                    <SelectItem value="resolved">Resolvida</SelectItem>
                    <SelectItem value="dismissed">Descartada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="adminNotes">Notas do Administrador</Label>
              <Textarea
                id="adminNotes"
                placeholder="Adicione notas sobre a análise desta denúncia..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="destructive" onClick={handleDeletePet} disabled={isUpdating}>
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir Pet
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                  {isUpdating ? "Atualizando..." : "Atualizar Status"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
