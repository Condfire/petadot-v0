"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { createAdoptionPetClientSide } from "@/app/actions/pet-actions"
import { PetForm } from "@/components/PetForm"
import { toast } from "@/hooks/use-toast"
import type { PetFormUI } from "@/lib/types"

export default function CadastrarPetAdocaoClient() {
  const [isPending, startTransition] = useTransition()
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (data: PetFormUI) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar um pet.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      try {
        console.log("Iniciando cadastro do pet:", data)

        const result = await createAdoptionPetClientSide(data, user.id)

        console.log("Resultado do cadastro:", result)

        if (result.success) {
          toast({
            title: "Sucesso!",
            description: result.message || "Pet cadastrado com sucesso!",
          })

          // Redirecionar para a página de pets do usuário
          router.push("/my-pets")
        } else {
          toast({
            title: "Erro ao cadastrar pet",
            description: result.error || "Ocorreu um erro inesperado.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro no handleSubmit:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro inesperado ao cadastrar o pet.",
          variant: "destructive",
        })
      }
    })
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground mb-4">Você precisa estar logado para cadastrar um pet.</p>
        <button onClick={() => router.push("/login")} className="px-4 py-2 bg-primary text-white rounded-md">
          Fazer Login
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PetForm onSubmit={handleSubmit} isSubmitting={isPending} type="adoption" />
    </div>
  )
}
