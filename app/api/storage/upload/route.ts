import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Usar a chave de serviço para contornar as políticas de RLS
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET_NAME = "petadot-images"

export async function POST(request: NextRequest) {
  try {
    // Verificar se o bucket existe, se não, criar
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME)

    if (bucketError && bucketError.message.includes("not found")) {
      console.log("Bucket não encontrado, criando...")
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })
    }

    // Obter o formulário com a imagem
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = (formData.get("category") as string) || "pets"
    const userId = (formData.get("userId") as string) || "public"

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Validar o arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 5MB)" }, { status: 400 })
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

    // Converter o arquivo para um ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Fazer o upload usando a chave de serviço (ignora RLS)
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Erro no upload:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obter a URL pública
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (error: any) {
    console.error("Erro inesperado:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
