"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface PetImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export function PetImageGallery({ images = [], alt, className = "" }: PetImageGalleryProps) {
  // Filtrar imagens vazias ou nulas
  const validImages = images.filter((img) => img && img.trim() !== "")

  // Se não houver imagens válidas, usar uma imagem padrão
  const finalImages = validImages.length > 0 ? validImages : ["/a-cute-pet.png"]

  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? finalImages.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === finalImages.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div className="aspect-square relative">
        <Image
          src={finalImages[currentIndex] || "/placeholder.svg"}
          alt={`${alt} - Imagem ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={currentIndex === 0}
        />
      </div>

      {finalImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goToPrevious}
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goToNext}
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {finalImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
