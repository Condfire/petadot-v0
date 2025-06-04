"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, ImageIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

export type ImageCategory = "pets" | "events" | "avatars" | "ongs" | "temp"

interface ImageUploadManagerProps {
  category: ImageCategory
  value: string
  onChange: (url: string) => void
  userId?: string
  label?: string
  description?: string
  required?: boolean
  className?: string
}

export function ImageUploadManager({
  category,
  value,
  onChange,
  userId,
  label = "Imagem",
  description,
  required = false,
  className = "",
}: ImageUploadManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (value) {
      setPreview(value)
    }
  }, [value])

  const uploadFile = useCallback(
    async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
      try {
        // Criar FormData para enviar o arquivo
        const formData = new FormData()
        formData.append("file", file)
        formData.append("category", category)
        if (userId) {
          formData.append("userId", userId)
        }

        // Enviar para nossa API que usa a chave de serviço
        const response = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          console.error("Erro na API:", result)
          return { success: false, error: result.error || "Erro no upload" }
        }

        return { success: true, url: result.url }
      } catch (error: any) {
        console.error("Erro no upload:", error)
        return { success: false, error: error.message }
      }
    },
    [category, userId],
  )

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setIsUploading(true)
      setError(null)
      setSuccess(false)
      setUploadProgress(0)

      try {
        console.log("[Upload] Iniciando upload de", file.name)

        // Criar preview local
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        // Simular progresso inicial
        setUploadProgress(10)

        // Iniciar simulação de progresso
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 300)

        // Fazer upload
        const result = await uploadFile(file)

        // Garantir que o progresso seja completado
        clearInterval(progressInterval)

        if (result.success && result.url) {
          setUploadProgress(100)
          console.log("[Upload] Sucesso:", result.url)
          onChange(result.url)
          setSuccess(true)
          setError(null)

          // Limpar preview local
          URL.revokeObjectURL(objectUrl)
          setPreview(result.url)

          // Reset após sucesso
          setTimeout(() => {
            setSuccess(false)
            setUploadProgress(0)
          }, 3000)
        } else {
          console.error("[Upload] Erro:", result.error)
          setError(result.error || "Erro no upload")
          setUploadProgress(0)
        }
      } catch (error: any) {
        console.error("[Upload] Erro crítico:", error)
        setError(`Erro inesperado: ${error.message}`)
        setUploadProgress(0)
      } finally {
        setIsUploading(false)
      }
    },
    [uploadFile, onChange],
  )

  const handleRemove = useCallback(async () => {
    if (!value) return

    try {
      // Para remover, podemos usar uma API similar
      const response = await fetch("/api/storage/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: value }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao remover imagem")
      }

      onChange("")
      setPreview(null)
      setError(null)
      setSuccess(false)
      console.log("[Upload] Imagem removida com sucesso")
    } catch (error: any) {
      console.error("[Upload] Erro ao remover imagem:", error)
      setError(`Erro ao remover: ${error.message}`)
    }
  }, [value, onChange])

  if (!isMounted) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="w-full h-32 bg-gray-100 rounded-md animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor={`upload-${category}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Upload realizado com sucesso!</AlertDescription>
        </Alert>
      )}

      {value || preview ? (
        <div className="relative">
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
            <Image
              src={value || preview || "/placeholder.svg"}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-2 right-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 text-center">
                <span className="font-semibold">Clique para fazer upload</span>
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP (máx. 5MB)</p>
            </div>
          </div>

          <Label
            htmlFor={`upload-${category}`}
            className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Selecionar imagem
              </>
            )}
          </Label>

          <Input
            id={`upload-${category}`}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
            required={required && !value}
          />
        </div>
      )}

      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Enviando...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  )
}
