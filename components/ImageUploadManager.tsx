"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react" // Assuming Lucide React is available for icons
import { Progress } from "@/components/ui/progress" // Assuming shadcn/ui Progress component

interface ImageUploadProps {
  category: string
  value: string // Current image URL
  onChange: (url: string) => void // Callback for when URL changes
  required?: boolean
  className?: string
  label?: string
  description?: string
  userId?: string // Adicione a prop userId
}

const ImageUploadManager = ({
  category,
  value,
  onChange,
  required = false,
  className = "",
  label = "Imagem",
  description,
  userId,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(value || "")
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0) // Estado para o progresso do upload

  // Efeito para atualizar imageUrl se a prop value mudar (ex: reset de formulário)
  React.useEffect(() => {
    setImageUrl(value || "")
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setProgress(0) // Resetar progresso

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category)
      if (userId) {
        // Apenas anexe userId se ele for fornecido
        formData.append("userId", userId)
      }

      // Simular progresso para demonstração, progresso real requer suporte do lado do servidor
      // A API fetch atual não expõe o progresso de upload diretamente.
      // Por enquanto, vamos apenas atualizar o progresso para 50% ao enviar e 90% ao esperar a resposta.
      setProgress(50) // Indicar que o arquivo está sendo processado/enviado

      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      })

      setProgress(90) // Indicar que está aguardando a resposta do servidor

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Erro desconhecido no upload.")
        setImageUrl("")
        onChange("")
        setProgress(0)
        return
      }

      const result = await response.json()
      if (result.success && result.url) {
        setImageUrl(result.url)
        onChange(result.url)
        setProgress(100)
      } else {
        setError(result.error || "Upload falhou sem URL.")
        setImageUrl("")
        onChange("")
        setProgress(0)
      }
    } catch (err: any) {
      console.error("Erro ao fazer upload:", err)
      setError(err.message || "Erro inesperado ao fazer upload.")
      setImageUrl("")
      onChange("")
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl("")
    onChange("")
    setError(null)
    setProgress(0)
    // Opcionalmente, chame uma API para deletar a imagem do storage se ela já foi carregada
    // Para simplificar, não estamos implementando a exclusão do lado do servidor aqui na remoção do lado do cliente.
  }

  return (
    <div className={className}>
      <Label
        htmlFor={`image-upload-${category}`}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>}
      <div className="flex items-center space-x-4">
        {imageUrl ? (
          <div className="relative w-24 h-24 rounded-md overflow-hidden">
            <img src={imageUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover imagem</span>
            </Button>
          </div>
        ) : (
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500">
            <span className="text-sm">Sem Imagem</span>
          </div>
        )}
        <div className="flex-1">
          <Input
            id={`image-upload-${category}`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
          />
          {uploading && <Progress value={progress} className="w-full mt-2" />}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default ImageUploadManager
