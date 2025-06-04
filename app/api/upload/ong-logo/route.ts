import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60 // Aumentar o tempo máximo para 60 segundos

export async function POST(request: NextRequest) {
  console.log("[Server] Iniciando processamento da requisição de upload")

  try {
    // Obter o token de autorização do cabeçalho
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Server] Erro de autenticação: Token não fornecido ou formato inválido")
      return NextResponse.json({ error: "Não autorizado. Token não fornecido ou formato inválido." }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    console.log("[Server] Token de autorização recebido")

    // Criar cliente Supabase com o token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("[Server] Erro de configuração: Variáveis de ambiente do Supabase não definidas")
      return NextResponse.json({ error: "Erro de configuração do servidor" }, { status: 500 })
    }

    console.log("[Server] Criando cliente Supabase")
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Verificar autenticação
    console.log("[Server] Verificando autenticação do usuário")
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      console.error("[Server] Erro de autenticação:", userError?.message || "Usuário não encontrado")
      return NextResponse.json({ error: "Não autorizado. Faça login novamente." }, { status: 401 })
    }

    console.log("[Server] Usuário autenticado:", userData.user.id)

    // Obter o formulário com o arquivo e o ID da ONG
    console.log("[Server] Processando formData")
    const formData = await request.formData()
    const file = formData.get("file") as File
    const ongId = formData.get("ongId") as string

    if (!file || !ongId) {
      console.error("[Server] Erro de validação: Arquivo ou ID da ONG não fornecido")
      return NextResponse.json({ error: "Arquivo ou ID da ONG não fornecido" }, { status: 400 })
    }

    console.log("[Server] Arquivo recebido:", file.name, file.type, file.size, "bytes")
    console.log("[Server] ONG ID:", ongId)

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error("[Server] Erro de validação: Arquivo muito grande")
      return NextResponse.json({ error: "Arquivo muito grande (máximo 5MB)" }, { status: 400 })
    }

    // Verificar tipo do arquivo
    if (!file.type.startsWith("image/")) {
      console.error("[Server] Erro de validação: Arquivo não é uma imagem")
      return NextResponse.json({ error: "Arquivo não é uma imagem" }, { status: 400 })
    }

    // Determinar a extensão do arquivo
    const fileExt = file.name.split(".").pop() || "jpg"

    // Caminho do arquivo seguindo o formato especificado
    const filePath = `ongs/${ongId}.${fileExt}`

    console.log(`[Server] Iniciando upload para bucket: sppetadot, caminho: ${filePath}`)

    // Converter o arquivo para um buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Fazer upload do arquivo usando o cliente do servidor
    console.log("[Server] Enviando arquivo para o Supabase Storage")
    const { data, error } = await supabase.storage.from("sppetadot").upload(filePath, buffer, {
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error("[Server] Erro no upload:", error)
      return NextResponse.json({ error: `Erro ao fazer upload: ${error.message}` }, { status: 500 })
    }

    console.log("[Server] Upload concluído com sucesso:", data?.path)

    // Obter URL pública
    const { data: urlData } = supabase.storage.from("sppetadot").getPublicUrl(filePath)

    // Adicionar timestamp para evitar cache
    const finalUrl = `${urlData.publicUrl}?t=${Date.now()}`
    console.log("[Server] URL pública gerada:", finalUrl)

    return NextResponse.json({
      success: true,
      url: finalUrl,
      message: "Upload concluído com sucesso",
    })
  } catch (error: any) {
    console.error("[Server] Erro crítico:", error)
    // Garantir que sempre retornamos um JSON válido
    return NextResponse.json(
      {
        error: `Erro inesperado: ${error.message}`,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
