"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

// Importar o componente de forma dinâmica com SSR desativado
const ProfileContent = dynamic(
  () => import("../../components/profile-content"),
  {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
})

export default function ProfileClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}
