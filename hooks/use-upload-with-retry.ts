"use client"

import { useState, useCallback } from "react"
import { compressImage, validateImageFile, type CompressionOptions } from "@/lib/image-compression"

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadOptions {
  category?: string
  userId?: string
  compressionOptions?: CompressionOptions
  maxRetries?: number
  retryDelay?: number
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  compressionInfo?: {
    originalSize: number
    compressedSize: number
    compressionRatio: number
  }
}

export function useUploadWithRetry() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const uploadFile = useCallback(async (file: File, options: UploadOptions = {}): Promise<UploadResult> => {
    const { category = "pets", userId, compressionOptions = {}, maxRetries = 3, retryDelay = 1000 } = options

    setIsUploading(true)
    setError(null)
    setProgress(null)

    try {
      console.log("[UploadWithRetry] Iniciando upload:", file.name)

      // Validar arquivo
      const validation = validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Comprimir imagem
      setProgress({ loaded: 0, total: 100, percentage: 10 })
      console.log("[UploadWithRetry] Comprimindo imagem...")

      const compressionResult = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 800,
        ...compressionOptions,
      })

      setProgress({ loaded: 0, total: 100, percentage: 20 })

      // Tentar upload com retry
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[UploadWithRetry] Tentativa ${attempt}/${maxRetries}`)

          const formData = new FormData()
          formData.append("file", compressionResult.file)
          formData.append("category", category)
          if (userId) {
            formData.append("userId", userId)
          }

          // Criar AbortController para timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => {
            controller.abort()
          }, 45000) // 45 segundos

          setProgress({ loaded: 0, total: 100, percentage: 30 + (attempt - 1) * 20 })

          const response = await fetch("/api/storage/upload", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP ${response.status}`)
          }

          const result = await response.json()

          setProgress({ loaded: 100, total: 100, percentage: 100 })

          console.log("[UploadWithRetry] Upload concluído com sucesso")

          return {
            success: true,
            url: result.url,
            compressionInfo: {
              originalSize: compressionResult.originalSize,
              compressedSize: compressionResult.compressedSize,
              compressionRatio: compressionResult.compressionRatio,
            },
          }
        } catch (err: any) {
          lastError = err
          console.warn(`[UploadWithRetry] Tentativa ${attempt} falhou:`, err.message)

          // Se não é a última tentativa, aguardar antes de tentar novamente
          if (attempt < maxRetries) {
            const delay = retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
            console.log(`[UploadWithRetry] Aguardando ${delay}ms antes da próxima tentativa...`)
            await sleep(delay)
            setProgress({ loaded: 0, total: 100, percentage: 20 + attempt * 15 })
          }
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      throw lastError || new Error("Upload falhou após todas as tentativas")
    } catch (err: any) {
      console.error("[UploadWithRetry] Erro no upload:", err)
      const errorMessage =
        err.name === "AbortError"
          ? "Upload cancelado por timeout. Tente novamente com uma imagem menor."
          : err.message || "Erro desconhecido no upload"

      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsUploading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress(null)
    setError(null)
  }, [])

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    reset,
  }
}
