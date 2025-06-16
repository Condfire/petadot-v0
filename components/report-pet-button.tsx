"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReportPetModal } from "@/components/report-pet-modal"
import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReportPetButtonProps {
  petId: string
  petName: string
  className?: string
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
}

export function ReportPetButton({
  petId,
  petName,
  className,
  variant = "outline",
  size = "default",
}: ReportPetButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={cn("text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300", className)}
      >
        <Flag className="mr-2 h-4 w-4" />
        Denunciar
      </Button>

      <ReportPetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} petId={petId} petName={petName} />
    </>
  )
}
