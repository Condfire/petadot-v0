"use client"

import { FoundPetForm } from "@/components/FoundPetForm"
import { createFoundPet } from "@/app/actions/found-pet-actions"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function CadastrarEncontradoClient() {
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await createFoundPet(formData)

      if (result.success) {
        toast({
          title: "Pet encontrado cadastrado!",
          description: "O pet encontrado foi cadastrado com sucesso e está aguardando aprovação.",
        })
        router.push("/encontrados")
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao cadastrar pet encontrado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao cadastrar pet encontrado:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Reportar Pet Encontrado</h1>
        <p className="text-gray-600 text-center mb-8">
          Encontrou um pet na rua? Ajude-nos a reunir ele com sua família!
        </p>

        <form action={handleSubmit}>
          <FoundPetForm />
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reportar Pet Encontrado
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
