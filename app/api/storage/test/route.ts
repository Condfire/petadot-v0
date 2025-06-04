import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Configuração do Supabase não encontrada" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Testar acesso ao bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({ error: "Erro ao listar buckets", details: bucketsError }, { status: 500 })
    }

    // Verificar se o bucket petadot-images existe
    const petadotBucket = buckets?.find((bucket) => bucket.id === "petadot-images")

    return NextResponse.json({
      success: true,
      buckets: buckets?.map((b) => ({ id: b.id, name: b.name, public: b.public })),
      petadotBucketExists: !!petadotBucket,
      petadotBucket: petadotBucket || null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Erro inesperado", details: error.message }, { status: 500 })
  }
}
