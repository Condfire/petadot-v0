"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { ReportPetModal } from "./report-pet-modal"

interface ReportPetButtonProps {
  petId: string
  petName: string
  className?: string
}

export function ReportPetButton({ petId, petName, className }: ReportPetButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className={className}>
        <Flag className="h-4 w-4 mr-2" />
        Denunciar
      </Button>

      <ReportPetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} petId={petId} petName={petName} />
    </>
  )
}
