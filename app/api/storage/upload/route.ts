import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Usar a chave de serviço para contornar as políticas de RLS
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "[API/Upload] Supabase credentials are not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
})

const BUCKET_NAME = "petadot-images"

// Configurações de tamanho por categoria
const CATEGORY_LIMITS = {
  pets: 5 * 1024 * 1024, // 5MB
  events: 8 * 1024 * 1024, // 8MB
  avatars: 2 * 1024 * 1024, // 2MB
  ongs: 3 * 1024 * 1024, // 3MB
  temp: 10 * 1024 * 1024, // 10MB
} as const

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log("[API/Upload] Recebendo requisição de upload...")

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "[API/Upload] Supabase credentials are not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    )
    return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 })
  }

  try {
    // Timeout para processamento do FormData
    const formDataPromise = request.formData()
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout ao processar dados")), 10000)
    })

    const formData = (await Promise.race([formDataPromise, timeoutPromise])) as FormData

    const file = formData.get("file") as File
    const category = (formData.get("category") as string) || "pets"
    const userId = (formData.get("userId") as string) || "public"

    console.log(`[API/Upload] Processamento FormData: ${Date.now() - startTime}ms`)

    if (!file) {
      console.error("[API/Upload] Nenhum arquivo enviado.")
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    console.log(`[API/Upload] Arquivo: ${file.name}, tipo: ${file.type}, tamanho: ${(file.size / 1024).toFixed(1)}KB`)

    // Validações rápidas
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 })
    }

    const maxSize = CATEGORY_LIMITS[category as keyof typeof CATEGORY_LIMITS] || CATEGORY_LIMITS.pets
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      return NextResponse.json({ error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` }, { status: 400 })
    }

    // Gerar caminho otimizado
    const timestamp = Date.now()
    const uuid = uuidv4().substring(0, 8)
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
      .substring(0, 15) // Reduzido para melhor performance

    const filePath = `${category}/${userId}/${cleanName}-${timestamp}-${uuid}.${extension}`

    console.log(`[API/Upload] Preparação: ${Date.now() - startTime}ms`)

    // Converter arquivo de forma otimizada
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    console.log(`[API/Upload] Conversão buffer: ${Date.now() - startTime}ms`)

    // Upload com timeout otimizado
    const uploadStartTime = Date.now()

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "31536000", // 1 ano
      upsert: true,
    })

    console.log(`[API/Upload] Upload Supabase: ${Date.now() - uploadStartTime}ms`)

    if (error) {
      console.error("[API/Upload] Erro no upload:", error.message)
      return NextResponse.json(
        {
          error: `Erro no upload: ${error.message}`,
        },
        { status: 500 },
      )
    }

    // Obter URL pública (operação rápida)
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    if (!urlData?.publicUrl) {
      console.error("[API/Upload] Erro ao gerar URL pública")
      return NextResponse.json({ error: "Erro ao gerar URL pública" }, { status: 500 })
    }

    const totalTime = Date.now() - startTime
    console.log(`[API/Upload] ✅ Upload concluído em ${totalTime}ms - URL: ${urlData.publicUrl}`)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      processingTime: totalTime,
    })
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`[API/Upload] ❌ Erro após ${totalTime}ms:`, error.message)

    // Mensagens de erro mais específicas
    let errorMessage = "Erro interno do servidor"

    if (error.message.includes("Timeout")) {
      errorMessage = "O servidor demorou a responder. Tente novamente com uma imagem menor."
    } else if (error.message.includes("network") || error.message.includes("fetch")) {
      errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
    } else if (error.message.includes("size") || error.message.includes("large")) {
      errorMessage = "Imagem muito grande. Tente com uma imagem menor."
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

// Configurar timeout para a função
export const maxDuration = 60 // 60 segundos
