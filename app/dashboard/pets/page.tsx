"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/app/auth-provider"
import RequireAuth from "@/components/require-auth"
import { Loader2, Plus, AlertCircle, Trash2, CheckCircle } from "lucide-react"
import { ShareSuccessStoryModal } from "@/components/share-success-story-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

function PetsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [pets, setPets] = useState<{
    adoptionPets: any[]
    lostPets: any[]
    foundPets: any[]
    resolvedPets: any[]
  }>({
    adoptionPets: [],
    lostPets: [],
    foundPets: [],
    resolvedPets: [],
  })
  const [activeTab, setActiveTab] = useState("all")
  const [sharingPet, setSharingPet] = useState<{
    id: string
    type: "adoption" | "lost" | "found"
    name: string
  } | null>(null)

  const [resolvingPet, setResolvingPet] = useState<{
    id: string
    type: "adoption" | "lost" | "found"
    name: string
  } | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [isResolving, setIsResolving] = useState(false)

  // Função para recarregar os pets
  const reloadPets = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      console.log("Buscando pets do usuário:", user.id)

      // Buscar pets para adoção
      const { data: adoptionPets, error: adoptionError } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", "adoption")

      if (adoptionError) {
        console.error("Erro ao buscar pets para adoção:", adoptionError)
      }

      // Buscar pets perdidos
      const { data: lostPets, error: lostError } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", "lost")

      if (lostError) {
        console.error("Erro ao buscar pets perdidos:", lostError)
      }

      // Buscar pets encontrados
      const { data: foundPets, error: foundError } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", "found")

      if (foundError) {
        console.error("Erro ao buscar pets encontrados:", foundError)
      }

      // Buscar pets resolvidos
      const { data: resolvedPets, error: resolvedError } = await supabase
        .from("resolved_pets")
        .select("*")
        .eq("user_id", user.id)

      if (resolvedError) {
        console.error("Erro ao buscar pets resolvidos:", resolvedError)
      }

      console.log("Pets encontrados:", {
        adoptionPets: adoptionPets || [],
        lostPets: lostPets || [],
        foundPets: foundPets || [],
        resolvedPets: resolvedPets || [],
      })

      setPets({
        adoptionPets: adoptionPets || [],
        lostPets: lostPets || [],
        foundPets: foundPets || [],
        resolvedPets: resolvedPets || [],
      })
    } catch (error) {
      console.error("Erro ao carregar pets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      reloadPets()
    }
  }, [user])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      return "Data inválida"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendente
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Aprovado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejeitado
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Encontrado
          </Badge>
        )
      case "reunited":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Reunido
          </Badge>
        )
      case "adopted":
        return (
          <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
            Adotado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getResolvedTypeLabel = (resolvedType: string) => {
    switch (resolvedType) {
      case "found":
        return "Encontrado"
      case "reunited":
        return "Reunido com o dono"
      case "adopted":
        return "Adotado"
      default:
        return "Resolvido"
    }
  }

  const getResolvedDateField = (pet: any) => {
    if (pet.resolvedType === "found") return pet.resolved_at
    if (pet.resolvedType === "reunited") return pet.reunited_at
    if (pet.resolvedType === "adopted") return pet.adopted_at
    return pet.updated_at
  }

  // Função para mapear o tipo de resolução para o tipo de tabela correto
  const getOriginalPetType = (pet: any) => {
    // Verificar o tipo original do pet com base no resolvedType
    if (pet.resolvedType === "adopted") return "adoption"
    if (pet.resolvedType === "found") return "lost"
    if (pet.resolvedType === "reunited") return "found"

    // Se não conseguir determinar, usar o type original se disponível
    return pet.type || "adoption"
  }

  const handleShareStory = (e: React.MouseEvent, id: string, type: "adoption" | "lost" | "found", name: string) => {
    e.preventDefault() // Impede qualquer navegação padrão
    e.stopPropagation() // Impede propagação do evento
    setSharingPet({ id, type, name })
  }

  const hasPets = pets.adoptionPets.length > 0 || pets.lostPets.length > 0 || pets.foundPets.length > 0
  const hasResolvedPets = pets.resolvedPets && pets.resolvedPets.length > 0
  const { toast } = useToast()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleResolvePet = async () => {
    if (!resolvingPet) return

    setIsResolving(true)
    try {
      // Determinar o tipo de resolução com base no tipo de pet
      let resolutionType: "adopted" | "resolved" | "reunited"
      switch (resolvingPet.type) {
        case "adoption":
          resolutionType = "adopted"
          break
        case "lost":
          resolutionType = "resolved"
          break
        case "found":
          resolutionType = "reunited"
          break
      }

      // Chamar a API para atualizar o status
      const response = await fetch("/api/pets/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId: resolvingPet.id,
          petType: resolvingPet.type,
          status: resolutionType,
          notes: resolutionNotes,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao resolver o pet")
      }

      // Recarregar os pets após a resolução
      await reloadPets()

      // Mostrar mensagem de sucesso
      toast({
        title: "Pet resolvido com sucesso!",
        description: `${resolvingPet.name} foi marcado como ${
          resolutionType === "adopted" ? "adotado" : resolutionType === "resolved" ? "encontrado" : "reunido"
        }.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao resolver pet:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao resolver o pet. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsResolving(false)
      setResolvingPet(null)
      setResolutionNotes("")
    }
  }

  // Renderizar todos os pets na aba "all"
  const renderAllPets = () => {
    if (!hasPets) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nenhum pet cadastrado</h2>
          <p className="text-muted-foreground text-center mb-4">
            Você ainda não cadastrou nenhum pet. Comece cadastrando um pet para adoção, perdido ou encontrado.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/adocao/cadastrar">Cadastrar para Adoção</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/perdidos/cadastrar">Cadastrar Perdido</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/encontrados/cadastrar">Cadastrar Encontrado</Link>
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pets para adoção */}
        {pets.adoptionPets.map((pet) => (
          <Card key={`adoption-${pet.id}`} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=300&width=400&query=cute+pet"}
                alt={pet.name || "Pet para adoção"}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-primary text-white">
                  Adoção
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{pet.name || "Sem nome"}</CardTitle>
                {getStatusLabel(pet.status)}
              </div>
              <CardDescription>
                {pet.species} • {pet.breed} • {pet.age}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">{pet.description || "Sem descrição"}</p>
              <p className="text-xs text-muted-foreground mt-2">Cadastrado em {formatDate(pet.created_at)}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/pets/adoption/${pet.id}/edit`}>Editar</Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => setResolvingPet({ id: pet.id, type: "adoption", name: pet.name || "Pet" })}
                  disabled={pet.status === "adopted"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolver
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Link href={`/dashboard/pets/adoption/${pet.id}/delete`}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {/* Pets perdidos */}
        {pets.lostPets.map((pet) => (
          <Card key={`lost-${pet.id}`} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=300&width=400&query=lost+pet"}
                alt={pet.name || "Pet perdido"}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-destructive text-white">
                  Perdido
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{pet.name || "Sem nome"}</CardTitle>
                {getStatusLabel(pet.status)}
              </div>
              <CardDescription>
                {pet.species} • {pet.breed} • {pet.age}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">{pet.description || "Sem descrição"}</p>
              <p className="text-xs text-muted-foreground mt-2">Perdido em {formatDate(pet.last_seen_date)}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/pets/lost/${pet.id}/edit`}>Editar</Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => setResolvingPet({ id: pet.id, type: "lost", name: pet.name || "Pet" })}
                  disabled={pet.status === "resolved"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolver
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Link href={`/dashboard/pets/lost/${pet.id}/delete`}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {/* Pets encontrados */}
        {pets.foundPets.map((pet) => (
          <Card key={`found-${pet.id}`} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=300&width=400&query=found+pet"}
                alt={pet.name || "Pet encontrado"}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-secondary text-white">
                  Encontrado
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{pet.name || "Sem nome"}</CardTitle>
                {getStatusLabel(pet.status)}
              </div>
              <CardDescription>
                {pet.species} • {pet.breed} • {pet.size}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">{pet.description || "Sem descrição"}</p>
              <p className="text-xs text-muted-foreground mt-2">Encontrado em {formatDate(pet.found_date)}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/pets/found/${pet.id}/edit`}>Editar</Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => setResolvingPet({ id: pet.id, type: "found", name: pet.name || "Pet" })}
                  disabled={pet.status === "reunited"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolver
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Link href={`/dashboard/pets/found/${pet.id}/delete`}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meus Pets</h1>
          <p className="text-muted-foreground">Gerencie seus pets cadastrados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/adocao/cadastrar">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar para Adoção
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/perdidos/cadastrar">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Perdido
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/encontrados/cadastrar">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Encontrado
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="adoption">Adoção</TabsTrigger>
          <TabsTrigger value="lost">Perdidos</TabsTrigger>
          <TabsTrigger value="found">Encontrados</TabsTrigger>
          <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderAllPets()}</TabsContent>

        <TabsContent value="adoption">
          {pets.adoptionPets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pet para adoção</h2>
              <p className="text-muted-foreground text-center mb-4">Você ainda não cadastrou nenhum pet para adoção.</p>
              <Button asChild>
                <Link href="/adocao/cadastrar">Cadastrar para Adoção</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.adoptionPets.map((pet) => (
                <Card key={`adoption-${pet.id}`} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=300&width=400&query=cute+pet"}
                      alt={pet.name || "Pet para adoção"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{pet.name || "Sem nome"}</CardTitle>
                      {getStatusLabel(pet.status)}
                    </div>
                    <CardDescription>
                      {pet.species} • {pet.breed} • {pet.age}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-2">{pet.description || "Sem descrição"}</p>
                    <p className="text-xs text-muted-foreground mt-2">Cadastrado em {formatDate(pet.created_at)}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/pets/adoption/${pet.id}/edit`}>Editar</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Link href={`/dashboard/pets/adoption/${pet.id}/delete`}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lost">
          {pets.lostPets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pet perdido</h2>
              <p className="text-muted-foreground text-center mb-4">Você ainda não cadastrou nenhum pet perdido.</p>
              <Button asChild>
                <Link href="/perdidos/cadastrar">Cadastrar Perdido</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.lostPets.map((pet) => (
                <Card key={`lost-${pet.id}`} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=300&width=400&query=lost+pet"}
                      alt={pet.name || "Pet perdido"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{pet.name || "Sem nome"}</CardTitle>
                      {getStatusLabel(pet.status)}
                    </div>
                    <CardDescription>
                      {pet.species} • {pet.breed} • {pet.age}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-2">{pet.description || "Sem descrição"}</p>
                    <p className="text-xs text-muted-foreground mt-2">Perdido em {formatDate(pet.last_seen_date)}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/pets/lost/${pet.id}/edit`}>Editar</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Link href={`/dashboard/pets/lost/${pet.id}/delete`}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="found">
          {pets.foundPets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pet encontrado</h2>
              <p className="text-muted-foreground text-center mb-4">Você ainda não cadastrou nenhum pet encontrado.</p>
              <Button asChild>
                <Link href="/encontrados/cadastrar">Cadastrar Encontrado</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.foundPets.map((pet) => (
                <Card key={`found-${pet.id}`} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=300&width=400&query=found+pet"}
                      alt={pet.name || "Pet encontrado"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{pet.name || "Sem nome"}</CardTitle>
                      {getStatusLabel(pet.status)}
                    </div>
                    <CardDescription>
                      {pet.species} • {pet.breed} • {pet.size}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-2">{pet.description || "Sem descrição"}</p>
                    <p className="text-xs text-muted-foreground mt-2">Encontrado em {formatDate(pet.found_date)}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/pets/found/${pet.id}/edit`}>Editar</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Link href={`/dashboard/pets/found/${pet.id}/delete`}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved">
          {!hasResolvedPets ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pet resolvido</h2>
              <p className="text-muted-foreground text-center mb-4">Você ainda não tem nenhum caso de pet resolvido.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.resolvedPets.map((pet) => (
                <Card key={`resolved-${pet.id}`} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=300&width=400&query=resolved+pet"}
                      alt={pet.name || "Pet resolvido"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        {getResolvedTypeLabel(pet.resolvedType)}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{pet.name || "Sem nome"}</CardTitle>
                      {getStatusLabel(pet.status)}
                    </div>
                    <CardDescription>
                      {pet.species} • {pet.breed} • {pet.age}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-2">{pet.description || "Sem descrição"}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Resolvido em {formatDate(getResolvedDateField(pet))}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => handleShareStory(e, pet.id, pet.resolvedType, pet.name)}
                      >
                        Compartilhar história
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        asChild
                      >
                        <Link href={`/dashboard/pets/${getOriginalPetType(pet)}/${pet.id}/delete`}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de compartilhamento de história */}
      {sharingPet && (
        <ShareSuccessStoryModal
          petId={sharingPet.id}
          petType={sharingPet.type}
          petName={sharingPet.name}
          open={Boolean(sharingPet)}
          onOpenChange={(open) => {
            if (!open) setSharingPet(null)
          }}
        />
      )}

      {/* Diálogo de resolução de pet */}
      <Dialog open={!!resolvingPet} onOpenChange={(open) => !open && setResolvingPet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Pet</DialogTitle>
            <DialogDescription>
              {resolvingPet?.type === "adoption" && "Marcar este pet como adotado?"}
              {resolvingPet?.type === "lost" && "Marcar este pet como encontrado?"}
              {resolvingPet?.type === "found" && "Marcar este pet como reunido com seu dono?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="resolution-notes" className="block text-sm font-medium mb-2">
              Notas (opcional)
            </label>
            <Textarea
              id="resolution-notes"
              placeholder="Adicione informações sobre como o pet foi resolvido..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolvingPet(null)}>
              Cancelar
            </Button>
            <Button onClick={handleResolvePet} disabled={isResolving}>
              {isResolving ? "Resolvendo..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PetsPage() {
  return (
    <RequireAuth>
      <div className="container py-10">
        <PetsContent />
      </div>
    </RequireAuth>
  )
}
