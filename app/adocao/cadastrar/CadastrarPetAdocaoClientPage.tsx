"use client"

import { useRouter } from "next/navigation"
import { EnhancedPetForm } from "@/components/enhanced-pet-form"
import { createAdoptionPetAction } from "@/app/actions/pet-actions"

export function CadastrarPetAdocaoClientPage() {
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    const result = await createAdoptionPetAction(formData)

    if (result.success && result.slug) {
      // Redirect to the pet's page after successful creation
      setTimeout(() => {
        router.push(`/adocao/${result.slug}`)
      }, 1500)
    }

    return result
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cadastrar Pet para Adoção</h1>
          <p className="text-lg text-gray-600">Preencha as informações do pet disponível para adoção</p>
        </div>

        <EnhancedPetForm mode="create" onSubmit={handleSubmit} initialData={{ status: "for_adoption" }} />
      </div>
    </div>
  )
}
