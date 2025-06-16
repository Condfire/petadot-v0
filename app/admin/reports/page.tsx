import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock } from "lucide-react"

async function getReports() {
  const supabase = createServerComponentClient({ cookies })

  const { data: reports, error } = await supabase
    .from("pet_reports")
    .select(`
      *,
      pets_lost:pet_id (
        id,
        name,
        slug,
        species,
        city,
        state
      ),
      users:user_id (
        id,
        name,
        email
      ),
      reviewer:reviewed_by (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error)
    return []
  }

  return reports || []
}

async function getReportStats() {
  const supabase = createServerComponentClient({ cookies })

  const { data: stats, error } = await supabase.from("pet_reports").select("status")

  if (error) {
    console.error("Error fetching report stats:", error)
    return { pending: 0, reviewed: 0, resolved: 0, dismissed: 0 }
  }

  const statusCounts =
    stats?.reduce(
      (acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  return {
    pending: statusCounts.pending || 0,
    reviewed: statusCounts.reviewed || 0,
    resolved: statusCounts.resolved || 0,
    dismissed: statusCounts.dismissed || 0,
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-yellow-600">
          <Clock className="w-3 h-3 mr-1" />
          Pendente
        </Badge>
      )
    case "reviewed":
      return (
        <Badge variant="outline" className="text-blue-600">
          <Eye className="w-3 h-3 mr-1" />
          Revisado
        </Badge>
      )
    case "resolved":
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolvido
        </Badge>
      )
    case "dismissed":
      return (
        <Badge variant="outline" className="text-gray-600">
          <XCircle className="w-3 h-3 mr-1" />
          Descartado
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getReasonLabel(reason: string) {
  const reasons = {
    inappropriate_content: "Conteúdo Inapropriado",
    fake_listing: "Anúncio Falso",
    spam: "Spam",
    animal_abuse: "Maus-tratos",
    incorrect_information: "Informação Incorreta",
    already_adopted: "Já Adotado",
    other: "Outro",
  }
  return reasons[reason as keyof typeof reasons] || reason
}

export default async function AdminReportsPage() {
  const reports = await getReports()
  const stats = await getReportStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Denúncias</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revisadas</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descartadas</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.dismissed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Denúncias</CardTitle>
          <CardDescription>Lista completa de denúncias submetidas pelos usuários</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma denúncia encontrada</div>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div key={report.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{report.pets_lost?.name || "Pet não encontrado"}</h3>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {report.pets_lost?.species} • {report.pets_lost?.city}, {report.pets_lost?.state}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Motivo:</span>
                      <Badge variant="secondary">{getReasonLabel(report.reason)}</Badge>
                    </div>

                    {report.details && (
                      <div>
                        <span className="text-sm font-medium">Detalhes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{report.details}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Denunciado por:</span>
                      <span className="text-sm">{report.users?.name || report.users?.email}</span>
                    </div>

                    {report.reviewer && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Revisado por:</span>
                        <span className="text-sm">{report.reviewer.name || report.reviewer.email}</span>
                        <span className="text-xs text-muted-foreground">
                          em {new Date(report.reviewed_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}

                    {report.admin_notes && (
                      <div>
                        <span className="text-sm font-medium">Notas do Admin:</span>
                        <p className="text-sm text-muted-foreground mt-1">{report.admin_notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {report.pets_lost?.slug && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/adocao/${report.pets_lost.slug}`} target="_blank" rel="noreferrer">
                          Ver Pet
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Gerenciar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
