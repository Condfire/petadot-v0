import { createClient } from "@supabase/supabase-js"

// Criar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Nome do bucket no Supabase Storage
const BUCKET_NAME = "sppetadot"

// Função para fazer upload de um arquivo
export async function uploadFile(file: File, folder = "uploads") {
  try {
    // Gerar nome de arquivo único
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}.${fileExt}`

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Erro ao fazer upload:", error.message)
      return { error: error.message }
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    return { url: urlData.publicUrl }
  } catch (error: any) {
    console.error("Erro ao fazer upload:", error.message)
    return { error: error.message }
  }
}

// Função para fazer upload de uma imagem de ONG
export async function uploadOngLogo(file: File, ongId: string) {
  try {
    // Gerar nome de arquivo padronizado para logos de ONGs
    const fileExt = file.name.split(".").pop()
    const fileName = `ongs/logos/${ongId}.${fileExt}`

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Sobrescrever se já existir
    })

    if (error) {
      console.error("Erro ao fazer upload do logo da ONG:", error.message)
      return { error: error.message }
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    return { url: urlData.publicUrl }
  } catch (error: any) {
    console.error("Erro ao fazer upload do logo da ONG:", error.message)
    return { error: error.message }
  }
}

// Função para converter uma imagem para base64
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
