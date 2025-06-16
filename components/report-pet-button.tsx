"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { ReportPetModal } from "./report-pet-modal"
import { cn } from "@/lib/utils"

interface ReportPetButtonProps {
  petId: string
  petName: string
  className?: string
  variant?: "default" | "outline" | "ghost"
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
        className={cn("text-red-600 hover:text-red-700 hover:bg-red-50", className)}
      >
        <Flag className="mr-2 h-4 w-4" />
        Denunciar
      </Button>

      <ReportPetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} petId={petId} petName={petName} />
    </>
  )
}
