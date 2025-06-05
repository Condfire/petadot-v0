"use client"

import { useEffect, useState } from "react"
import { debugPetStatuses, supabase } from "@/lib/supabase-simple"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [statusData, setStatusData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    try {
      // Chama a função de debug
      await debugPetStatuses()

      // Busca dados para exibir na tela
      // const { supabase } = await import("@/lib/supabase-simple")

      const { data: pets, error } = await supabase
        .from("pets")
        .select("id, name, status, category, created_at")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Erro ao buscar pets:", error)
        return
      }

      // Contar status
      const statusCount: Record<string, number> = {}
      const categoryCount: Record<string, Record<string, number>> = {
        adoption: {},
        lost: {},
        found: {},
      }

      pets?.forEach((pet) => {
        const status = pet.status || "null"
        statusCount[status] = (statusCount[status] || 0) + 1

        if (!categoryCount[pet.category]) {
          categoryCount[pet.category] = {}
        }
        categoryCount[pet.category][status] = (categoryCount[pet.category][status] || 0) + 1
      })

      setStatusData({
        pets: pets || [],
        statusCount,
        categoryCount,
        total: pets?.length || 0,
      })
    } catch (error) {
      console.error("Erro no debug:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDebug()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔍 Debug - Status dos Pets</h1>
        <Button onClick={runDebug} disabled={loading}>
          {loading ? "Carregando..." : "Atualizar"}
        </Button>
      </div>

      {statusData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status Geral */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Status Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Total de pets:</strong> {statusData.total}
                </p>
                {Object.entries(statusData.statusCount).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span
                      className={`font-mono ${
                        status.toLowerCase().includes("approved") || status.toLowerCase().includes("aprovado")
                          ? "text-green-600 font-bold"
                          : status.toLowerCase().includes("pending") || status.toLowerCase().includes("pendente")
                            ? "text-yellow-600"
                            : status.toLowerCase().includes("rejected") || status.toLowerCase().includes("rejeitado")
                              ? "text-red-600"
                              : "text-gray-600"
                      }`}
                    >
                      "{status}"
                    </span>
                    <span className="font-bold">{count as number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status por Categoria */}
          {Object.entries(statusData.categoryCount).map(([category, statuses]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>
                  {category === "adoption" ? "🏠 Adoção" : category === "lost" ? "😢 Perdidos" : "😊 Encontrados"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(statuses as Record<string, number>).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span
                        className={`font-mono text-sm ${
                          status.toLowerCase().includes("approved") || status.toLowerCase().includes("aprovado")
                            ? "text-green-600 font-bold"
                            : "text-gray-600"
                        }`}
                      >
                        "{status}"
                      </span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lista de Pets Recentes */}
      {statusData && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Últimos 20 Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Categoria</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {statusData.pets.map((pet: any) => (
                    <tr key={pet.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{pet.name}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            pet.category === "adoption"
                              ? "bg-blue-100 text-blue-800"
                              : pet.category === "lost"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {pet.category}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            pet.status?.toLowerCase().includes("approved") ||
                            pet.status?.toLowerCase().includes("aprovado")
                              ? "bg-green-100 text-green-800 font-bold"
                              : pet.status?.toLowerCase().includes("pending") ||
                                  pet.status?.toLowerCase().includes("pendente")
                                ? "bg-yellow-100 text-yellow-800"
                                : pet.status?.toLowerCase().includes("rejected") ||
                                    pet.status?.toLowerCase().includes("rejeitado")
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          "{pet.status}"
                        </span>
                      </td>
                      <td className="p-2 text-gray-600">{new Date(pet.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Como Interpretar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong className="text-green-600">Verde:</strong> Status aprovados (serão exibidos publicamente)
            </p>
            <p>
              <strong className="text-yellow-600">Amarelo:</strong> Status pendentes (não serão exibidos)
            </p>
            <p>
              <strong className="text-red-600">Vermelho:</strong> Status rejeitados (não serão exibidos)
            </p>
            <p>
              <strong className="text-gray-600">Cinza:</strong> Outros status
            </p>
            <hr className="my-3" />
            <p>
              <strong>Abra o console do navegador (F12)</strong> para ver logs detalhados da filtragem.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
