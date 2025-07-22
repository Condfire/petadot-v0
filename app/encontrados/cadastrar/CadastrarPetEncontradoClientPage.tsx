"use client"

import { useRouter } from "next/navigation"
import { EnhancedPetForm } from "@/components/enhanced-pet-form"
import { createFoundPetAction } from "@/app/actions/pet-actions"

export function CadastrarPetEncontradoClientPage() {
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    const result = await createFoundPetAction(formData)

    if (result.success && result.slug) {
      // Redirect to the pet's page after successful creation
      setTimeout(() => {
        router.push(`/encontrados/${result.slug}`)
      }, 1500)
    }

    return result
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cadastrar Pet Encontrado</h1>
          <p className="text-lg text-gray-600">
            Preencha as informações do pet que você encontrou para ajudar a reunir com seu dono
          </p>
        </div>

        <EnhancedPetForm mode="create" onSubmit={handleSubmit} initialData={{ status: "found" }} />
      </div>
    </div>
  )
}
