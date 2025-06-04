"\"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"

// Nome do bucket no Supabase Storage
const BUCKET_NAME = "sppetadot"

// Tipos de pastas para organizar as imagens
export type StorageFolder = "avatars" | "pets" | "ongs" | "stories" | "events" | "partners"

/**
 * Verifica se o bucket existe e cria se necessário
 */
export async function ensureBucketExists(): Promise<boolean> {
  try {
    const supabase = createClientComponentClient()

    // Verificar se o bucket existe
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME)

    if (error && error.message.includes("not found")) {
      console.log(`[Storage] Bucket ${BUCKET_NAME} não encontrado, tentando criar...`)

      // Criar o bucket
      const { data: createData, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Tornar o bucket público
      })

      if (createError) {
        console.error("[Storage] Erro ao criar bucket:", createError)
        return false
      }

      console.log(`[Storage] Bucket ${BUCKET_NAME} criado com sucesso!`)
      return true
    } else if (error) {
      console.error("[Storage] Erro ao verificar bucket:", error)
      return false
    }

    console.log(`[Storage] Bucket ${BUCKET_NAME} já existe`)
    return true
  } catch (error) {
    console.error("[Storage] Erro ao verificar/criar bucket:", error)
    return false
  }
}

/**
 * Verifica as permissões de acesso ao storage
 */
export async function checkStoragePermissions(): Promise<boolean> {
  try {
    const supabase = createClientComponentClient()
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      return false
    }

    // Simula uma verificação de permissões - substitua por uma verificação real
    // em um ambiente de produção
    return true
  } catch (error) {
    console.error("Erro ao verificar permissões:", error)
    return false
  }
}

/**
 * Testa o upload de uma imagem para o storage
 */
export async function testStorageUpload(): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClientComponentClient()
    const file = new File(["test"], "test.png", { type: "image/png" })

    const imageUrl = await uploadImage(file, "test")

    if (imageUrl) {
      return { success: true, message: `Upload bem-sucedido para ${imageUrl}` }
    } else {
      return { success: false, message: "Falha no upload" }
    }
  } catch (error) {
    console.error("Erro no teste de upload:", error)
    return { success: false, message: "Erro no teste de upload" }
  }
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param file Arquivo a ser enviado
 * @param folder Pasta onde o arquivo será armazenado
 * @returns URL pública do arquivo ou null em caso de erro
 */
export async function uploadImage(file: File, folder: StorageFolder = "pets"): Promise<string | null> {
  try {
    const supabase = createClientComponentClient()

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error("Arquivo muito grande (máximo 5MB)")
      return null
    }

    // Verificar tipo do arquivo
    if (!file.type.startsWith("image/")) {
      console.error("Arquivo não é uma imagem")
      return null
    }

    // Garantir que o bucket existe
    const bucketExists = await ensureBucketExists()
    if (!bucketExists) {
      console.error(`[Storage] Bucket ${BUCKET_NAME} não existe e não foi possível criá-lo`)
      return null
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${uuidv4()}.${fileExt}`

    console.log(`[Storage] Iniciando upload para ${BUCKET_NAME}/${fileName}`)

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Usar upsert para substituir se já existir
    })

    if (error) {
      console.error("[Storage] Erro ao fazer upload:", error)
      return null
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    console.log("[Storage] URL pública gerada:", urlData.publicUrl)

    return urlData.publicUrl
  } catch (error) {
    console.error("[Storage] Erro ao fazer upload:", error)
    return null
  }
}

/**
 * Remove uma imagem do Supabase Storage
 * @param url URL pública da imagem
 * @returns true se a remoção foi bem-sucedida, false caso contrário
 */
export async function removeImage(url: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient()

    // Extrair o caminho do arquivo da URL
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(new RegExp(`${BUCKET_NAME}/object/public/(.+)$`))

    if (!pathMatch || !pathMatch[1]) {
      console.error("[Storage] Formato de URL inválido:", url)
      return false
    }

    const filePath = decodeURIComponent(pathMatch[1])
    console.log(`[Storage] Tentando remover arquivo: ${filePath}`)

    // Remover o arquivo
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error("[Storage] Erro ao remover imagem:", error)
      return false
    }

    console.log("[Storage] Imagem removida com sucesso")
    return true
  } catch (error) {
    console.error("[Storage] Erro ao remover imagem:", error)
    return false
  }
}
