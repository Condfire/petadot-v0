"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/app/auth-provider"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

// Importação dinâmica do componente cliente com SSR desativado
const LostPetFormClient = dynamic(() => import("./client"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

export default function FormContainer() {
  const { user, isLoading, isInitialized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`)
    }
  }, [isInitialized, isLoading, user, router, pathname])

  if (!isInitialized || isLoading || !user) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <LostPetFormClient userId={user.id} />
}
