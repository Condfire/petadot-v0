"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LostPetForm } from "@/components/LostPetForm"
import { createLostPet } from "@/app/actions/pet-actions"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface CadastrarPerdidoClientProps {
  userId: string
}

export default function CadastrarPerdidoClient({ userId }: CadastrarPerdidoClientProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createLostPet, null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (state?.success && !isRedirecting) {
      setIsRedirecting(true)
      toast({
        title: "Sucesso!",
        description: state.message || "Pet perdido cadastrado com sucesso!",
        variant: "default",
      })

      // Use a more reliable redirect method
      const timer = setTimeout(() => {
        window.location.href = "/dashboard/pets"
      }, 2000)

      return () => clearTimeout(timer)
    } else if (state?.error) {
      toast({
        title: "Erro ao cadastrar pet",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, router, isRedirecting])

  // Prevent infinite loops by checking if we're already redirecting
  if (isRedirecting) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="bg-green-50 border-green-200 text-green-700 mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Pet cadastrado com sucesso! Redirecionando...</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Cadastrar Pet Perdido</h1>
      {state?.success && (
        <Alert className="bg-green-50 border-green-200 text-green-700 mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{state.message} Redirecionando...</AlertDescription>
        </Alert>
      )}
      {state?.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <LostPetForm action={formAction} userId={userId} />
    </div>
  )
}
