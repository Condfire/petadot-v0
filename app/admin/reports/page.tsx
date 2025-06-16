import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag, Eye, CheckCircle, XCircle } from "lucide-react"
import { ReportsTable } from "./reports-table"

async function getReports() {
  const supabase = createServerSupabaseClient()

  const { data: reports, error } = await supabase
    .from("pet_reports")
    .select(`
      *,
      pets(id, name, slug, category, main_image_url),
      users(id, name, email)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar denúncias:", error)
    return []
  }

  return reports || []
}

async function getReportStats() {
  const supabase = createServerSupabaseClient()

  const { data: stats, error } = await supabase.from("pet_reports").select("status")

  if (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return { pending: 0, reviewed: 0, resolved: 0, dismissed: 0, total: 0 }
  }

  const counts = stats.reduce(
    (acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1
      acc.total++
      return acc
    },
    { pending: 0, reviewed: 0, resolved: 0, dismissed: 0, total: 0 },
  )

  return counts
}

export default async function AdminReportsPage() {
  const [reports, stats] = await Promise.all([getReports(), getReportStats()])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Denúncias de Pets</h1>
          <p className="text-muted-foreground">Gerencie denúncias enviadas pelos usuários</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Flag className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descartadas</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.dismissed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Denúncias Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Carregando denúncias...</div>}>
            <ReportsTable reports={reports} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
