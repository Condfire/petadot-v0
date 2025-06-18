"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { PetRecognitionModal } from "./pet-recognition-modal"

interface PetRecognitionButtonProps {
  petId: string
  petName: string
  className?: string
}

export function PetRecognitionButton({ petId, petName, className }: PetRecognitionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className={className}>
        <Eye className="h-4 w-4 mr-2" />
        Reconhecer
      </Button>

      <PetRecognitionModal
        isOpen={open}
        onClose={() => setOpen(false)}
        petId={petId}
        petName={petName}
      />
    </>
  )
}
