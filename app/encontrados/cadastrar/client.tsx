"use client"

import { useActionState } from "react"
import { FoundPetForm } from "@/components/FoundPetForm"
import { createFoundPet } from "@/app/actions/pet-actions" // Importar a ação específica
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface CadastrarEncontradoClientProps {
  userId: string
}

export default function CadastrarEncontradoClient({ userId }: CadastrarEncontradoClientProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(createFoundPet, null) // Usar createFoundPet diretamente

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Sucesso!",
        description: "Pet encontrado cadastrado com sucesso.",
        variant: "default",
      })
      router.push("/encontrados") // Redirecionar após o sucesso
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
      <h1 className="text-3xl font-bold mb-6 text-center">Cadastrar Pet Encontrado</h1>
      <FoundPetForm action={formAction} userId={userId} />
    </div>
  )
}
