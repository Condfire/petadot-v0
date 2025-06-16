import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

async function getReports() {
  const supabase = createServerComponentClient({ cookies })

  const { data: reports, error } = await supabase
    .from("pet_reports")
    .select(`
      *,
      pets!inner(name, slug, status),
      users!inner(email, full_name)
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

  const counts =
    stats?.reduce(
      (acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  return {
    pending: counts.pending || 0,
    reviewed: counts.reviewed || 0,
    resolved: counts.resolved || 0,
    dismissed: counts.dismissed || 0,
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />
    case "reviewed":
      return <Eye className="h-4 w-4" />
    case "resolved":
      return <CheckCircle className="h-4 w-4" />
    case "dismissed":
      return <XCircle className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "reviewed":
      return "bg-blue-100 text-blue-800"
    case "resolved":
      return "bg-green-100 text-green-800"
    case "dismissed":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-red-100 text-red-800"
  }
}

function getReasonLabel(reason: string) {
  const labels = {
    inappropriate_content: "Conteúdo Inapropriado",
    fake_listing: "Anúncio Falso",
    spam: "Spam",
    animal_abuse: "Maus-tratos",
    incorrect_information: "Informações Incorretas",
    already_adopted: "Já Adotado",
    other: "Outro",
  }
  return labels[reason as keyof typeof labels] || reason
}

export default async function AdminReportsPage() {
  const reports = await getReports()
  const stats = await getReportStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Denúncias</h1>
        <p className="text-muted-foreground">Gerencie denúncias de pets enviadas pelos usuários</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descartadas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dismissed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Denúncias Recentes</CardTitle>
          <CardDescription>Lista de todas as denúncias enviadas pelos usuários</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma denúncia encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{report.pets.name}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(report.status)}
                            {report.status}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Motivo:</strong> {getReasonLabel(report.reason)}
                      </p>
                      {report.details && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Detalhes:</strong> {report.details}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Denunciado por: {report.users.full_name || report.users.email} •{" "}
                        {new Date(report.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/pets/${report.pet_id}`}>Ver Pet</Link>
                      </Button>
                    </div>
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
