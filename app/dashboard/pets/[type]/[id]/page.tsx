"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/app/auth-provider"
import RequireAuth from "@/components/require-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getPetById, getLostPetById, getFoundPetById, deleteUserPet } from "@/lib/supabase"
import { AlertCircle, ArrowLeft, Calendar, Edit, Loader2, MapPin, Phone, Trash, Trash2, User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { PetStatusButton } from "@/components/pet-status-button"
import { PetResolvedAlert } from "@/components/pet-resolved-alert"
import { ShareSuccessStoryModal } from "@/components/share-success-story-modal"

export default function PetDetailsPage({ params }: { params: { type: string; id: string } }) {
  return (
    <RequireAuth>
      <PetDetails type={params.type} id={params.id} />
    </RequireAuth>
  )
}

function PetDetails({ type, id }: { type: string; id: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const [pet, setPet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    async function loadPet() {
      if (!user) return

      try {
        let petData = null
        let petType = ""

        switch (type) {
          case "adoption":
            petData = await getPetById(id)
            petType = "adoption"
            break
          case "lost":
            petData = await getLostPetById(id)
            petType = "lost"
            break
          case "found":
            petData = await getFoundPetById(id)
            petType = "found"
            break
          default:
            toast({
              title: "Tipo de pet inválido",
              description: "O tipo de pet especificado não é válido.",
              variant: "destructive",
            })
            router.push("/dashboard/pets")
            return
        }

        if (!petData) {
          toast({
            title: "Pet não encontrado",
            description: "O pet que você está procurando não foi encontrado.",
            variant: "destructive",
          })
          router.push("/dashboard/pets")
          return
        }

        // Verificar se o pet pertence ao usuário
        if (petData.user_id !== user.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para visualizar este pet.",
            variant: "destructive",
          })
          router.push("/dashboard/pets")
          return
        }

        setPet({ ...petData, type: petType })
      } catch (error) {
        console.error("Erro ao carregar pet:", error)
        toast({
          title: "Erro ao carregar pet",
          description: "Ocorreu um erro ao carregar os dados do pet. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPet()
  }, [id, type, user, router])

  const handleDelete = async () => {
    if (!user || !pet) return

    setIsDeleting(true)

    try {
      console.log("Excluindo pet:", { id, userId: user.id, type: pet.type })
      const result = await deleteUserPet(id, user.id, pet.type)

      if (!result.success) {
        throw new Error(result.error || "Erro ao excluir pet")
      }

      toast({
        title: "Pet excluído com sucesso",
        description: "O pet foi excluído com sucesso.",
      })

      router.push("/dashboard/pets")
    } catch (error) {
      console.error("Erro ao excluir pet:", error)
      toast({
        title: "Erro ao excluir pet",
        description: "Ocorreu um erro ao excluir o pet. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Função para obter o título com base no tipo de pet
  const getTypeTitle = () => {
    switch (type) {
      case "adoption":
        return "Pet para Adoção"
      case "lost":
        return "Pet Perdido"
      case "found":
        return "Pet Encontrado"
      default:
        return "Pet"
    }
  }

  // Função para obter a URL de edição com base no tipo de pet
  const getEditUrl = () => {
    switch (type) {
      case "adoption":
        return `/dashboard/pets/adoption/${id}/edit`
      case "lost":
        return `/dashboard/pets/lost/${id}/edit`
      case "found":
        return `/dashboard/pets/found/${id}/edit`
      default:
        return "#"
    }
  }

  // Verificar se o pet está resolvido
  const isPetResolved = () => {
    if (!pet) return false

    switch (type) {
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

    switch (type) {
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

  const handleStatusUpdate = () => {
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Pet não encontrado</h2>
          <p className="text-gray-500 mb-4">O pet que você está procurando não foi encontrado.</p>
          <Button asChild>
            <Link href="/dashboard/pets">Voltar para Meus Pets</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">{pet.name || "Pet sem nome"}</h1>
        <Badge variant="outline" className="ml-4">
          {getTypeTitle()}
        </Badge>
      </div>

      {isPetResolved() && (
        <div className="mb-6">
          <PetResolvedAlert type={type as any} date={getResolutionDate()} />
          <div className="mt-4">
            <Button
              variant="outline"
              className="flex items-center text-destructive hover:bg-destructive/10"
              onClick={() => router.push(`/dashboard/pets/${type}/${id}/delete`)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir pet resolvido
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-square w-full">
                <Image
                  src={pet.image_url || "/placeholder.svg?height=400&width=400&query=pet"}
                  alt={pet.name || "Pet"}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Cadastrado em: {formatDate(pet.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
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
                  <Link href={getEditUrl()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o pet do nosso sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {!isPetResolved() && (
                <PetStatusButton petId={id} petType={type as any} petName={pet.name} onSuccess={handleStatusUpdate} />
              )}

              <Button onClick={() => setIsSharing(true)} variant="outline" className="w-full">
                Compartilhar minha história
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Informações do Pet</CardTitle>
              <CardDescription>Detalhes completos sobre o pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Espécie</h3>
                  <p>{pet.species || "Não informado"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Raça</h3>
                  <p>{pet.breed || "Não informado"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Idade</h3>
                  <p>{pet.age || "Não informado"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Porte</h3>
                  <p>{pet.size || "Não informado"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Sexo</h3>
                  <p>{pet.gender || "Não informado"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Cor</h3>
                  <p>{pet.color || "Não informado"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
                <p className="whitespace-pre-line">{pet.description || "Sem descrição"}</p>
              </div>

              {type === "adoption" && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Informações de Saúde</h3>
                      <p className="whitespace-pre-line">{pet.health_info || "Não informado"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Comportamento</h3>
                      <p className="whitespace-pre-line">{pet.behavior_info || "Não informado"}</p>
                    </div>
                  </div>
                </>
              )}

              {type === "lost" && (
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

              {type === "found" && (
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

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações de Contato</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{pet.contact_name || "Nome não informado"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{pet.contact_phone || "Telefone não informado"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {isSharing && (
        <ShareSuccessStoryModal
          petId={id}
          petType={type as any}
          petName={pet.name}
          open={isSharing}
          onOpenChange={setIsSharing}
        />
      )}
    </div>
  )
}
