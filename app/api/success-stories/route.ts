import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { message: "Você precisa estar logado para compartilhar uma história" },
        { status: 401 },
      )
    }

    const userId = user.id
    const formData = await request.formData()

    const title = formData.get("title") as string
    const story = formData.get("story") as string
    const petId = formData.get("petId") as string
    const petType = formData.get("petType") as string
    const imageUrl = (formData.get("imageUrl") as string) || null

    if (!title || !story || !petId || !petType) {
      return NextResponse.json({ message: "Todos os campos obrigatórios devem ser preenchidos" }, { status: 400 })
    }

    // Verificar se o tipo de pet é válido
    if (!["adoption", "lost", "found"].includes(petType)) {
      return NextResponse.json({ message: "Tipo de pet inválido" }, { status: 400 })
    }

    // Verificar se o pet existe e pertence ao usuário
    let tableName = ""
    switch (petType) {
      case "adoption":
        tableName = "pets"
        break
      case "lost":
        tableName = "pets_lost"
        break
      case "found":
        tableName = "pets_found"
        break
    }

    const { data: pet, error: petError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", petId)
      .eq("user_id", userId)
      .single()

    if (petError || !pet) {
      console.error("Erro ao verificar pet:", petError)
      return NextResponse.json({ message: "Pet não encontrado ou não pertence ao usuário" }, { status: 404 })
    }

    // Inserir a história
    const { data, error } = await supabase
      .from("success_stories")
      .insert([
        {
          title,
          story,
          pet_id: petId,
          pet_type: petType,
          user_id: userId,
          image_url: imageUrl,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao criar história:", error)
      return NextResponse.json({ message: "Erro ao salvar a história. Tente novamente mais tarde." }, { status: 500 })
    }

    // Revalidar caminhos relevantes
    revalidatePath("/historias")
    revalidatePath(`/historias/${data[0].id}`)
    revalidatePath("/my-pets")

    return NextResponse.json({ success: true, id: data[0].id })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ message: "Ocorreu um erro ao processar sua solicitação" }, { status: 500 })
  }
}
