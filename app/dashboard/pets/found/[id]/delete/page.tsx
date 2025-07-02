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
import { getFoundPetById, deleteUserPet } from "@/lib/supabase"
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react"

export default function DeleteFoundPetPage({ params }: { params: { id: string } }) {
  return (
    <RequireAuth>
      <DeletePetContent id={params.id} type="found" />
    </RequireAuth>
  )
}

function DeletePetContent({ id, type }: { id: string; type: string }) {
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
        const petData = await getFoundPetById(id)

        if (!petData) {
          setError("Pet não encontrado")
          return
        }

        // Verificar se o pet pertence ao usuário
        if (petData.user_id !== user.id) {
          setError("Você não tem permissão para excluir este pet")
          return
        }

        setPet({ ...petData, type })
      } catch (err) {
        console.error("Erro ao buscar detalhes do pet:", err)
        setError("Erro ao carregar os detalhes do pet")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPet()
  }, [id, type, user?.id])

  const handleDelete = async () => {
    if (!user?.id || !type) return

    setIsDeleting(true)
    try {
      console.log("Excluindo pet:", { id, userId: user.id, type })
      const result = await deleteUserPet(id, user.id, type)

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
              Você está prestes a excluir permanentemente o pet encontrado. Esta ação não pode ser desfeita.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-[200px] h-[200px] rounded-lg overflow-hidden mb-4">
              <Image
                src={pet.image_url || "/placeholder.svg?height=200&width=200&query=pet"}
                alt={pet.name || "Pet"}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold">{pet.name || "Pet sem nome"}</h2>
            <p className="text-muted-foreground mt-1">Encontrado em {pet.found_location || "Local não informado"}</p>
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
