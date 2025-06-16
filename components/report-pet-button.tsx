"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { ReportPetModal } from "./report-pet-modal"
import { useToast } from "@/hooks/use-toast"

interface ReportPetButtonProps {
  petId: string
  petName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function ReportPetButton({
  petId,
  petName,
  variant = "outline",
  size = "sm",
  className = "",
}: ReportPetButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const handleReportSubmitted = () => {
    toast({
      title: "Denúncia enviada",
      description: "Sua denúncia foi enviada com sucesso. Nossa equipe irá analisar.",
    })
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
      >
        <Flag className="h-4 w-4 mr-1" />
        Denunciar
      </Button>

      <ReportPetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petId={petId}
        petName={petName}
        onReportSubmitted={handleReportSubmitted}
      />
    </>
  )
}
