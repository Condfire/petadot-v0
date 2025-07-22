"use client"

import { useRouter } from "next/navigation"
import { EnhancedPetForm } from "@/components/enhanced-pet-form"
import { createLostPetAction } from "@/app/actions/pet-actions"

export function CadastrarPetPerdidoClientPage() {
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    const result = await createLostPetAction(formData)

    if (result.success && result.slug) {
      // Redirect to the pet's page after successful creation
      setTimeout(() => {
        router.push(`/perdidos/${result.slug}`)
      }, 1500)
    }

    return result
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cadastrar Pet Perdido</h1>
          <p className="text-lg text-gray-600">
            Preencha as informações do seu pet perdido para ajudarmos a encontrá-lo
          </p>
        </div>

        <EnhancedPetForm mode="create" onSubmit={handleSubmit} initialData={{ status: "lost" }} />
      </div>
    </div>
  )
}
