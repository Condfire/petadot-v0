"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/app/auth-provider"
import RequireAuth from "@/components/require-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getPetById, getLostPetById, getFoundPetById, deleteUserPet } from "@/lib/supabase"
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react"

export default function DeletePetPage({ params }: { params: { type: string; id: string } }) {
  return (
    <RequireAuth>
      <DeletePetContent params={params} />
    </RequireAuth>
  )
}

function DeletePetContent({ params }: { params: { type: string; id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [pet, setPet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPet = async () => {
      if (!user?.id) return

      setIsLoading(true)
      try {
        let petData = null
        let petType = ""

        switch (params.type) {
          case "adoption":
            petData = await getPetById(params.id)
            petType = "adoption"
            break
          case "lost":
            petData = await getLostPetById(params.id)
            petType = "lost"
            break
          case "found":
            petData = await getFoundPetById(params.id)
            petType = "found"
            break
          default:
            setError("Tipo de pet inválido")
            return
        }

        if (!petData) {
          setError("Pet não encontrado")
          return
        }

        // Verificar se o pet pertence ao usuário
        if (petData.user_id !== user.id) {
          setError("Você não tem permissão para excluir este pet")
          return
        }

        setPet({ ...petData, type: petType })
      } catch (err) {
        console.error("Erro ao buscar detalhes do pet:", err)
        setError("Erro ao carregar os detalhes do pet")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPet()
  }, [params.id, params.type, user?.id])

  const handleDelete = async () => {
    if (!user?.id || !pet?.type) return

    setIsDeleting(true)
    try {
      console.log("Excluindo pet:", { id: params.id, userId: user.id, type: pet.type })
      const result = await deleteUserPet(params.id, user.id, pet.type)

      if (result.success) {
        // Determinar para qual página redirecionar com base no tipo de pet
        let redirectPath = ""
        switch (pet.type) {
          case "adoption":
            redirectPath = "/adocao"
            break
          case "lost":
            redirectPath = "/perdidos"
            break
          case "found":
            redirectPath = "/encontrados"
            break
        }

        // Forçar uma visita à página correspondente para atualizar o cache
        if (redirectPath) {
          try {
            // Fazer uma solicitação fetch para a página para forçar a revalidação
            await fetch(`${redirectPath}?refresh=${Date.now()}`, { cache: "no-store" })
            console.log(`Página revalidada: ${redirectPath}`)
          } catch (revalidateError) {
            console.error("Erro ao revalidar página:", revalidateError)
          }
        }

        toast({
          title: "Pet excluído com sucesso",
          description: "O pet foi excluído permanentemente.",
        })

        // Adicionar um parâmetro de timestamp para forçar a atualização da página
        router.push(`/dashboard/pets?t=${Date.now()}`)

        // Forçar uma atualização completa da página após um breve atraso
        setTimeout(() => {
          window.location.href = `/dashboard/pets?refresh=${Date.now()}`
        }, 500)
      } else {
        toast({
          title: "Erro ao excluir pet",
          description: result.error || "Ocorreu um erro ao excluir o pet.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Erro ao excluir pet:", err)
      toast({
        title: "Erro ao excluir pet",
        description: "Ocorreu um erro ao excluir o pet.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Função para obter o nome do tipo de pet
  const getPetTypeName = (type: string) => {
    switch (type) {
      case "adoption":
        return "para adoção"
      case "lost":
        return "perdido"
      case "found":
        return "encontrado"
      default:
        return ""
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/dashboard/pets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Meus Pets
        </Link>
      </Button>

      {isLoading ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Skeleton className="h-[200px] w-[200px] rounded-lg" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </CardFooter>
        </Card>
      ) : error ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/pets">Voltar para Meus Pets</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : pet ? (
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive flex items-center justify-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Excluir Pet
            </CardTitle>
            <CardDescription>
              Você está prestes a excluir permanentemente o pet {getPetTypeName(pet.type)}. Esta ação não pode ser
              desfeita.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-[200px] h-[200px] rounded-lg overflow-hidden mb-4">
              <Image
                src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=200&width=200&query=pet"}
                alt={pet.name || "Pet"}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold">{pet.name || "Pet sem nome"}</h2>
            <p className="text-muted-foreground mt-1">
              {pet.type === "adoption"
                ? `${pet.age || "Idade não informada"} • ${
                    pet.size === "small"
                      ? "Pequeno"
                      : pet.size === "medium"
                        ? "Médio"
                        : pet.size === "large"
                          ? "Grande"
                          : pet.size
                  }`
                : pet.type === "lost"
                  ? `Perdido em ${pet.last_seen_location}`
                  : `Encontrado em ${pet.found_location}`}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/pets">Cancelar</Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir Permanentemente"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  )
}
