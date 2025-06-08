import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, BookOpen, FileText, ArrowRight, History } from "lucide-react"
import type { User } from "@/app/auth-provider"

const StatCard = ({ title, value }: { title: string; value: number | string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

export function RegularUserDashboard({ user, stats }: { user: User; stats: any }) {
  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user.name}! Gerencie seus pets e acompanhe suas atividades.
          </p>
        </div>
        <Button asChild>
          <Link href="/adocao/cadastrar">
            <PlusCircle className="mr-2 h-4 w-4" />
            Cadastrar Pet para Adoção
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard title="Total de Pets" value={stats.total} />
            <StatCard title="Pets para Adoção" value={stats.forAdoption} />
            <StatCard title="Pets Perdidos" value={stats.lost} />
            <StatCard title="Pets Encontrados" value={stats.found} />
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <CardTitle>Atividades Recentes</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground pt-1">Seus pets cadastrados recentemente</p>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-12">
              <p className="mb-4">Você ainda não cadastrou nenhum pet.</p>
              <Button variant="secondary" asChild>
                <Link href="/perdidos/cadastrar">Cadastrar Pet</Link>
              </Button>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/pets">
              Ver Todos os Pets <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Links Rápidos</CardTitle>
              <p className="text-sm text-muted-foreground">Acesse rapidamente as principais funcionalidades</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild size="lg" className="justify-start">
                <Link href="/adocao/cadastrar">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Cadastrar Pet para Adoção
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/perdidos/cadastrar">
                  <Search className="mr-2 h-4 w-4" />
                  Reportar Pet Perdido
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/encontrados/cadastrar">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Reportar Pet Encontrado
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/historias/nova">
                  <FileText className="mr-2 h-4 w-4" />
                  Contar Minha História
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
