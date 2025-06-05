"use client"

import { useEffect, useState } from "react"
import { getPetsForAdoption, getLostPets, getFoundPets } from "@/lib/supabase-simple"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TestPetsPage() {
  const [adoptionPets, setAdoptionPets] = useState<any>(null)
  const [lostPets, setLostPets] = useState<any>(null)
  const [foundPets, setFoundPets] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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

  const PetsList = ({ title, data, emoji }: { title: string; data: any; emoji: string }) => (
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
                <strong>Exibindo:</strong> {data.data.length} pets
              </div>
              <div>
                <strong>Por página:</strong> {data.pageSize}
              </div>
            </div>

            {data.data.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-semibold">Pets encontrados:</h4>
                {data.data.map((pet: any, index: number) => (
                  <div key={pet.id || index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{pet.name}</h5>
                        <p className="text-sm text-gray-600">
                          {pet.species} • {pet.breed}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          pet.status?.toLowerCase().includes("approved") ||
                          pet.status?.toLowerCase().includes("aprovado")
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pet.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum pet aprovado encontrado</p>
                <p className="text-sm mt-2">Verifique se existem pets com status "approved" ou "aprovado"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">Carregando...</div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🧪 Teste - Filtragem de Pets</h1>
        <Button onClick={testAllPets} disabled={loading}>
          {loading ? "Testando..." : "Testar Novamente"}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Instruções:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Esta página testa as funções de filtragem de pets aprovados</li>
          <li>• Abra o console do navegador (F12) para ver logs detalhados</li>
          <li>• Apenas pets com status "approved" ou "aprovado" devem aparecer</li>
          <li>• Se não aparecer nenhum pet, verifique se existem pets aprovados no banco</li>
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
