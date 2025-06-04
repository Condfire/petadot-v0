"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

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
  return <LostPetFormClient />
}
