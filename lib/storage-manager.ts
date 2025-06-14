"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"

// Configuração do Supabase
const supabase = createClientComponentClient()

// Nome do bucket principal
const BUCKET_NAME = "petadot-images"

// Tipos de pastas organizacionais
export type ImageCategory = "pets" | "events" | "avatars" | "ongs" | "temp"

// Interface para resultado de upload
export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

// Interface para configurações de upload
export interface UploadConfig {
  maxSize?: number // em bytes
  allowedTypes?: string[]
  quality?: number // 0-1 para compressão
  maxWidth?: number
  maxHeight?: number
}

// Configurações padrão por categoria
const DEFAULT_CONFIGS: Record<ImageCategory, UploadConfig> = {
  pets: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
  },
  events: {
    maxSize: 8 * 1024 * 1024, // 8MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
  },
  avatars: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9,
  },
  ongs: {
    maxSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"],
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.9,
  },
  temp: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 0.8,
  },
}

/**
 * Verifica se o bucket existe via API
 */
export async function ensureBucketExists(): Promise<boolean> {
  try {
    console.log("[Storage] Verificando bucket via API...")

    // Primeiro, tenta verificar se o bucket existe diretamente
    try {
      const { data, error } = await supabase.storage.getBucket(BUCKET_NAME)
      if (!error) {
        console.log("[Storage] Bucket já existe:", data)
        return true
      }
    } catch (e) {
      console.log("[Storage] Erro ao verificar bucket diretamente, tentando via API")
    }

    // Se falhar, tenta via API
    const response = await fetch("/api/storage/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[Storage] Erro na API:", response.status, response.statusText)
      return false
    }

    const result = await response.json()
    console.log("[Storage] Bucket verificado/criado:", result.message)
    return true
  } catch (error) {
    console.error("[Storage] Erro ao verificar bucket:", error)
    return true // Retorna true para tentar o upload mesmo assim
  }
}

/**
 * Redimensiona uma imagem usando Canvas
 */
async function resizeImage(file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<File> {
  console.log(`[Storage] Iniciando redimensionamento para ${file.name}. Original: ${file.size} bytes.`)
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      console.log(`[Storage] Imagem carregada para redimensionamento. Dimensões originais: ${img.width}x${img.height}`)
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
        console.log(`[Storage] Redimensionando para ${width.toFixed(0)}x${height.toFixed(0)}`)
      } else {
        console.log("[Storage] Imagem não precisa ser redimensionada (já está dentro dos limites).")
      }

      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            console.log(`[Storage] Imagem redimensionada com sucesso. Novo tamanho: ${resizedFile.size} bytes.`)
            resolve(resizedFile)
          } else {
            console.error("[Storage] Erro: Blob nulo após redimensionamento.")
            reject(new Error("Erro ao redimensionar imagem: Blob nulo"))
          }
        },
        file.type,
        quality,
      )
    }

    img.onerror = (e) => {
      console.error("[Storage] Erro ao carregar imagem para redimensionamento:", e)
      reject(new Error("Erro ao carregar imagem para redimensionamento"))
    }
    img.crossOrigin = "anonymous" // Adicionar para evitar problemas de CORS se a imagem for de outra origem
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Valida um arquivo de imagem
 */
