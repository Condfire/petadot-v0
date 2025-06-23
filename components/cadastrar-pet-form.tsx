"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useTransition } from "react"
import { PetForm } from "@/components/PetForm"
import { createPet } from "@/app/actions/pet-actions"
import { useAuth } from "@/lib/auth"
import { useSession } from "@/app/auth-provider"

export default function CadastrarPetForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { user } = useAuth()
  const session = useSession()
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(data: any) {
    if (!user?.id) {
      setError("Você precisa estar logado para cadastrar um pet.")
      return
    }

    startTransition(async () => {
      try {
        await createPet({
          ...data,
          userId: user.id,
        })

        toast({
          title: "Pet cadastrado com sucesso!",
          description: "Redirecionando para a página do pet...",
        })

        router.refresh()
        router.push("/dashboard/pets")
      } catch (e: any) {
        console.error("Erro ao cadastrar pet:", e)
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar pet!",
          description: e?.message || "Ocorreu um erro ao cadastrar o pet. Por favor, tente novamente.",
        })
      }
    })
  }

  return (
    <div className="container">
      {error && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
      <PetForm onSubmit={onSubmit} isSubmitting={isPending} type="adoption" />
    </div>
  )
}
