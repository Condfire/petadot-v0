"use client"

import { useActionState } from "react"
import { LostPetForm } from "@/components/LostPetForm"
import { createLostPet } from "@/app/actions/pet-actions" // Importar a ação específica
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface CadastrarPerdidoClientProps {
  userId: string
}

export default function CadastrarPerdidoClient({ userId }: CadastrarPerdidoClientProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(createLostPet, null) // Usar createLostPet diretamente

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Sucesso!",
        description: "Pet perdido cadastrado com sucesso.",
        variant: "default",
      })
      router.push("/perdidos") // Redirecionar após o sucesso
    } else if (state?.error) {
      toast({
        title: "Erro ao cadastrar pet",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, router])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Cadastrar Pet Perdido</h1>
      <LostPetForm action={formAction} userId={userId} />
    </div>
  )
}
