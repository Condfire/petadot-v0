"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { createFoundPet } from "@/app/actions/found-pet-actions"
import { FoundPetForm } from "@/components/FoundPetForm"
import { toast } from "@/hooks/use-toast"

export default function CadastrarPetEncontradoClient() {
  const [isPending, startTransition] = useTransition()
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar um pet encontrado.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      try {
        console.log("Iniciando cadastro do pet encontrado")

        const result = await createFoundPet(null, formData)

        console.log("Resultado do cadastro:", result)

        if (result.success) {
          toast({
            title: "Sucesso!",
            description: result.message || "Pet encontrado cadastrado com sucesso!",
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
        <p className="text-muted-foreground mb-4">Você precisa estar logado para cadastrar um pet encontrado.</p>
        <button onClick={() => router.push("/login")} className="px-4 py-2 bg-primary text-white rounded-md">
          Fazer Login
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FoundPetForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  )
}
