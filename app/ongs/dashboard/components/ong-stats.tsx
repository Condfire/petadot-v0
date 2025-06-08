"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PawPrint, Calendar, Eye, TrendingUp, Heart } from "lucide-react"

interface OngStatsProps {
  stats: {
    totalPets: number
    petsAdopted: number
    petsAdoptedThisMonth: number
    totalEvents: number
    upcomingEvents: number
    profileViews: number
    approvalRate: number
  }
}

export default function OngStats({ stats }: OngStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Pets</CardTitle>
          <PawPrint className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPets}</div>
          <p className="text-xs text-muted-foreground">{stats.petsAdopted} adotados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Adoções este Mês</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.petsAdoptedThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            Crescimento mensal
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">{stats.upcomingEvents} próximos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.profileViews}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={stats.approvalRate >= 80 ? "default" : "secondary"}>{stats.approvalRate}% aprovação</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
