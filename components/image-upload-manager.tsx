"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, XCircle, UploadCloud } from "lucide-react"
import Image from "next/image"
import { uploadImage, removeImage, type ImageCategory, type UploadResult } from "@/lib/storage-manager"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadManagerProps {
  category: ImageCategory
  value: string
  onChange: (url: string) => void
  label?: string
  description?: string
  required?: boolean
  className?: string
  multiple?: boolean // Allow multiple files
  maxFiles?: number
}

export function ImageUploadManager({
  category,
  value,
  onChange,
  label = "Imagem",
  description,
  required = false,
  className,
  multiple = false,
  maxFiles = 1,
}: ImageUploadManagerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setPreviewUrl(value || null)
  }, [value])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        setUploadError("Nenhum arquivo selecionado ou tipo de arquivo inválido.")
        return
      }

      const file = acceptedFiles[0] // Assuming single file upload for now

      setIsUploading(true)
      setUploadProgress(0)
      setUploadError(null)

      const controller = new AbortController()
      let interval: NodeJS.Timeout | null = null
      
      try {
        // Simulate progress for demonstration
        let currentProgress = 0
        interval = setInterval(() => {
          currentProgress += 10
          if (currentProgress <= 90) {
            setUploadProgress(currentProgress)
          } else if (interval) {
            clearInterval(interval)
          }
        }, 100)

        // Race the upload with a timeout so we can abort if the
        // request hangs and provide feedback to the user.
        const timeoutMs = 15000
        const timeoutPromise = new Promise<UploadResult>((_, reject) => {
          setTimeout(() => {
            controller.abort()
            const err: any = new Error(
              "O servidor demorou a responder. Tente novamente mais tarde.",
            )
            err.name = "TimeoutError"
            reject(err)
          }, timeoutMs)
        })

        const result: UploadResult = await Promise.race([
          uploadImage(file, category, undefined, undefined, controller.signal),
          timeoutPromise,
        ])

        if (interval) clearInterval(interval)
        controller.abort()

        if (result.success && result.url) {
          setPreviewUrl(result.url)
          onChange(result.url)
          setUploadProgress(100)
          toast({
            title: "Sucesso!",
            description: "Imagem enviada com sucesso.",
            variant: "default",
          })
        } else {
          setUploadError(result.error || "Erro desconhecido ao fazer upload da imagem.")
          toast({
            title: "Erro no Upload",
            description: result.error || "Ocorreu um erro ao enviar a imagem.",
            variant: "destructive",
          })
          setUploadProgress(0)
        }
        } catch (error: any) {
          console.error("[ImageUploadManager] Erro no upload:", error)
          setUploadError(error.message || "Erro inesperado durante o upload.")

          const networkError =
            error.name === "TimeoutError" ||
            error.name === "AbortError" ||
            error.message?.includes("Failed to fetch") ||
            error.message?.includes("NetworkError")

          if (networkError) {
            toast({
              title: "Falha de Conexão",
              description: "Não foi possível enviar a imagem. Verifique sua conexão.",
              variant: "destructive",
            })
          } else {
            toast({
              title: error.name === "TimeoutError" ? "Tempo esgotado" : "Erro Inesperado",
              description:
                error.name === "TimeoutError"
                  ? "O envio da imagem demorou demais e foi cancelado."
                  : error.message || "Ocorreu um erro inesperado durante o upload.",
              variant: "destructive",
            })
          }

          setUploadProgress(0)
          setPreviewUrl(null)
          onChange("")

          if (interval) clearInterval(interval)
          controller.abort()
        } finally {
          if (interval) clearInterval(interval)
          controller.abort()
          setIsUploading(false)
        }
    },
    [category, onChange, toast],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    multiple: multiple,
    maxFiles: maxFiles,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".webp", ".svg"],
    },
  })

  useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0]
      const error = rejection.errors[0]
      let errorMessage = "Arquivo inválido."
      if (error.code === "file-too-large") {
        errorMessage = `Arquivo muito grande. Tamanho máximo: ${category === "events" ? "8MB" : "5MB"}.` // Adjust based on category config
      } else if (error.code === "file-invalid-type") {
        errorMessage = "Tipo de arquivo não permitido. Apenas imagens são aceitas."
      }
      setUploadError(errorMessage)
      toast({
        title: "Erro de Validação",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [fileRejections, category, toast])

  const handleRemoveImage = useCallback(async () => {
    if (previewUrl) {
      setIsUploading(true) // Use isUploading to disable buttons during removal
      setUploadError(null)
      try {
        const success = await removeImage(previewUrl)
        if (success) {
          setPreviewUrl(null)
          onChange("")
          toast({
            title: "Sucesso!",
            description: "Imagem removida com sucesso.",
            variant: "default",
          })
        } else {
          setUploadError("Erro ao remover imagem do storage.")
          toast({
            title: "Erro ao Remover",
            description: "Não foi possível remover a imagem do storage.",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error("[ImageUploadManager] Erro ao remover:", error)
        setUploadError(error.message || "Erro inesperado ao remover imagem.")
        toast({
          title: "Erro Inesperado",
          description: error.message || "Ocorreu um erro inesperado ao remover a imagem.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }, [previewUrl, onChange, toast])

  return (
    <div className={className}>
      <Label htmlFor="image-upload" className="mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}

      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700"
        } ${uploadError ? "border-destructive" : ""}`}
      >
        <input {...getInputProps()} id="image-upload" />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="h-8 w-8 text-primary animate-bounce" />
            <p className="text-sm text-muted-foreground">Enviando imagem...</p>
            <Progress value={uploadProgress} className="w-full max-w-[200px]" />
          </div>
        ) : previewUrl ? (
          <div className="relative w-full h-48 rounded-md overflow-hidden group">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              layout="fill"
              objectFit="cover"
              className="object-center"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation() // Prevent triggering dropzone
                handleRemoveImage()
              }}
              disabled={isUploading}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Arraste e solte uma imagem aqui, ou clique para selecionar</p>
            <Button type="button" variant="outline" disabled={isUploading}>
              Selecionar Imagem
            </Button>
          </div>
        )}
      </div>

      {uploadError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no Upload</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {previewUrl && !isUploading && !uploadError && (
        <Alert className="mt-4 bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Imagem Carregada</AlertTitle>
          <AlertDescription>A imagem foi carregada com sucesso.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
