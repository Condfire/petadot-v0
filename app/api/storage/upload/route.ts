import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Usar a chave de serviço para contornar as políticas de RLS
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET_NAME = "petadot-images"

// Define max size for events, matching client-side config for events
const MAX_EVENT_IMAGE_SIZE = 8 * 1024 * 1024 // 8MB

export async function POST(request: NextRequest) {
  console.log("[API/Upload] Recebendo requisição de upload...")
  try {
    // Obter o formulário com a imagem
    console.log("[API/Upload] Processando formData...")
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = (formData.get("category") as string) || "pets" // Default to 'pets' if not provided
    const userId = (formData.get("userId") as string) || "public" // Recebe o userId do cliente

    if (!file) {
      console.error("[API/Upload] Nenhum arquivo enviado.")
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    console.log(`[API/Upload] Arquivo recebido: ${file.name}, tipo: ${file.type}, tamanho: ${file.size} bytes`)
    console.log(`[API/Upload] Categoria: ${category}, User ID: ${userId}`) // Log do userId recebido

    // Validar o arquivo
    if (!file.type.startsWith("image/")) {
      console.error("[API/Upload] Validação falhou: Apenas imagens são permitidas.")
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 })
    }

    // Use the appropriate max size based on category if possible, or a general safe max.
    // For simplicity, since the issue is with event upload, we'll use MAX_EVENT_IMAGE_SIZE here.
    // A more robust solution would involve passing the category's max size from client or having a shared config.
    if (file.size > MAX_EVENT_IMAGE_SIZE) {
      console.error(
        `[API/Upload] Validação falhou: Arquivo muito grande (máx. ${MAX_EVENT_IMAGE_SIZE / (1024 * 1024)}MB).`,
      )
      return NextResponse.json(
        { error: `Arquivo muito grande (máx. ${MAX_EVENT_IMAGE_SIZE / (1024 * 1024)}MB)` },
        { status: 400 },
      )
    }

    // Gerar um nome de arquivo único
    const timestamp = Date.now()
    const uuid = uuidv4().substring(0, 8)
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
      .substring(0, 20)

    const filePath = `${category}/${userId}/${cleanName}-${timestamp}-${uuid}.${extension}`
    console.log(`[API/Upload] Caminho gerado para upload: ${filePath}`)

    // Converter o arquivo para um ArrayBuffer
    console.log("[API/Upload] Convertendo arquivo para ArrayBuffer...")
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    console.log(`[API/Upload] Conversão para ArrayBuffer concluída. Tamanho do buffer: ${buffer.byteLength} bytes.`)

    // Fazer o upload usando a chave de serviço (ignora RLS)
    console.log(`[API/Upload] Iniciando upload para Supabase Storage. Bucket: ${BUCKET_NAME}, Path: ${filePath}`)
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("[API/Upload] Erro no upload para Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API/Upload] Upload para Supabase concluído com sucesso. Data:", data)

    // Obter a URL pública
    console.log("[API/Upload] Obtendo URL pública...")
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)
    console.log(`[API/Upload] URL pública gerada:`, urlData)

    if (!urlData || !urlData.publicUrl) {
      console.error("[API/Upload] Erro ao gerar URL pública: urlData ou publicUrl é nulo/indefinido.")
      return NextResponse.json({ error: "Erro ao gerar URL pública" }, { status: 500 })
    }

    console.log(`[API/Upload] Upload finalizado com sucesso. URL: ${urlData.publicUrl}`)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (error: any) {
    console.error("[API/Upload] Erro inesperado na requisição:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
