"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/app/auth-provider"
import RequireAuth from "@/components/require-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { AdoptionPetForm } from "@/components/AdoptionPetForm"
import { LostPetForm } from "@/components/LostPetForm"
import { FoundPetForm } from "@/components/FoundPetForm"

export default function EditPetPage({ params }: { params: { type: string; id: string } }) {
  return (
    <RequireAuth>
      <EditPet type={params.type} id={params.id} />
    </RequireAuth>
  )
}

function EditPet({ type, id }: { type: string; id: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [pet, setPet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPet() {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        let tableName = ""
        switch (type) {
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

        // Buscar o pet no banco de dados
        const { data: petData, error: fetchError } = await supabase
          .from(tableName)
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single()

        if (fetchError) {
          console.error(`Erro ao buscar pet ${type}:`, fetchError)
          throw new Error(fetchError.message)
        }

        if (!petData) {
          throw new Error("Pet não encontrado ou você não tem permissão para editá-lo")
        }

        console.log(`Pet ${type} carregado:`, petData)
        setPet({ ...petData, type })
      } catch (error) {
        console.error("Erro ao carregar pet:", error)
        setError(error instanceof Error ? error.message : "Erro ao carregar pet")
        toast({
          title: "Erro ao carregar pet",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar os dados do pet.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPet()
  }, [id, type, user, supabase])

  const handleSuccess = () => {
    toast({
      title: "Pet atualizado com sucesso",
      description: "As informações do pet foram atualizadas com sucesso.",
    })
    router.push("/my-pets")
  }

  const handleError = (message: string) => {
    toast({
      title: "Erro ao atualizar pet",
      description: message,
      variant: "destructive",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>Ocorreu um erro ao carregar os dados do pet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button className="mt-4" onClick={() => router.push("/my-pets")}>
              Voltar para Meus Pets
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Pet não encontrado</CardTitle>
            <CardDescription>O pet que você está procurando não foi encontrado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/my-pets")}>Voltar para Meus Pets</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Editar Pet</CardTitle>
          <CardDescription>Atualize as informações do seu pet.</CardDescription>
        </CardHeader>
        <CardContent>
          {type === "adoption" && (
            <AdoptionPetForm initialData={pet} isEditing={true} onSuccess={handleSuccess} onError={handleError} />
          )}
          {type === "lost" && (
            <LostPetForm initialData={pet} isEditing={true} onSuccess={handleSuccess} onError={handleError} />
          )}
          {type === "found" && (
            <FoundPetForm initialData={pet} isEditing={true} onSuccess={handleSuccess} onError={handleError} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
