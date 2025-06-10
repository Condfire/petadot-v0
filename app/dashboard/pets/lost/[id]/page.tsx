"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/app/auth-provider"
import RequireAuth from "@/components/require-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getLostPetById, deleteUserPet } from "@/lib/supabase"
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function LostPetDetailsPage({ params }: { params: { id: string } }) {
  return (
    <RequireAuth>
      <LostPetDetails id={params.id} />
    </RequireAuth>
  )
}

function LostPetDetails({ id }: { id: string }) {
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
        const petData = await getLostPetById(id)

        if (!petData) {
          setError("Pet não encontrado")
          return
        }

        // Verificar se o pet pertence ao usuário
        if (petData.user_id !== user.id) {
          setError("Você não tem permissão para visualizar este pet")
          return
        }

        setPet(petData)
      } catch (err) {
        console.error("Erro ao buscar detalhes do pet:", err)
        setError("Erro ao carregar os detalhes do pet")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPet()
  }, [id, user?.id])

  const handleDelete = async () => {
    if (!user?.id) return

    setIsDeleting(true)
    try {
      console.log("Excluindo pet perdido:", { id, userId: user.id, type: "lost" })
      const result = await deleteUserPet(id, user.id, "lost")

      if (result.success) {
        toast({
          title: "Pet excluído com sucesso",
          description: "O pet foi excluído permanentemente.",
        })
        router.push("/dashboard/pets")
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/dashboard/pets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Meus Pets
        </Link>
      </Button>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-[250px]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : pet ? (
        <>
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{pet.name || "Pet sem nome"}</h1>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/pets/lost/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={pet.main_image_url || pet.image_url || "/placeholder.svg?height=400&width=400&query=pet"}
                alt={pet.name || "Pet"}
                fill
                className="object-cover"
              />
            </div>

            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Informações do Pet</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Espécie</p>
                  <p className="font-medium">{pet.species || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Raça</p>
                  <p className="font-medium">{pet.breed || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Idade</p>
                  <p className="font-medium">{pet.age || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Porte</p>
                  <p className="font-medium">{pet.size || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sexo</p>
                  <p className="font-medium">
                    {pet.gender === "male"
                      ? "Macho"
                      : pet.gender === "female"
                        ? "Fêmea"
                        : pet.gender || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cor</p>
                  <p className="font-medium">{pet.color || "Não informado"}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="font-medium">{pet.description || "Sem descrição"}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Data em que foi visto pela última vez</p>
                  <p className="font-medium">{pet.last_seen_date ? formatDate(pet.last_seen_date) : "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Local onde foi visto pela última vez</p>
                  <p className="font-medium">{pet.last_seen_location || "Não informado"}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
                <p className="font-medium">{pet.contact || "Não informado"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">{pet.created_at ? formatDate(pet.created_at) : "Não informado"}</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
