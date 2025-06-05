"use client"

import { useEffect, useState } from "react"
import { getPetsForAdoption, getLostPets, getFoundPets } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/auth-provider" // Import auth context to get current user
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TestPetsPage() {
  const [adoptionPets, setAdoptionPets] = useState<any>(null)
  const [lostPets, setLostPets] = useState<any>(null)
  const [foundPets, setFoundPets] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth() // Get current user from auth context

  const testAllPets = async () => {
    setLoading(true)
    console.log("🧪 INICIANDO TESTE DE PETS...")

    try {
      // Teste pets para adoção
      console.log("📋 Testando pets para adoção...")
      const adoption = await getPetsForAdoption(1, 10)
      setAdoptionPets(adoption)
      console.log("✅ Pets para adoção:", adoption)

      // Teste pets perdidos
      console.log("📋 Testando pets perdidos...")
      const lost = await getLostPets(1, 10)
      setLostPets(lost)
      console.log("✅ Pets perdidos:", lost)

      // Teste pets encontrados
      console.log("📋 Testando pets encontrados...")
      const found = await getFoundPets(1, 10)
      setFoundPets(found)
      console.log("✅ Pets encontrados:", found)
    } catch (error) {
      console.error("❌ Erro no teste:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testAllPets()
  }, [])

  // Helper function to determine if a pet should be visible to the current user
  const isPetVisible = (pet: any) => {
    if (!pet) return false

    const status = pet.status?.toLowerCase() || ""

    // Approved pets are visible to everyone
    if (status === "approved" || status === "aprovado") {
      return true
    }

    // For rejected or pending pets, check if the current user is the owner
    if (status === "rejected" || status === "rejeitado" || status === "pending" || status === "pendente") {
      return user && pet.user_id === user.id
    }

    // Default to not showing the pet if status is unknown
    return false
  }

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || ""

    if (statusLower === "approved" || statusLower === "aprovado") {
      return <Badge className="bg-green-500">Aprovado</Badge>
    } else if (statusLower === "rejected" || statusLower === "rejeitado") {
      return <Badge className="bg-red-500">Rejeitado</Badge>
    } else if (statusLower === "pending" || statusLower === "pendente") {
      return <Badge className="bg-yellow-500">Pendente</Badge>
    }

    return <Badge>{status}</Badge>
  }

  const PetsList = ({ title, data, emoji }: { title: string; data: any; emoji: string }) => {
    // Count visible pets
    const visiblePets = data?.data?.filter(isPetVisible) || []
    const hiddenPets = data?.data?.length - visiblePets.length || 0

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {emoji} {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Total encontrado:</strong> {data.total}
                </div>
                <div>
                  <strong>Página atual:</strong> {data.page}/{data.totalPages}
                </div>
                <div>
                  <strong>Exibindo:</strong> {visiblePets.length} pets
                  {hiddenPets > 0 && <span className="text-gray-500 ml-1">({hiddenPets} ocultos)</span>}
                </div>
                <div>
                  <strong>Por página:</strong> {data.pageSize}
                </div>
              </div>

              {!user && (
                <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Visualizando como visitante</AlertTitle>
                  <AlertDescription>
                    Você está vendo apenas os pets aprovados. Faça login para ver seus pets pendentes ou rejeitados.
                  </AlertDescription>
                </Alert>
              )}

              {visiblePets.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-semibold">Pets visíveis para você:</h4>
                  {data.data.map((pet: any, index: number) => {
                    // Only render if the pet should be visible to this user
                    if (!isPetVisible(pet)) return null

                    return (
                      <div key={pet.id || index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{pet.name}</h5>
                            <p className="text-sm text-gray-600">
                              {pet.species} • {pet.breed}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {pet.user_id === user?.id ? `${pet.user_id} (seu)` : pet.user_id}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(pet.status)}
                            {pet.user_id === user?.id && <span className="text-xs text-blue-600">Seu pet</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum pet visível para você</p>
                  <p className="text-sm mt-2">
                    {user
                      ? "Não há pets aprovados ou publicados por você nesta categoria"
                      : "Faça login para ver seus pets pendentes ou rejeitados"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">Carregando...</div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🧪 Teste - Visibilidade de Pets</h1>
        <Button onClick={testAllPets} disabled={loading}>
          {loading ? "Testando..." : "Testar Novamente"}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Regras de Visibilidade:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>Pets Aprovados:</strong> Visíveis para todos os usuários
          </li>
          <li>
            • <strong>Pets Rejeitados:</strong> Visíveis apenas para quem os publicou
          </li>
          <li>
            • <strong>Pets Pendentes:</strong> Visíveis apenas para quem os publicou
          </li>
          <li>
            • <strong>Status atual:</strong> {user ? `Logado como ${user.email}` : "Não logado (visitante)"}
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PetsList title="Pets para Adoção" data={adoptionPets} emoji="🏠" />
        <PetsList title="Pets Perdidos" data={lostPets} emoji="😢" />
        <PetsList title="Pets Encontrados" data={foundPets} emoji="😊" />
      </div>
    </div>
  )
}
