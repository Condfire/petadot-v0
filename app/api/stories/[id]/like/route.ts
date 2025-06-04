import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const storyId = params.id

    // Verificar se o ID da história foi fornecido
    if (!storyId) {
      return NextResponse.json({ error: "ID da história não fornecido" }, { status: 400 })
    }

    // Criar cliente Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Buscar a história atual
    const { data: story, error: storyError } = await supabase
      .from("pet_stories")
      .select("likes")
      .eq("id", storyId)
      .single()

    if (storyError) {
      console.error("Erro ao buscar história:", storyError)
      return NextResponse.json({ error: "História não encontrada" }, { status: 404 })
    }

    // Incrementar o contador de likes
    const currentLikes = story.likes || 0
    const newLikes = currentLikes + 1

    // Atualizar a história
    const { error: updateError } = await supabase.from("pet_stories").update({ likes: newLikes }).eq("id", storyId)

    if (updateError) {
      console.error("Erro ao atualizar curtidas:", updateError)
      return NextResponse.json({ error: "Erro ao curtir a história" }, { status: 500 })
    }

    // Retornar o novo número de curtidas
    return NextResponse.json({ likes: newLikes })
  } catch (error) {
    console.error("Erro ao processar curtida:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
