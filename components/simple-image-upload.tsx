"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface SimpleImageUploadProps {
  onImageUpload: (url: string) => void
  required?: boolean
  initialValue?: string
}

export default function SimpleImageUpload({
  onImageUpload,
  required = false,
  initialValue = "",
}: SimpleImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialValue)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  // Efeito para notificar o componente pai quando a imagem for carregada inicialmente
  useEffect(() => {
    if (initialValue) {
      setImageUrl(initialValue)
      onImageUpload(initialValue)
    }
  }, [initialValue, onImageUpload])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      setError("Formato de arquivo inválido. Apenas PNG, JPG e JPEG são aceitos.")
      return
    }

    // Validar tamanho do arquivo (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB em bytes
    if (file.size > maxSize) {
      setError("Arquivo muito grande. O tamanho máximo é 5MB.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Criar preview local
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Upload para o Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `pets/${fileName}`

      const { data, error: uploadError } = await supabase.storage.from("pets").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("pets").getPublicUrl(filePath)

      console.log("Upload concluído, URL:", publicUrl)
      setImageUrl(publicUrl)
      onImageUpload(publicUrl)

      // Limpar o preview local após o upload bem-sucedido
      if (preview) {
        URL.revokeObjectURL(preview)
        setPreview(null)
      }
    } catch (err) {
      console.error("Erro ao fazer upload da imagem:", err)
      setError("Ocorreu um erro ao fazer upload da imagem. Tente novamente.")

      // Limpar o preview em caso de erro
      if (preview) {
        URL.revokeObjectURL(preview)
        setPreview(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setImageUrl("")
    setPreview(null)
    setError(null)
    onImageUpload("")
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {imageUrl || preview ? (
        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md">
          <div className="z-10 absolute top-2 right-2">
            <button
              type="button"
              onClick={handleRemove}
              className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
            >
              ✕
            </button>
          </div>
          <Image
            fill
            className="object-cover"
            alt="Imagem do pet"
            src={imageUrl || preview || "/placeholder.svg"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full max-w-[200px] aspect-square rounded-md border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG ou JPEG (máx. 5MB)</p>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <button
            type="button"
            onClick={() => document.getElementById("image-upload")?.click()}
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isUploading}
          >
            {isUploading ? "Enviando..." : "Selecionar imagem"}
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
              ></path>
            </svg>
          </button>
        </div>
      )}
      {required && !imageUrl && !preview && (
        <p className="text-red-500 text-sm mt-1">É necessário fazer upload de uma imagem</p>
      )}
    </div>
  )
}
