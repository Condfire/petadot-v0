/**
 * Utilitário para compressão e otimização de imagens no cliente
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
  format?: "jpeg" | "webp" | "png"
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Comprime uma imagem no cliente antes do upload
 */
export async function compressImage(file: File, options: CompressionOptions = {}): Promise<CompressionResult> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8, maxSizeKB = 500, format = "jpeg" } = options

  console.log(`[ImageCompression] Iniciando compressão de ${file.name}`)
  console.log(`[ImageCompression] Tamanho original: ${(file.size / 1024).toFixed(2)}KB`)

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      try {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img
        const aspectRatio = width / height

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            width = maxWidth
            height = width / aspectRatio
          } else {
            height = maxHeight
            width = height * aspectRatio
          }
        }

        canvas.width = width
        canvas.height = height

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height)

        // Função para tentar diferentes qualidades até atingir o tamanho desejado
        const tryCompress = (currentQuality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Erro ao comprimir imagem"))
                return
              }

              const compressedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now(),
              })

              const compressedSizeKB = compressedFile.size / 1024

              console.log(`[ImageCompression] Qualidade ${currentQuality}: ${compressedSizeKB.toFixed(2)}KB`)

              // Se ainda está muito grande e podemos reduzir mais a qualidade
              if (compressedSizeKB > maxSizeKB && currentQuality > 0.3) {
                tryCompress(currentQuality - 0.1)
                return
              }

              const result: CompressionResult = {
                file: compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionRatio: ((file.size - compressedFile.size) / file.size) * 100,
              }

              console.log(`[ImageCompression] Compressão concluída:`)
              console.log(`[ImageCompression] - Tamanho final: ${compressedSizeKB.toFixed(2)}KB`)
              console.log(`[ImageCompression] - Redução: ${result.compressionRatio.toFixed(1)}%`)

              resolve(result)
            },
            `image/${format}`,
            currentQuality,
          )
        }

        tryCompress(quality)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Erro ao carregar imagem para compressão"))
    }

    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Valida se um arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  const maxSize = 20 * 1024 * 1024 // 20MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.",
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Arquivo muito grande. Tamanho máximo: 20MB.",
    }
  }

  return { valid: true }
}
