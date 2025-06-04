"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, X } from "lucide-react"
import Image from "next/image"
import { uploadImage } from "@/lib/supabase-storage"

interface PartnerImageUploadProps {
  initialImage?: string
  onImageUploaded: (url: string) => void
}

export function PartnerImageUpload({ initialImage, onImageUploaded }: PartnerImageUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem válida")
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      console.log("Iniciando upload da imagem do parceiro...")
      // Usar "partners" como pasta específica
      const imageUrl = await uploadImage(file, "partners")

      if (imageUrl) {
        console.log("Upload concluído com sucesso:", imageUrl)
        setImage(imageUrl)
        onImageUploaded(imageUrl)
      } else {
        console.error("Falha no upload: URL não retornada")
        setError("Falha ao fazer upload da imagem. Tente novamente.")
      }
    } catch (err) {
      console.error("Erro durante o upload:", err)
      setError("Erro ao fazer upload da imagem. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  function handleButtonClick() {
    fileInputRef.current?.click()
  }

  function handleRemoveImage() {
    setImage(null)
    onImageUploaded("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />

      {image ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-700">
            <Image src={image || "/placeholder.svg"} alt="Imagem do parceiro" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-400">Clique para fazer upload da imagem do parceiro</p>
            <p className="text-xs text-gray-500">PNG, JPG ou WEBP (máx. 5MB)</p>
          </div>
        </div>
      )}

      {!image && (
        <Button type="button" variant="outline" onClick={handleButtonClick} disabled={isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Selecionar Imagem
            </>
          )}
        </Button>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
