"use client"

import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Nome do bucket principal
const BUCKET_NAME = "petadot-images"

// Tipos de pastas organizacionais
export type ImageCategory = "pets" | "events" | "avatars" | "ongs" | "temp" | "partners" | "stories"

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
  partners: {
    maxSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    maxWidth: 800,
    maxHeight: 400,
    quality: 0.85,
  },
  stories: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
  },
}

/**
 * Verifica se o bucket existe e o cria se necessário, de forma mais resiliente.
 */
export async function ensureBucketExists(): Promise<boolean> {
  try {
    // A API de setup deve ser idempotente (segura para chamar várias vezes).
    // Ela tenta criar o bucket. Se já existir, não faz nada.
    // Isso evita o erro 400 de 'getBucket' por falta de permissão.
    const response = await fetch("/api/storage/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({}))
      console.error("[Storage] Erro na API de setup:", response.status, response.statusText, errorResult.message)
      return false
    }
    return true
  } catch (error) {
    console.error("[Storage] Erro crítico ao verificar/criar bucket via API:", error)
    return false
  }
}

/**
 * Redimensiona uma imagem usando Canvas
 */
async function resizeImage(file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }))
          } else {
            reject(new Error("Erro ao converter canvas para blob"))
          }
        },
        file.type,
        quality,
      )
    }
    img.onerror = (e) => reject(new Error("Erro ao carregar imagem para redimensionamento"))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Valida um arquivo de imagem
 */
function validateFile(file: File, config: UploadConfig): { valid: boolean; error?: string } {
  if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
    return { valid: false, error: `Tipo de arquivo não permitido. Aceitos: ${config.allowedTypes.join(", ")}` }
  }
  if (config.maxSize && file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1)
    return { valid: false, error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` }
  }
  return { valid: true }
}

/**
 * Gera um caminho único para o arquivo
 */
function generateFilePath(category: ImageCategory, userId?: string, originalName?: string): string {
  const timestamp = Date.now()
  const uuid = uuidv4().substring(0, 8)
  const extension = originalName ? originalName.split(".").pop()?.toLowerCase() || "jpg" : "jpg"
  const cleanName = originalName
    ? originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .toLowerCase()
        .substring(0, 30)
    : "image"
  return `${category}/${userId || "public"}/${cleanName}-${timestamp}-${uuid}.${extension}`
}

/**
 * Faz upload de uma imagem (função principal)
 */
export async function uploadImage(
  file: File,
  category: ImageCategory,
  userId?: string,
  customConfig?: Partial<UploadConfig>,
): Promise<UploadResult> {
  try {
    const bucketExists = await ensureBucketExists()
    if (!bucketExists) {
      return { success: false, error: "Erro de configuração do armazenamento. Tente novamente mais tarde." }
    }

    const config = { ...DEFAULT_CONFIGS[category], ...customConfig }
    const validation = validateFile(file, config)
    if (!validation.valid) return { success: false, error: validation.error }

    let processedFile = file
    if (config.maxWidth && config.maxHeight && config.quality && file.type !== "image/svg+xml") {
      try {
        processedFile = await resizeImage(file, config.maxWidth, config.maxHeight, config.quality)
      } catch (resizeError: any) {
        console.warn("[Storage] Erro ao redimensionar, usando arquivo original:", resizeError.message)
      }
    }

    const filePath = generateFilePath(category, userId, file.name)
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, processedFile, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("[Storage] Erro no upload Supabase:", error)
      return { success: false, error: `Erro no upload: ${error.message}` }
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)
    if (!urlData || !urlData.publicUrl) {
      return { success: false, error: "Erro ao gerar URL pública após upload." }
    }

    return { success: true, url: urlData.publicUrl, path: data.path }
  } catch (error: any) {
    console.error("[Storage] Erro inesperado no processo de upload:", error)
    return { success: false, error: `Erro inesperado: ${error.message}` }
  }
}

/**
 * Função wrapper genérica para upload de arquivos, usada por componentes.
 */
export async function uploadFile(
  file: File,
  category: ImageCategory,
  userId?: string,
  customConfig?: Partial<UploadConfig>,
): Promise<{ publicUrl?: string; path?: string; error?: { message: string } }> {
  const result = await uploadImage(file, category, userId, customConfig)
  if (result.success && result.url) {
    return { publicUrl: result.url, path: result.path }
  } else {
    return { error: { message: result.error || "Upload failed due to an unknown reason." } }
  }
}

// Outras funções (removeImage, listFiles, etc.) permanecem as mesmas
export async function removeImage(urlOrPath: string): Promise<boolean> {
  try {
    let filePath = urlOrPath
    if (urlOrPath.startsWith("http")) {
      const url = new URL(urlOrPath)
      const pathMatch = url.pathname.match(new RegExp(`${BUCKET_NAME}/(.+)$`))
      if (!pathMatch || !pathMatch[1]) {
        console.error("[Storage] Não foi possível extrair o caminho da URL para remoção:", urlOrPath)
        return false
      }
      filePath = pathMatch[1]
    }
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])
    if (error) {
      console.error("[Storage] Erro ao remover arquivo:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("[Storage] Erro inesperado ao remover arquivo:", error)
    return false
  }
}

export async function listFiles(
  category: ImageCategory,
  userId?: string,
): Promise<
  Array<{ name: string; id: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: any }>
> {
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

export const uploadPetImage = (file: File, userId?: string) => uploadFile(file, "pets", userId)
export const uploadEventImage = (file: File, userId?: string) => uploadFile(file, "events", userId)
export const uploadUserAvatar = (file: File, userId: string) => uploadFile(file, "avatars", userId)
export const uploadOngLogo = (file: File, ongId: string) => uploadFile(file, "ongs", ongId)
export const uploadTempImage = (file: File) => uploadFile(file, "temp")
export const uploadPartnerImage = (file: File, partnerId?: string) => uploadFile(file, "partners", partnerId)
export const uploadStoryImage = (file: File, storyId?: string) => uploadFile(file, "stories", storyId)
