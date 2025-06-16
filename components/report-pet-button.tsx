"use client"

import Link from "next/link"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportPetButtonProps {
  petId: string
  className?: string
}

export function ReportPetButton({ petId, className }: ReportPetButtonProps) {
  const href = `mailto:contato@petadot.com.br?subject=${encodeURIComponent(
    "Denúncia de Pet",
  )}&body=${encodeURIComponent(
    `Gostaria de denunciar o pet de ID ${petId}.`,
  )}`

  return (
    <Button asChild variant="outline" className={className}>
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <Flag className="h-4 w-4" />
        Reportar
      </Link>
    </Button>
  )
}
