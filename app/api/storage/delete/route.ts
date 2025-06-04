import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Usar a chave de serviço para contornar as políticas de RLS
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET_NAME = "petadot-images"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL não fornecida" }, { status: 400 })
    }

    // Extrair o caminho do arquivo da URL
    let filePath = url
    if (url.includes(BUCKET_NAME)) {
      const pathMatch = url.match(new RegExp(`${BUCKET_NAME}/(.+)$`))
      if (pathMatch) {
        filePath = pathMatch[1]
      }
    }

    // Remover o arquivo usando a chave de serviço (ignora RLS)
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error("Erro ao remover arquivo:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro inesperado:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
