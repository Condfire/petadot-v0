"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminPanelRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para o painel alternativo
    router.push("/admin-alt")
  }, [router])

  return (
    <div className="container py-10 flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-lg">Redirecionando para o novo painel de administração...</p>
    </div>
  )
}
