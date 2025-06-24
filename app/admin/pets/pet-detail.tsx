"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PetStatusButton } from "@/components/pet-status-button"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { Loader2, AlertCircle, ArrowLeft, Edit, Trash2 } from "lucide-react"
import {
  mapPetAge,
  mapPetColor,
  mapPetGender,
  mapPetSize,
  mapPetSpecies,
} from "@/lib/utils"

interface PetDetailProps {
  petId: string
  petType: "adoption" | "lost" | "found"
}

export function PetDetail({ petId, petType }: PetDetailProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [pet, setPet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPet() {
      setIsLoading(true)
      setError(null)

      try {
        let tableName = ""
        switch (petType) {
          case "adoption":
            tableName = "pets"
            break
          case "lost":
            tableName = "pets_lost"
            break
          case "found":
            tableName = "pets_found"
            break
          default:
            throw new Error("Tipo de pet inválido")
        }

        const { data, error } = await supabase.from(tableName).select("*").eq("id", petId).single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error("Pet não encontrado")
        }

        setPet({ ...data, type: petType })
      } catch (err) {
        console.error("Erro ao carregar pet:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar pet")
      } finally {
        setIsLoading(false)
      }
    }

    if (petId && petType) {
      fetchPet()
    }
  }, [petId, petType, supabase])

  const handleStatusUpdate = () => {
    router.refresh()
    // Recarregar os dados do pet
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  // Verificar se o pet está resolvido
  const isPetResolved = () => {
    if (!pet) return false

    switch (petType) {
      case "adoption":
        return pet.adopted === true || pet.status === "adopted"
      case "lost":
        return pet.resolved === true || pet.status === "resolved"
      case "found":
        return pet.reunited === true || pet.status === "reunited"
      default:
        return false
    }
  }

  // Obter a data de resolução
  const getResolutionDate = () => {
    if (!pet) return undefined

    switch (petType) {
      case "adoption":
        return pet.adopted_at
      case "lost":
        return pet.resolved_at
      case "found":
        return pet.reunited_at
      default:
        return undefined
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro ao carregar pet</h2>
        <p className="text-muted-foreground text-center mb-4">{error || "Pet não encontrado"}</p>
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">{pet.name || "Pet sem nome"}</h1>
        <Badge variant="outline">
          {petType === "adoption" ? "Adoção" : petType === "lost" ? "Perdido" : "Encontrado"}
        </Badge>
      </div>

      {isPetResolved() && (
        <div className="mb-4">
          <PetResolvedAlert type={petType} date={getResolutionDate()} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-square w-full">
                <Image
                  src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=400&width=400&query=pet"}
                  alt={pet.name || "Pet"}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <span className="text-sm">Cadastrado em: {formatDate(pet.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm">
                      {pet.city}, {pet.state}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex justify-between w-full">
                <Button variant="outline" asChild>
                  <a href={`/admin/pets/${petType}/${pet.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </a>
                </Button>
                <Button variant="destructive" asChild>
                  <a href={`/admin/pets/${petType}/${pet.id}/delete`}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </a>
                </Button>
              </div>

              {!isPetResolved() && (
                <PetStatusButton petId={pet.id} petType={petType} petName={pet.name} onSuccess={handleStatusUpdate} />
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pet</CardTitle>
              <CardDescription>Detalhes completos sobre o pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="contact">Contato</TabsTrigger>
                  <TabsTrigger value="user">Usuário</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Espécie</h3>
                      <p>{mapPetSpecies(pet.species)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Raça</h3>
                      <p>{pet.breed || "Não informado"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Idade</h3>
                      <p>{mapPetAge(pet.age)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Porte</h3>
                      <p>{mapPetSize(pet.size)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Sexo</h3>
                      <p>{mapPetGender(pet.gender)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Cor</h3>
                      <p>{mapPetColor(pet.color)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
                    <p className="whitespace-pre-line">{pet.description || "Sem descrição"}</p>
                  </div>

                  {petType === "adoption" && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Saúde</h3>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <Badge variant={pet.is_vaccinated ? "default" : "outline"}>
                            {pet.is_vaccinated ? "Vacinado" : "Não vacinado"}
                          </Badge>
                          <Badge variant={pet.is_neutered ? "default" : "outline"}>
                            {pet.is_neutered ? "Castrado" : "Não castrado"}
                          </Badge>
                          <Badge variant={pet.is_dewormed ? "default" : "outline"}>
                            {pet.is_dewormed ? "Vermifugado" : "Não vermifugado"}
                          </Badge>
                        </div>
                        <p className="whitespace-pre-line">{pet.special_needs || "Sem necessidades especiais"}</p>
                      </div>
                    </>
                  )}

                  {petType === "lost" && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Data em que foi visto pela última vez
                          </h3>
                          <p>{pet.last_seen_date ? formatDate(pet.last_seen_date) : "Não informado"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Local onde foi visto pela última vez
                          </h3>
                          <p>{pet.last_seen_location || "Não informado"}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {petType === "found" && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Data em que foi encontrado</h3>
                          <p>{pet.found_date ? formatDate(pet.found_date) : "Não informado"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Local onde foi encontrado</h3>
                          <p>{pet.found_location || "Não informado"}</p>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="contact">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Nome de Contato</h3>
                      <p>{pet.contact_name || pet.contact || "Não informado"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefone de Contato</h3>
                      <p>{pet.contact_phone || pet.contact || "Não informado"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Email de Contato</h3>
                      <p>{pet.contact_email || "Não informado"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="user">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ID do Usuário</h3>
                      <p>{pet.user_id || "Não informado"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ID da ONG</h3>
                      <p>{pet.ong_id || "Não associado a uma ONG"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                      <Badge
                        variant={
                          pet.status === "approved"
                            ? "default"
                            : pet.status === "pending"
                              ? "secondary"
                              : pet.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {pet.status === "approved"
                          ? "Aprovado"
                          : pet.status === "pending"
                            ? "Pendente"
                            : pet.status === "rejected"
                              ? "Rejeitado"
                              : pet.status || "Não definido"}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Criação</h3>
                      <p>{formatDate(pet.created_at)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Última Atualização</h3>
                      <p>{pet.updated_at ? formatDate(pet.updated_at) : "Não atualizado"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
