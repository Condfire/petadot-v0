import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Você precisa estar logado para fazer uma denúncia" }, { status: 401 })
    }

    const { petId, reason, details } = await request.json()

    // Validate required fields
    if (!petId || !reason) {
      return NextResponse.json({ error: "Pet ID e motivo são obrigatórios" }, { status: 400 })
    }

    // Check if pet exists
    const { data: pet, error: petError } = await supabase.from("pets").select("id, name").eq("id", petId).single()

    if (petError || !pet) {
      return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 })
    }

    // Check if user has already reported this pet
    const { data: existingReport, error: checkError } = await supabase
      .from("pet_reports")
      .select("id")
      .eq("pet_id", petId)
      .eq("user_id", session.user.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing report:", checkError)
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }

    if (existingReport) {
      return NextResponse.json({ error: "Você já denunciou este pet anteriormente" }, { status: 409 })
    }

    // Create the report
    const { data: report, error: insertError } = await supabase
      .from("pet_reports")
      .insert({
        pet_id: petId,
        user_id: session.user.id,
        reason,
        details,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating report:", insertError)
      return NextResponse.json({ error: "Erro ao criar denúncia" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Denúncia criada com sucesso",
      reportId: report.id,
    })
  } catch (error) {
    console.error("Error in report API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
