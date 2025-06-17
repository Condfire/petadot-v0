"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ReportDetailModal } from "./report-detail-modal"

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

interface ReportsTableProps {
  reports: Report[]
}

const REASON_LABELS = {
  inappropriate_content: "Conteúdo Inapropriado",
  false_information: "Informações Falsas",
  spam_duplicate: "Spam/Duplicata",
  pet_not_available: "Pet Não Disponível",
  suspicious_activity: "Atividade Suspeita",
  other: "Outro",
}

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-800",
}

const STATUS_LABELS = {
  pending: "Pendente",
  reviewed: "Em Análise",
  resolved: "Resolvida",
  dismissed: "Descartada",
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const getPetUrl = (pet: Report["pets"]) => {
    const baseUrl = pet.category === "adoption" ? "/adocao" : pet.category === "lost" ? "/perdidos" : "/encontrados"
    return `${baseUrl}/${pet.slug || pet.id}`
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pet</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Denunciante</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma denúncia encontrada
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {report.pets.main_image_url && (
                        <img
                          src={report.pets.main_image_url || "/placeholder.svg"}
                          alt={report.pets.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{report.pets.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {report.pets.category === "adoption"
                            ? "Adoção"
                            : report.pets.category === "lost"
                              ? "Perdido"
                              : "Encontrado"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium text-sm">{REASON_LABELS[report.reason] || report.reason}</div>
                      {report.additional_details && (
                        <div className="text-xs text-muted-foreground truncate">{report.additional_details}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{report.users.name}</div>
                      <div className="text-xs text-muted-foreground">{report.users.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[report.status]}>{STATUS_LABELS[report.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(report.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={getPetUrl(report.pets)} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedReport && (
        <ReportDetailModal report={selectedReport} isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </>
  )
}
