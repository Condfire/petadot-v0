import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[API] Configuração do Supabase não encontrada")
      return NextResponse.json({ error: "Configuração do Supabase não encontrada" }, { status: 500 })
    }

    console.log("[API] Iniciando verificação/criação do bucket")

    // Usar service role key para ter permissões administrativas
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const BUCKET_NAME = "petadot-images"

    // Verificar se o bucket já existe
    console.log("[API] Verificando se o bucket existe:", BUCKET_NAME)
    const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(BUCKET_NAME)

    if (getBucketError) {
      console.log("[API] Bucket não encontrado, criando:", getBucketError.message)

      // Criar o bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"],
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      })

      if (createError) {
        console.error("[API] Erro ao criar bucket:", createError)
        return NextResponse.json({ error: "Erro ao criar bucket", details: createError }, { status: 500 })
      }

      console.log("[API] Bucket criado com sucesso:", newBucket)

      // Criar políticas de acesso
      try {
        console.log("[API] Configurando políticas de acesso")

        // Permitir visualização pública
        await supabase.rpc("create_storage_policy", {
          bucket_id: BUCKET_NAME,
          policy_name: "Public Access",
          definition: "bucket_id = '" + BUCKET_NAME + "'",
          policy_operation: "SELECT",
        })

        // Permitir upload para usuários autenticados
        await supabase.rpc("create_storage_policy", {
          bucket_id: BUCKET_NAME,
          policy_name: "Authenticated Upload",
          definition: "bucket_id = '" + BUCKET_NAME + "' AND auth.role() = 'authenticated'",
          policy_operation: "INSERT",
        })

        // Permitir que usuários atualizem suas próprias imagens
        await supabase.rpc("create_storage_policy", {
          bucket_id: BUCKET_NAME,
          policy_name: "Owner Update",
          definition: "bucket_id = '" + BUCKET_NAME + "' AND auth.uid()::text = (storage.foldername(name))[2]",
          policy_operation: "UPDATE",
        })

        // Permitir que usuários deletem suas próprias imagens
        await supabase.rpc("create_storage_policy", {
          bucket_id: BUCKET_NAME,
          policy_name: "Owner Delete",
          definition: "bucket_id = '" + BUCKET_NAME + "' AND auth.uid()::text = (storage.foldername(name))[2]",
          policy_operation: "DELETE",
        })

        console.log("[API] Políticas configuradas com sucesso")
      } catch (policyError) {
        console.warn("[API] Erro ao configurar políticas:", policyError)
        // Continuar mesmo com erro nas políticas
      }

      return NextResponse.json({
        success: true,
        message: "Bucket criado com sucesso",
        bucket: newBucket,
      })
    }

    console.log("[API] Bucket já existe:", existingBucket)
    return NextResponse.json({
      success: true,
      message: "Bucket já existe",
      bucket: existingBucket,
    })
  } catch (error: any) {
    console.error("[API] Erro inesperado:", error)
    return NextResponse.json({ error: "Erro inesperado", details: error.message }, { status: 500 })
  }
}
