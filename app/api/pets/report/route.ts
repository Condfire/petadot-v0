import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { petId, reason, additionalDetails } = await request.json()

    // Validate required fields
    if (!petId || !reason) {
      return NextResponse.json({ error: "Pet ID e motivo são obrigatórios" }, { status: 400 })
    }

    // Create Supabase client with user session
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
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
      .eq("user_id", user.id)
      .single()

    if (existingReport) {
      return NextResponse.json({ error: "Você já denunciou este pet" }, { status: 409 })
    }

    // Create the report
    const { data: report, error: reportError } = await supabase
      .from("pet_reports")
      .insert({
        pet_id: petId,
        user_id: user.id,
        reason: reason,
        additional_details: additionalDetails,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (reportError) {
      console.error("Erro ao criar denúncia:", reportError)
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }

    // Log the report for admin monitoring
    console.log(
      `Nova denúncia criada: Pet ${pet.name} (${petId}) denunciado por usuário ${user.id} - Motivo: ${reason}`,
    )

    return NextResponse.json({
      success: true,
      message: "Denúncia enviada com sucesso",
      reportId: report.id,
    })
  } catch (error) {
    console.error("Erro na API de denúncia:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
