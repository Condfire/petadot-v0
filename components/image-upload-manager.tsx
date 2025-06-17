"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, CheckCircle, AlertCircle, RotateCcw } from "lucide-react"
import { useUploadWithRetry, type UploadOptions } from "@/hooks/use-upload-with-retry"
import type { ImageCategory } from "@/lib/storage-manager"

interface ImageUploadManagerProps {
  category: ImageCategory
  value: string
  onChange: (url: string) => void
  label?: string
  description?: string
  required?: boolean
  className?: string
  userId?: string
}

export function ImageUploadManager({
  category,
  value,
  onChange,
  label = "Imagem",
  description,
  required = false,
  className = "",
  userId,
}: ImageUploadManagerProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadFile, isUploading, progress, error, reset } = useUploadWithRetry()

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return

      console.log("[ImageUploadManager] Arquivo selecionado:", file.name)

      // Criar preview imediato
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Configurar opções de upload baseadas na categoria
      const uploadOptions: UploadOptions = {
        category,
        userId,
        compressionOptions: {
          maxWidth: category === "events" ? 1920 : 1200,
          maxHeight: category === "events" ? 1080 : 1200,
          quality: category === "avatars" ? 0.9 : 0.8,
          maxSizeKB: category === "events" ? 1000 : 800,
        },
        maxRetries: 3,
        retryDelay: 1000,
      }

      try {
        const result = await uploadFile(file, uploadOptions)

        if (result.success && result.url) {
          onChange(result.url)
          setPreviewUrl(result.url)

          // Limpar object URL
          URL.revokeObjectURL(objectUrl)

          console.log("[ImageUploadManager] Upload concluído:", result.url)

          if (result.compressionInfo) {
            console.log(
              "[ImageUploadManager] Compressão:",
              `${(result.compressionInfo.originalSize / 1024).toFixed(1)}KB → ` +
                `${(result.compressionInfo.compressedSize / 1024).toFixed(1)}KB ` +
                `(${result.compressionInfo.compressionRatio.toFixed(1)}% redução)`,
            )
          }
        } else {
          // Reverter preview em caso de erro
          setPreviewUrl(value)
          URL.revokeObjectURL(objectUrl)
        }
      } catch (err) {
        console.error("[ImageUploadManager] Erro no upload:", err)
        setPreviewUrl(value)
        URL.revokeObjectURL(objectUrl)
      }
    },
    [category, userId, uploadFile, onChange, value],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("image/")) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  const handleRemove = () => {
    onChange("")
    setPreviewUrl("")
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRetry = () => {
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <div className="space-y-3">
        {/* Área de Upload */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"}
            ${isUploading ? "pointer-events-none opacity-50" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {previewUrl ? (
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg object-cover"
                />
                {!isUploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove()
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {!isUploading && value && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Imagem carregada com sucesso</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Clique para selecionar ou arraste uma imagem</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG ou WebP até 20MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Progresso */}
        {isUploading && progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Enviando imagem...</span>
              <span>{progress.percentage.toFixed(0)}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button type="button" variant="outline" size="sm" onClick={handleRetry} className="ml-2">
                <RotateCcw className="h-3 w-3 mr-1" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Informações de Compressão (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === "development" && previewUrl && value && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            <p>✓ Imagem otimizada automaticamente</p>
          </div>
        )}
      </div>
    </div>
  )
}