function validateFile(file: File, config: UploadConfig): { valid: boolean; error?: string } {
  console.log(`[Storage] Validando arquivo: ${file.name}, tipo: ${file.type}, tamanho: ${file.size} bytes`)
  // Verificar tipo
  if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
    const errorMessage = `Tipo de arquivo não permitido. Tipos aceitos: ${config.allowedTypes.join(", ")}`
    console.error(`[Storage] Validação falhou: ${errorMessage}`)
    return {
      valid: false,
      error: errorMessage,
    }
  }

  // Verificar tamanho
  if (config.maxSize && file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1)
    const errorMessage = `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
    console.error(`[Storage] Validação falhou: ${errorMessage}`)
    return {
      valid: false,
      error: errorMessage,
    }
  }

  console.log("[Storage] Validação de arquivo bem-sucedida.")
  return { valid: true }
}

/**
 * Gera um caminho único para o arquivo
 */
function generateFilePath(category: ImageCategory, userId?: string, originalName?: string): string {
  const timestamp = Date.now()
  const uuid = uuidv4().substring(0, 8)

  // Extrair extensão do arquivo original
  const extension = originalName ? originalName.split(".").pop()?.toLowerCase() || "jpg" : "jpg"

  // Gerar nome limpo
  const cleanName = originalName
    ? originalName
        .replace(/\.[^/.]+$/, "") // remover extensão
        .replace(/[^a-zA-Z0-9]/g, "-") // substituir caracteres especiais
        .toLowerCase()
        .substring(0, 20) // limitar tamanho
    : "image"

  const path = `${category}/${userId || "public"}/${cleanName}-${timestamp}-${uuid}.${extension}`
  console.log(`[Storage] Caminho gerado: ${path}`)
  return path
}

/**
 * Faz upload de uma imagem
 */
export async function uploadImage(
  file: File,
  category: ImageCategory,
  userId?: string,
  customConfig?: Partial<UploadConfig>,
  signal?: AbortSignal,
): Promise<UploadResult> {
  try {
    console.log(`[Storage] Iniciando upload para categoria: ${category}, arquivo: ${file.name}`)

    // Garantir que o bucket existe (chamada para API Route)
    console.log("[Storage] Chamando ensureBucketExists...")
    const bucketExists = await ensureBucketExists()
    if (!bucketExists) {
      console.warn(
        "[Storage] ensureBucketExists retornou false. Tentando upload mesmo assim, mas pode haver problemas.",
      )
      // Decide if you want to return an error here or proceed.
      // For now, proceeding as per original code, but logging warning.
    }
    console.log("[Storage] ensureBucketExists concluído.")

    // Configuração para esta categoria
    const config = { ...DEFAULT_CONFIGS[category], ...customConfig }
    console.log("[Storage] Configuração de upload:", config)

    // Validar arquivo
    const validation = validateFile(file, config)
    if (!validation.valid) {
      console.error("[Storage] Validação de arquivo falhou:", validation.error)
      return { success: false, error: validation.error }
    }

    // Redimensionar se necessário
    let processedFile = file
    if (config.maxWidth && config.maxHeight && config.quality) {
      try {
        console.log("[Storage] Tentando redimensionar imagem...")
        processedFile = await resizeImage(file, config.maxWidth, config.maxHeight, config.quality)
        console.log(`[Storage] Imagem redimensionada de ${file.size} para ${processedFile.size} bytes.`)
      } catch (resizeError: any) {
        console.warn("[Storage] Erro ao redimensionar, usando arquivo original:", resizeError.message)
        // If resizing fails, proceed with the original file but log the warning.
      }
    } else {
      console.log("[Storage] Redimensionamento não necessário ou desativado.")
    }

    // Gerar caminho do arquivo
    const filePath = generateFilePath(category, userId, file.name)
    console.log(`[Storage] Caminho final do arquivo para upload: ${filePath}`)

    // Fazer upload
    // console.log(`[Storage] Iniciando upload para Supabase Storage. Bucket: ${BUCKET_NAME}, Path: ${filePath}`)
    // const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, processedFile, {
    //   contentType: processedFile.type, // Use processedFile.type
    //   cacheControl: "3600",
    //   upsert: true,
    // })

    // Criar um FormData para enviar o arquivo e metadados para a API route
    const formData = new FormData()
    formData.append("file", processedFile)
    formData.append("category", category)
    if (userId) {
      formData.append("userId", userId)
    }

    console.log(`[Storage] Enviando requisição de upload para a API route: /api/storage/upload`)

    const controller = new AbortController()
    let timeoutTriggered = false
    const timeoutId = setTimeout(() => {
      timeoutTriggered = true
      controller.abort()
    }, 30000)

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutId)
        throw signal.reason || new Error("Upload abortado")
      }
      signal.addEventListener("abort", () => controller.abort(), { once: true })
    }

    let response: Response
    try {
      response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (timeoutTriggered) {
        const error = new Error("Tempo limite de upload excedido.")
        error.name = "TimeoutError"
        throw error
      }
      if (err.name === "AbortError") {
        throw err
      }
      throw err
    }
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[Storage] Erro na API route de upload:", errorData.error)
      return { success: false, error: errorData.error || `Erro no upload via API: ${response.statusText}` }
    }

    const result = await response.json()
    console.log("[Storage] Upload via API route concluído com sucesso. Resultado:", result)

    // A API route já retorna a URL pública e o path, então podemos usá-los diretamente
    return {
      success: true,
      url: result.url,
      path: result.path,
    }

    // Remova a parte que obtém a URL pública diretamente do supabase.storage, pois a API route já faz isso.
    // Ou seja, remova:
    // console.log("[Storage] Obtendo URL pública...")
    // const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)
    // console.log(`[Storage] URL pública gerada:`, urlData)

    // if (!urlData || !urlData.publicUrl) {
    //   console.error("[Storage] Erro ao gerar URL pública: urlData ou publicUrl é nulo/indefinido.")
    //   return { success: false, error: "Erro ao gerar URL pública" }
    // }

    // console.log(`[Storage] Upload finalizado com sucesso. URL: ${urlData.publicUrl}`)

    // return {
    //   success: true,
    //   url: urlData.publicUrl,
    //   path: data.path,
    // }
  } catch (error: any) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw error
    }
    console.error("[Storage] Erro inesperado durante o upload:", error)
    return { success: false, error: `Erro inesperado: ${error.message}` }
  }
}

/**
 * Remove uma imagem
 */
export async function removeImage(urlOrPath: string): Promise<boolean> {
  try {
    let filePath = urlOrPath

    // Se for uma URL, extrair o caminho
    if (urlOrPath.startsWith("http")) {
      const url = new URL(urlOrPath)
      const pathMatch = url.pathname.match(new RegExp(`${BUCKET_NAME}/(.+)$`))
      if (!pathMatch) {
        console.error("[Storage] Não foi possível extrair o caminho da URL:", urlOrPath)
        return false
      }
      filePath = pathMatch[1]
    }

    console.log(`[Storage] Removendo arquivo: ${filePath}`)

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error("[Storage] Erro ao remover arquivo:", error)
      return false
    }

    console.log("[Storage] Arquivo removido com sucesso")
    return true
  } catch (error) {
    console.error("[Storage] Erro inesperado ao remover arquivo:", error)
    return false
  }
}

/**
 * Lista arquivos em uma pasta
 */
export async function listFiles(category: ImageCategory, userId?: string) {
  try {
    const folderPath = userId ? `${category}/${userId}` : category

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folderPath)

    if (error) {
      console.error("[Storage] Erro ao listar arquivos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[Storage] Erro inesperado ao listar arquivos:", error)
    return []
  }
}

/**
 * Funções específicas para cada tipo de upload
 */
export const uploadPetImage = (file: File, userId?: string) => uploadImage(file, "pets", userId)

export const uploadEventImage = (file: File, userId?: string) => uploadImage(file, "events", userId)

export const uploadUserAvatar = (file: File, userId: string) => uploadImage(file, "avatars", userId)

export const uploadOngLogo = (file: File, ongId: string) => uploadImage(file, "ongs", ongId)

export const uploadTempImage = (file: File) => uploadImage(file, "temp")
