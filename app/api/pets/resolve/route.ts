import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { updatePetStatus } from "@/app/actions/pet-status"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter dados do corpo da requisição
    const { petId, petType, status, notes } = await request.json()

    if (!petId || !petType || !status) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Chamar a função de atualização de status
    const result = await updatePetStatus(petId, petType, status, notes)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Falha ao atualizar o status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar a resolução do pet:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
