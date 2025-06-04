"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Pet = {
  id: string
  name: string
  category: string
  species: string
  breed: string | null
  status: string
  main_image_url: string | null
  city: string
  state: string
  created_at: string
  users?: {
    name: string
  }
}

export function PetsTable() {
  const [pets, setPets] = useState<{
    adoptionPets: Pet[]
    lostPets: Pet[]
    foundPets: Pet[]
  }>({
    adoptionPets: [],
    lostPets: [],
    foundPets: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPets()
  }, [])

  async function fetchPets() {
    try {
      // Buscar pets para adoção
      const { data: adoptionPets, error: adoptionError } = await supabase
        .from("pets")
        .select("*, users!pets_user_id_fkey(name)")
        .eq("category", "adoption")
        .order("created_at", { ascending: false })

      // Buscar pets perdidos
      const { data: lostPets, error: lostError } = await supabase
        .from("pets")
        .select("*, users!pets_user_id_fkey(name)")
        .eq("category", "lost")
        .order("created_at", { ascending: false })

      // Buscar pets encontrados
      const { data: foundPets, error: foundError } = await supabase
        .from("pets")
        .select("*, users!pets_user_id_fkey(name)")
        .eq("category", "found")
        .order("created_at", { ascending: false })

      if (adoptionError || lostError || foundError) {
        console.error("Erro ao buscar pets:", { adoptionError, lostError, foundError })
        return
      }

      setPets({
        adoptionPets: adoptionPets || [],
        lostPets: lostPets || [],
        foundPets: foundPets || [],
      })
    } catch (error) {
      console.error("Erro ao buscar pets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPets = (petsList: Pet[]) => {
    if (!searchTerm) return petsList
    return petsList.filter(
      (pet) =>
        pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.state?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const PetCard = ({ pet }: { pet: Pet }) => (
    <div className="border rounded-lg p-4">
      <div className="flex gap-4">
        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={pet.main_image_url || "/placeholder.svg?height=80&width=80&query=pet"}
            alt={pet.name || "Pet"}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium truncate">{pet.name || "Sem nome"}</h3>
              <p className="text-sm text-muted-foreground">
                {pet.species} {pet.breed && `• ${pet.breed}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {pet.city}, {pet.state}
              </p>
              <p className="text-xs text-muted-foreground">Por: {pet.users?.name || "Usuário desconhecido"}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={pet.status === "approved" ? "default" : pet.status === "pending" ? "secondary" : "destructive"}
              >
                {pet.status === "approved" ? "Aprovado" : pet.status === "pending" ? "Pendente" : "Rejeitado"}
              </Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link
                    href={`/${pet.category === "adoption" ? "adocao" : pet.category === "lost" ? "perdidos" : "encontrados"}/${pet.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/admin-alt/pets/${pet.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" asChild>
                  <Link href={`/admin-alt/pets/${pet.id}/delete`}>
                    <Trash2 className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando pets...</p>
        </div>
      </div>
    )
  }

  const totalPets = pets.adoptionPets.length + pets.lostPets.length + pets.foundPets.length

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar pets por nome, espécie, cidade..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="adoption">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="adoption">Adoção ({pets.adoptionPets.length})</TabsTrigger>
          <TabsTrigger value="lost">Perdidos ({pets.lostPets.length})</TabsTrigger>
          <TabsTrigger value="found">Encontrados ({pets.foundPets.length})</TabsTrigger>
          <TabsTrigger value="all">Todos ({totalPets})</TabsTrigger>
        </TabsList>

        <TabsContent value="adoption">
          <Card>
            <CardHeader>
              <CardTitle>Pets para Adoção</CardTitle>
              <CardDescription>Pets disponíveis para adoção na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterPets(pets.adoptionPets).map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
                {filterPets(pets.adoptionPets).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm
                      ? "Nenhum pet encontrado com os critérios de busca."
                      : "Nenhum pet para adoção cadastrado."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lost">
          <Card>
            <CardHeader>
              <CardTitle>Pets Perdidos</CardTitle>
              <CardDescription>Pets perdidos reportados na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterPets(pets.lostPets).map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
                {filterPets(pets.lostPets).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Nenhum pet encontrado com os critérios de busca." : "Nenhum pet perdido cadastrado."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="found">
          <Card>
            <CardHeader>
              <CardTitle>Pets Encontrados</CardTitle>
              <CardDescription>Pets encontrados reportados na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterPets(pets.foundPets).map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
                {filterPets(pets.foundPets).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm
                      ? "Nenhum pet encontrado com os critérios de busca."
                      : "Nenhum pet encontrado cadastrado."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Pets</CardTitle>
              <CardDescription>Lista completa de pets cadastrados na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...filterPets(pets.adoptionPets), ...filterPets(pets.lostPets), ...filterPets(pets.foundPets)]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((pet) => (
                    <PetCard key={pet.id} pet={pet} />
                  ))}
                {[...filterPets(pets.adoptionPets), ...filterPets(pets.lostPets), ...filterPets(pets.foundPets)]
                  .length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Nenhum pet encontrado com os critérios de busca." : "Nenhum pet cadastrado."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
