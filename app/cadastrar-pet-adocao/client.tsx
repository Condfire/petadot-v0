"use client"

import { useActionState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { AdoptionPetForm } from "@/components/AdoptionPetForm"
import { createAdoptionPet } from "@/app/actions/pet-actions"
import { useAuth } from "@/app/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdoptionPetFormWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isInitialized } = useAuth()
  const [state, formAction] = useActionState(createAdoptionPet, null)

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`)
    }
  }, [isInitialized, isLoading, user, router, pathname])

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Sucesso!",
        description: state.message,
        variant: "default",
      })
      setTimeout(() => router.push("/dashboard/pets"), 2000)
    } else if (state?.error) {
      toast({
        title: "Erro ao cadastrar pet",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, router])

  if (!isInitialized || isLoading || !user) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <AdoptionPetForm action={formAction} />
}
