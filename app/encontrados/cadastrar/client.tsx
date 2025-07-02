"use client"

import { FoundPetForm } from "@/components/FoundPetForm"

export default function CadastrarEncontradoClient() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Reportar Pet Encontrado</h1>
        <p className="text-gray-600 text-center mb-8">
          Encontrou um pet na rua? Ajude-nos a reunir ele com sua família!
        </p>

        <FoundPetForm />
      </div>
    </div>
  )
}
